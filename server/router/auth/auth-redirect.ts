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

  private static safePath(path: unknown, fallback: string) {
    if (
      typeof path !== 'string' ||
      // The path is appended straight onto the host, so without a leading "/"
      // a value like "@example.com" becomes the host.
      path[0] !== '/' ||
      // "//" and "/\" would point at another host if the path were ever used
      // without the base.
      path[1] === '/' ||
      path[1] === '\\'
    ) {
      return fallback
    }
    return path
  }

  static successRedirect(redirect?: string) {
    return this.baseRedirect + this.safePath(redirect, '/')
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
    errorRedirect: string | undefined,
    userData: Partial<RegisterStudentPayload | RegisterTeacherPayload> = {},
    errorMessage?: string
  ) {
    if (provider === 'clever') {
      errorRedirect = `/clever-signin-instructions`
    }

    if (isLogin) {
      return this.loginFailureRedirect(provider, errorRedirect)
    }

    delete userData.ip
    delete userData.password

    const params = new URLSearchParams({
      error: errorMessage ?? 'Unknown server error.',
    })
    for (const key of Object.keys(userData)) {
      const value = userData[key as keyof typeof userData]
      if (value) params.append(key, value.toString())
    }

    return (
      this.baseRedirect +
      this.safePath(errorRedirect, '/') +
      '?' +
      params.toString()
    )
  }

  static loginFailureRedirect(provider: string, errorRedirect?: string) {
    const params = new URLSearchParams({
      400: 'true',
      provider: provider ?? '',
    })
    return (
      this.baseRedirect +
      this.safePath(errorRedirect, '/login') +
      '?' +
      params.toString()
    )
  }
}
