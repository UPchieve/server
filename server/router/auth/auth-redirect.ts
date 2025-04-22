import config from '../../config'
import {
  RegisterStudentPayload,
  RegisterTeacherPayload,
} from '../../utils/auth-utils'

export class AuthRedirect {
  private static baseRedirect = this.getBaseRedirect()

  private static getBaseRedirect() {
    let protocol
    if (config.NODE_ENV === 'dev') {
      protocol = 'http'
    } else {
      protocol = 'https'
    }
    return `${protocol}://${config.client.host}`
  }

  static successRedirect(redirect?: string) {
    return this.baseRedirect + (redirect ?? '')
  }

  static emailRedirect(validator: string) {
    const params = new URLSearchParams({
      isCleverStudentEmailRedirect: 'true',
      validator,
    })
    return this.baseRedirect + '/sign-up/student/account?' + params.toString()
  }

  static failureRedirect(
    isLogin: boolean,
    provider: string,
    errorRedirect: string,
    userData: Partial<RegisterStudentPayload | RegisterTeacherPayload> = {},
    errorMessage?: string
  ) {
    if (isLogin) {
      return this.loginFailureRedirect(provider)
    }

    delete userData.ip
    delete userData.issuer
    delete userData.password
    delete userData.profileId

    const params = new URLSearchParams({
      error: errorMessage ?? 'Unknown server error.',
    })
    for (const key of Object.keys(userData)) {
      const value = userData[key as keyof typeof userData]
      if (value) params.append(key, value.toString())
    }

    return this.baseRedirect + (errorRedirect ?? '') + '?' + params.toString()
  }

  static loginFailureRedirect(provider: string) {
    const params = new URLSearchParams({
      400: 'true',
      provider: provider ?? '',
    })
    return this.baseRedirect + '/login?' + params.toString()
  }
}
