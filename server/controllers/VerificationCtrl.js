const crypto = require('crypto')
const MailService = require('../services/MailService')
const User = require('../models/User')
const StudentService = require('../services/StudentService')
const TwilioService = require('../services/twilio')
const { VERIFICATION_METHOD } = require('../constants')

module.exports = {
  initiateVerification: async ({ user }, callback) => {
    if (user.verified) {
      throw new Error('User is already verified')
    }

    // Get the user's verification token
    let { verificationToken } = await User.findOne({ _id: user._id })
      .select('verificationToken')
      .lean()
      .exec()

    // Generate verification token if the user doesn't have one
    if (!verificationToken) {
      verificationToken = await new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(new Error('Error generating verification token'))
          }

          const hexToken = buf.toString('hex')
          return resolve(hexToken)
        })
      })

      // Save token to user in database
      await User.updateOne({ _id: user._id }, { verificationToken })
    }

    // Send verification email
    MailService.sendVerification({
      email: user.email,
      token: verificationToken
    })

    // Temporary support for callback usage
    if (callback) {
      return callback(null)
    }
  },

  finishVerification: async function({ token }) {
    // make sure token is a valid 16-byte hex string
    if (!token.match(/^[a-f0-9]{32}$/)) {
      // early exit
      throw new Error('Invalid verification token')
    }

    const user = await User.findOne({ verificationToken: token })
      .select('firstname email volunteerPartnerOrg')
      .lean()
      .exec()

    if (!user) {
      throw new Error('No user found with that verification token')
    }

    if (user.volunteerPartnerOrg) {
      MailService.sendPartnerVolunteerWelcomeEmail({
        email: user.email,
        volunteerName: user.firstname
      })
    } else {
      MailService.sendOpenVolunteerWelcomeEmail({
        email: user.email,
        volunteerName: user.firstname
      })
    }

    const userUpdates = {
      verified: true,
      $unset: { verificationToken: 1 }
    }

    return User.updateOne({ _id: user._id }, userUpdates)
  },

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
