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

  static get successRedirect() {
    return this.getBaseRedirect()
  }

  static get loginFailureRedirect() {
    return `${this.getBaseRedirect()}/login?400=true`
  }

  static registerFailureRedirect(
    studentData: Partial<RegisterStudentPayload>,
    errMsg?: string
  ) {
    const params = new URLSearchParams({
      error: errMsg ?? '',
    })
    if (studentData.email) {
      params.append('email', studentData.email)
    }
    if (studentData.highSchoolId) {
      params.append('highSchoolId', studentData.highSchoolId)
    }
    if (studentData.zipCode) {
      params.append('zipCode', studentData.zipCode)
    }
    if (studentData.currentGrade) {
      params.append('currentGrade', studentData.currentGrade)
    }
    if (studentData.studentPartnerOrg) {
      params.append('partner', studentData.studentPartnerOrg)
    }
    return `${this.getBaseRedirect()}/sign-up/student/account?${params.toString()}`
  }

  static registerPartnerStudentFailureRedirect(
    studentData: Partial<RegisterStudentPayload>,
    errMsg?: string
  ) {
    const params = new URLSearchParams({
      sso: 'google',
      error: errMsg ?? '',
    })
    return `${this.getBaseRedirect()}/signup/student/${
      studentData.studentPartnerOrg
    }?${params.toString()}`
  }
}
