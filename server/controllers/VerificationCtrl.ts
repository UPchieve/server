const StudentService = require('../services/StudentService')
const TwilioService = require('../services/twilio')
const { VERIFICATION_METHOD } = require('../constants')

module.exports = {
  initiateStudentVerification: async ({
    firstName,
    sendTo,
    verificationMethod
  }) => {
    return TwilioService.sendStudentVerification({
      sendTo,
      verificationMethod,
      firstName
    })
  },

  confirmStudentVerification: async ({
    userId,
    verificationCode,
    sendTo,
    verificationMethod
  }) => {
    const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
    try {
      const verificationResult = await TwilioService.confirmStudentVerification(
        sendTo,
        verificationCode
      )
      const isVerified = verificationResult.valid
      if (isVerified) {
        const update = { verified: true }
        if (isPhoneVerification) {
          update.verifiedPhone = true
          update.phone = sendTo
        } else update.verifiedEmail = true
        await StudentService.updateStudent({ _id: userId }, update)
      }
      return isVerified
    } catch (error) {
      throw error
    }
  }
}
