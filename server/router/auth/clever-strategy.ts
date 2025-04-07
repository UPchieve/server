import axios, { AxiosRequestConfig } from 'axios'
import { isEmpty } from 'lodash'
import passport from 'passport'
import {
  Strategy as OAuth2Strategy,
  StrategyOptionsWithRequest,
  VerifyFunctionWithRequest,
} from 'passport-oauth2'
import config from '../../config'
import logger from '../../logger'
import { Uuid } from '../../models/pgUtils'
import { UserRole } from '../../models/User'
import * as CleverAPIService from '../../services/CleverAPIService'
import * as SchoolService from '../../services/SchoolService'

export type TCleverPassportProfile = passport.Profile & {
  issuer: string
  schoolId?: Uuid
  teacher?: {
    classes: CleverAPIService.TCleverSectionData[]
    students: CleverAPIService.TCleverStudentData[]
  }
  userType: UserRole
}

export default class CleverStrategy extends OAuth2Strategy {
  name: string = 'clever'
  static baseUrl: string = 'https://clever.com'

  constructor(
    options: Partial<StrategyOptionsWithRequest>,
    verify: VerifyFunctionWithRequest
  ) {
    options.authorizationURL = `${CleverStrategy.baseUrl}/oauth/authorize`
    options.tokenURL = `${CleverStrategy.baseUrl}/oauth/tokens`
    options.clientID = config.cleverClientId
    options.clientSecret = config.cleverClientSecret
    options.passReqToCallback = true
    options.customHeaders = {
      Authorization:
        'Basic ' +
        Buffer.from(
          config.cleverClientId + ':' + config.cleverClientSecret
        ).toString('base64'),
    }
    super(options as StrategyOptionsWithRequest, verify)
  }

  async userProfile(accessToken: string, done: Function) {
    try {
      const user = await CleverAPIService.getUserProfile(accessToken)
      const userType = this.getUserType(user.roles)
      const cleverSchoolId = user.roles.hasOwnProperty(userType)
        ? (user.roles[userType as keyof typeof user.roles]?.school ?? '')
        : ''
      const upchieveSchoolId = await this.getSchoolId(
        cleverSchoolId,
        accessToken
      )

      const profile: TCleverPassportProfile = {
        id: user.id,
        displayName: user.name.first + ' ' + user.name.last,
        emails: [{ value: user.email ?? '' }],
        issuer: CleverStrategy.baseUrl,
        name: {
          familyName: user.name.last,
          givenName: user.name.first,
        },
        provider: 'Clever',
        teacher: CleverAPIService.isTeacher(userType)
          ? {
              classes: await CleverAPIService.getTeacherClasses(
                user.id,
                accessToken
              ),
              students: await CleverAPIService.getTeacherStudents(
                user.id,
                accessToken
              ),
            }
          : undefined,
        schoolId: upchieveSchoolId,
        userType,
      }

      return done(null, profile)
    } catch (error) {
      logger.error(`Error getting Clever user profile: ${error}`)
      done(error as Error, false, {
        errorMessage: 'Failed to get user profile from Clever.',
      })
    }
  }

  async getSchoolId(cleverSchoolId: string, accessToken: string) {
    if (!cleverSchoolId) return

    const cleverSchool = await CleverAPIService.getSchool(
      cleverSchoolId,
      accessToken
    )
    if (cleverSchool.nces_id) {
      const upchieveSchool = await SchoolService.getSchoolByNcesId(
        cleverSchool.nces_id
      )
      return upchieveSchool?.id
    }
  }

  getUserType(roles: { student?: Object; teacher?: Object }): UserRole {
    if (!isEmpty(roles.teacher ?? {})) {
      return 'teacher'
    }

    return 'student'
  }
}
