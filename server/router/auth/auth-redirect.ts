import config from '../../config'
import { RegisterStudentPayload } from '../../utils/auth-utils'

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
    studentData: Partial<RegisterStudentPayload> = {},
    errorMessage?: string
  ) {
    if (isLogin) {
      return this.loginFailureRedirect(provider)
    }

    delete studentData.ip
    delete studentData.issuer
    delete studentData.password
    delete studentData.profileId

    const params = new URLSearchParams({
      error: errorMessage ?? 'Unknown server error.',
    })
    for (const key of Object.keys(studentData)) {
      const value = studentData[key as keyof RegisterStudentPayload]
      if (value) params.append(key, value.toString())
    }

    return this.baseRedirect + '/sign-up/student/account?' + params.toString()
  }

  static loginFailureRedirect(provider: string) {
    const params = new URLSearchParams({
      400: 'true',
      provider: provider ?? '',
    })
    return this.baseRedirect + '/login?' + params.toString()
  }
}
