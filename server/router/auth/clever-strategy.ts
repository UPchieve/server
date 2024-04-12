import axios from 'axios'
import passport from 'passport'
import {
  Strategy as OAuth2Strategy,
  StrategyOptionsWithRequest,
  VerifyFunctionWithRequest,
} from 'passport-oauth2'
import config from '../../config'

interface ICleverMeResponse {
  type: 'user'
  data: {
    id: string
    district: string
    type: 'user'
    authorized_by: 'district'
  }
  links: { rel: string; uri: string }[]
}

interface ICleverUserInfoResponse {
  data: {
    created: Date
    district: string
    email: string
    last_modified: Date
    name: {
      first: string
      last: string
      middle: string
    }
    roles: {
      student: Object
    }
    id: string
  }
  links: { rel: string; uri: string }[]
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
    const apiBaseUrl = 'https://api.clever.com'
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }

    try {
      const meUrl = `${apiBaseUrl}/v3.0/me`
      const meResponse = await axios.get<ICleverMeResponse>(meUrl, options)

      const canonicalLink = meResponse.data.links.find(link => {
        if (link.rel === 'canonical') return true
      })
      if (!canonicalLink) {
        return done(null, false, 'Failed to get user profile.')
      }

      const userInfoUrl = apiBaseUrl + canonicalLink.uri
      const userInfoResponse = await axios.get<ICleverUserInfoResponse>(
        userInfoUrl,
        options
      )
      const userData = userInfoResponse.data.data

      const profile: passport.Profile & { issuer: string } = {
        id: userData.id,
        displayName: userData.name.first + ' ' + userData.name.last,
        emails: [{ value: userData.email }],
        issuer: CleverStrategy.baseUrl,
        name: {
          familyName: userData.name.last,
          givenName: userData.name.first,
        },
        provider: 'Clever',
      }

      return done(null, profile)
    } catch (error) {
      // TODO: Log error.
      done(error as Error)
    }
  }
}
