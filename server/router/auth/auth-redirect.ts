import config from '../../config'
import { RegisterStudentPayload } from '../../utils/auth-utils'

export class AuthRedirect {
  private static _baseRedirect: string

  private static getBaseRedirect() {
    if (!this._baseRedirect) {
      let protocol
      if (config.NODE_ENV === 'dev') {
        protocol = 'http'
      } else {
        protocol = 'https'
      }
      this._baseRedirect = `${protocol}://${config.client.host}`
    }

    return this._baseRedirect
  }

  static successRedirect(redirect?: string) {
    return this.getBaseRedirect() + (redirect ?? '')
  }

  static failureRedirect(
    isLogin: boolean,
    provider: string,
    studentData: Partial<RegisterStudentPayload> = {},
    errorMsg?: string
  ) {
    if (isLogin) {
      return this.loginFailureRedirect(provider)
    }

    delete studentData.ip
    delete studentData.issuer
    delete studentData.password
    delete studentData.profileId

    const params = new URLSearchParams({
      error: errorMsg ?? 'Unknown server error.',
    })
    for (const key of Object.keys(studentData)) {
      const value = studentData[key as keyof RegisterStudentPayload]
      if (value) params.append(key, value.toString())
    }

    return (
      this.getBaseRedirect() + '/sign-up/student/account?' + params.toString()
    )
  }

  static loginFailureRedirect(provider: string) {
    const params = new URLSearchParams({
      400: 'true',
      provider: provider ?? '',
    })
    return this.getBaseRedirect() + '/login?' + params.toString()
  }
}
