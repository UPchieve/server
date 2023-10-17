import * as UserService from '../../services/UserService'
import * as MailService from '../../services/MailService'
import * as AwsService from '../../services/AwsService'
import * as VolunteerService from '../../services/VolunteerService'
import {
  countUsersReferredByOtherId,
  getUserForAdminDetail,
  getUserIdByEmail,
} from '../../models/User/'
import { authPassport } from '../../utils/auth-utils'
import { Router } from 'express'
import { resError } from '../res-error'
import { asString, asBoolean, asUlid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { createAccountAction } from '../../models/UserAction'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { InputError, NotAllowedError } from '../../models/Errors'

export function routeUser(router: Router): void {
  router.route('/user').get(async function(req, res) {
    const user = extractUser(req)
    const parsedUser = await UserService.parseUser(user)

    return res.json({ user: parsedUser })
  })

  // Note: Both students and volunteers can edit parts of their profile,
  // but only volunteers can deactivate their accounts.
  router.put('/user', async (req, res) => {
    try {
      const { ip } = req
      const user = extractUser(req)

      const isDeactivated = asBoolean(req.body.isDeactivated)

      // Form request object
      let updateReq: { [k: string]: boolean | string | string[] } = {
        deactivated: isDeactivated,
      }

      // optional fields
      if ('smsConsent' in req.body) {
        updateReq['smsConsent'] = asBoolean(req.body.smsConsent)
      }
      if ('mutedSubjectAlerts' in req.body) {
        updateReq['mutedSubjectAlerts'] = req.body
          .mutedSubjectAlerts as string[]
      }
      if ('phone' in req.body) {
        const phone = asString(req.body.phone)
        if (phone.length === 0) {
          throw new InputError('Phone number must be provided')
        }
        updateReq['phone'] = phone
      }

      await UserService.updateUserProfile(user.id, updateReq)

      if (isDeactivated !== user.deactivated) {
        await MailService.createContact(user.id)

        if (isDeactivated)
          await createAccountAction({
            action: ACCOUNT_USER_ACTIONS.DEACTIVATED,
            userId: user.id,
            ipAddress: ip,
          })
      }
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.delete('/user', async (req, res) => {
    try {
      const user = extractUser(req)
      await UserService.flagForDeletion(user)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  // Admin route to update a user
  router.put('/user/:userId', authPassport.isAdmin, async (req, res) => {
    const { userId } = req.params

    try {
      await UserService.adminUpdateUser({ userId, ...req.body } as unknown)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/user/volunteer-approval/reference', async (req, res) => {
    try {
      const { ip } = req
      const user = extractUser(req)
      await UserService.addReference({
        userId: user.id,
        userEmail: user.email,
        ip,
        ...req.body,
      } as unknown)
      res.sendStatus(200)
    } catch (err) {
      if (err instanceof NotAllowedError) {
        res.json({
          success: false,
          message: err.message,
        })
      } else resError(res, err)
    }
  })

  router.post('/user/volunteer-approval/reference/delete', async (req, res) => {
    try {
      const { ip } = req
      const user = extractUser(req)
      await UserService.deleteReference(
        user.id,
        asString(req.body.referenceEmail),
        ip
      )
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/user/volunteer-approval/photo-url', async (req, res) => {
    try {
      const { ip } = req
      const user = extractUser(req)

      const photoIdS3Key = await UserService.addPhotoId(user.id, ip)
      const uploadUrl = await AwsService.getPhotoIdUploadUrl(photoIdS3Key)

      if (uploadUrl) {
        res.json({
          success: true,
          message: 'AWS SDK S3 pre-signed URL generated successfully',
          uploadUrl,
        })
      } else {
        res.json({
          success: false,
          message: 'Pre-signed URL error',
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.post(
    '/user/volunteer-approval/background-information',
    async (req, res) => {
      const { ip } = req
      const user = extractUser(req)

      // TODO: duck type validation
      const {
        occupation,
        experience,
        company,
        college,
        linkedInUrl,
        languages,
        country,
        state,
        city,
      } = req.body

      const update = {
        occupation,
        experience,
        company,
        college,
        linkedInUrl,
        languages,
        country,
        state,
        city,
      }

      try {
        await VolunteerService.addBackgroundInfo(user.id, update, ip)
        res.sendStatus(200)
      } catch (error) {
        res.sendStatus(500)
      }
    }
  )

  router.get('/user/referred-friends', async (req, res) => {
    try {
      const user = extractUser(req)
      const referredFriends = await countUsersReferredByOtherId(user.id)
      // the frontend is expecting to look at the length of an array, not a #
      const referredFriendsArr = Array(referredFriends)
      res.json({ referredFriendsArr })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/user/email/:userEmail', authPassport.isAdmin, async function(
    req,
    res
  ) {
    const { userEmail } = req.params
    try {
      const userId = await getUserIdByEmail(userEmail)
      res.json({ userId: userId })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/user/:userId', authPassport.isAdmin, async function(req, res) {
    const { userId } = req.params
    const page = Number(req.query.page || '1')

    const PAGE_SIZE = 10
    const skip = PAGE_SIZE * (page - 1)

    try {
      const user = await getUserForAdminDetail(asUlid(userId), PAGE_SIZE, skip)

      let resUser: any = user
      if (user.isVolunteer && user.photoIdS3Key) {
        const photoUrl = await AwsService.getPhotoIdUrl(user.photoIdS3Key)
        resUser = Object.assign(resUser, { photoUrl })
      }

      res.json({ user })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/users', authPassport.isAdmin, async function(req, res) {
    try {
      const payload = {
        ...req.query,
        page: req.query.page ? req.query.page : 1,
      }
      const { users, isLastPage } = await UserService.getUsers(
        payload as unknown
      )
      res.json({ users, isLastPage })
    } catch (err) {
      resError(res, err)
    }
  })
}
