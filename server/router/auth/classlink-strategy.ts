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
import * as ClassLinkApiService from '../../services/ClassLinkApiService'
import * as SchoolService from '../../services/SchoolService'
import { SsoProvider } from '../../utils/auth-utils'

export type ClassLinkPassportProfile = passport.Profile & {
  issuer: string
  userType: UserRole
  schoolId?: Uuid
}

// TODO: Centralize shared logic with CleverStrategy to helpers
export default class ClassLinkStrategy extends OAuth2Strategy {
  name: SsoProvider = 'classlink'
  static baseUrl: string = 'https://launchpad.classlink.com'
  static authPath: string = '/oauth2/v2/auth'
  static tokenPath: string = '/oauth2/v2/token'

  constructor(
    options: Partial<StrategyOptionsWithRequest>,
    verify: VerifyFunctionWithRequest
  ) {
    options.authorizationURL = `${ClassLinkStrategy.baseUrl + ClassLinkStrategy.authPath}`
    options.tokenURL = `${ClassLinkStrategy.baseUrl + ClassLinkStrategy.tokenPath}`
    options.clientID = config.classlinkClientId
    options.clientSecret = config.classlinkClientSecret
    options.passReqToCallback = true
    options.scope = 'full,profile,oneroster,openid'

    super(options as StrategyOptionsWithRequest, verify)
  }

  async userProfile(accessToken: string, done: Function) {
    try {
      const user = await ClassLinkApiService.getUserProfile(accessToken)
      const userType = this.getUserType(user.Role)

      //We may need a mapping for orgID (school id) and tenantID (district ID) to nces_id later on

      const profile: ClassLinkPassportProfile = {
        id: `${user.TenantId}:${user.SourcedId}`,
        displayName: user.DisplayName,
        emails: [{ value: user.Email ?? '' }],
        issuer: ClassLinkStrategy.baseUrl,
        name: {
          familyName: user.LastName,
          givenName: user.FirstName,
        },
        provider: 'ClassLink',
        userType,
      }
      return done(null, profile)
    } catch (error) {
      logger.error(`Error getting ClassLink user profile: ${error}`)
      done(error as Error, false, {
        errorMessage: 'Failed to get user profile from ClassLink.',
      })
    }
  }

  getUserType(role: ClassLinkApiService.ClassLinkProfileRole): UserRole {
    if (role === 'Tenant Administrator')
      throw new Error(`Unsupported ClassLink role: ${role}`)
    return role.toLowerCase() as UserRole
  }
}
