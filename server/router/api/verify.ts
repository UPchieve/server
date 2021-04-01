import Sentry from '@sentry/node'
import * as VerificationCtrl from '../../controllers/VerificationCtrl'
import { VERIFICATION_METHOD } from '../../constants'
import isValidInternationalPhoneNumber from '../../utils/is-valid-international-phone-number'
import UserService from '../../services/UserService'
import MailService from '../../services/MailService'
import * as StudentService from '../../services/StudentService'

export function routeVerify(router) {
  router.post('/verify/send', async function(req, res, next) {
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
      await VerificationCtrl.initiateVerification({
        firstName: user.firstname,
        sendTo,
        verificationMethod
      })
      res.sendStatus(200)
    } catch (error) {
      if (error.status === 429)
        return res.status(error.status).json({
          err:
            // eslint-disable-next-line quotes
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

  router.post('/verify/confirm', async function(req, res, next) {
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
      const isVerified = await VerificationCtrl.confirmVerification({
        userId: user._id,
        verificationCode,
        sendTo,
        verificationMethod
      })
      res.json({ success: isVerified })

      if (user.isVolunteer) {
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
      } else {
        MailService.sendStudentWelcomeEmail({
          email: user.email,
          firstName: user.firstname
        })
        StudentService.queueWelcomeEmails(user._id)
      }
    } catch (error) {
      next(error)
    }
  })
}
