import * as VerificationCtrl from '../../controllers/VerificationCtrl'
import { VERIFICATION_METHOD } from '../../constants'
import isValidInternationalPhoneNumber from '../../utils/is-valid-international-phone-number'
import isValidEmail from '../../utils/is-valid-email'
import UserService from '../../services/UserService'
import MailService from '../../services/MailService'
import * as StudentService from '../../services/StudentService'
import { User } from '../../models/User'
import logger from '../../logger'

export function routeVerify(router) {
  router.post('/verify/send', async function(req, res, next) {
    const { user } = req
    const { sendTo, verificationMethod } = req.body
    const isPhoneVerification = verificationMethod === VERIFICATION_METHOD.SMS
    const existingUserQuery: Partial<User> = {}
    let existingUserErrorMessage = ''
    if (isPhoneVerification) {
      if (!isValidInternationalPhoneNumber(sendTo))
        return res.status(422).json({
          err: 'Must enter a valid phone number'
        })
      existingUserQuery.phone = sendTo
      existingUserErrorMessage =
        'The phone number you entered is already in use'
    } else {
      if (!isValidEmail(sendTo))
        return res.status(422).json({
          err: 'Must enter a valid email address'
        })
      existingUserQuery.email = sendTo
      existingUserErrorMessage =
        'The email address you entered is already in use'
    }

    const existingUser = await UserService.getUser(existingUserQuery, {
      _id: 1
    })

    if (existingUser && !user._id.equals(existingUser._id))
      return res.status(409).json({
        err: existingUserErrorMessage
      })

    try {
      await VerificationCtrl.initiateVerification({
        firstName: user.firstname,
        sendTo,
        verificationMethod
      })
      res.sendStatus(200)
    } catch (error) {
      logger.error(
        { 'error.name': 'twilio verification', error: error },
        error.message
      )
      if (error.status === 429)
        return res.status(error.status).json({
          err:
            // eslint-disable-next-line quotes
            "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
        })

      // Twilio verification resoure was not found
      if (error.status === 404) {
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
      logger.error(
        { 'error.name': 'twilio verification', error: error },
        error.message
      )
      next(error)
    }
  })
}
