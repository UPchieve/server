const passport = require('../auth/passport')
const VerificationCtrl = require('../../controllers/VerificationCtrl')
const User = require('../../models/User')
const { VERIFICATION_METHOD } = require('../../constants')
const isValidInternationalPhoneNumber = require('../../utils/is-valid-international-phone-number')
const UserService = require('../../services/UserService')
const MailService = require('../../services/MailService')
const StudentService = require('../../services/StudentService')
const Sentry = require('@sentry/node')

module.exports = function(router) {
  router.post('/verify/send', async function(req, res) {
    const { user } = req

    try {
      await VerificationCtrl.initiateVerification({ user })

      return res.json({ msg: 'Verification email sent' })
    } catch (error) {
      return res.status(404).json({ err: error.toString() })
    }
  })

  router.post('/verify/confirm', async function(req, res) {
    const token = req.body.token

    try {
      await VerificationCtrl.finishVerification({ token })

      return res.json({
        msg: 'Verification successful'
      })
    } catch (error) {
      return res.status(404).json({ err: error.toString() })
    }
  })

  // Get verification token for a user id (admins only)
  router
    .route('/verificationtoken')
    .all(passport.isAdmin)
    .get(async function(req, res, next) {
      const userId = req.query.userid

      try {
        const user = await User.findOne({ _id: userId }, '+verificationToken')

        return res.json({
          verificationToken: user.verificationToken
        })
      } catch (err) {
        return next(err)
      }
    })

  router.post('/verify/student/send', async function(req, res, next) {
    const { user } = req
    const { sendTo, verificationMethod } = req.body
    const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS

    if (isPhoneVerification) {
      if (!isValidInternationalPhoneNumber(sendTo))
        return res.status(422).json({
          err: 'Must enter a valid phone number'
        })

      const existingUser = await UserService.getUser(
        { phone: sendTo },
        { _id: 1 }
      )
      if (existingUser)
        return res.status(409).json({
          err: 'The phone number you entered is already in use'
        })
    }

    try {
      await VerificationCtrl.initiateStudentVerification({
        firstName: user.firstname,
        sendTo,
        verificationMethod
      })
      res.sendStatus(200)
    } catch (error) {
      if (error.status === 429)
        return res.status(error.status).json({
          err:
            "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
        })

      // Twilio verification resoure was not found
      if (error.status === 404) {
        Sentry.captureException(error)
        return res.status(error.status).json({
          err:
            'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'
        })
      }
      next(error)
    }
  })

  router.post('/verify/student/confirm', async function(req, res, next) {
    const { user } = req
    const { verificationCode, sendTo, verificationMethod } = req.body
    const VERIFICATION_CODE_LENGTH = 6
    if (
      verificationCode.length !== VERIFICATION_CODE_LENGTH ||
      isNaN(Number(verificationCode))
    )
      return res.status(422).json({
        err: 'Must enter a valid 6-digit validation code'
      })
    try {
      const isVerified = await VerificationCtrl.confirmStudentVerification({
        userId: user._id,
        verificationCode,
        sendTo,
        verificationMethod
      })
      res.json({ success: isVerified })

      MailService.sendStudentWelcomeEmail({
        email: user.email,
        firstName: user.firstname
      })
      StudentService.queueWelcomeEmails(user._id)
    } catch (error) {
      next(error)
    }
  })
}
