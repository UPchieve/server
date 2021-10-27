import * as UserService from '../../services/UserService'
import * as MailService from '../../services/MailService'
import * as AwsService from '../../services/AwsService'
import * as VolunteerService from '../../services/VolunteerService'
import { updateVolunteerProfileById } from '../../models/Volunteer/queries'
import { getUsersReferredByOtherId } from '../../models/User/queries'
import { authPassport } from '../../utils/auth-utils'
import * as UserActionCtrl from '../../controllers/UserActionCtrl'

import { Router } from 'express'
import { resError } from '../res-error'
import { User } from '../../models/User'
import { NotAuthenticatedError } from '../../models/Errors'
import { asString, asBoolean, asObjectId } from '../../utils/type-utils'

export function routeUser(router: Router): void {
  router.route('/user').get(function(req, res) {
    if (!req.user) throw new NotAuthenticatedError()
    const user = req.user as User

    const parsedUser = UserService.parseUser(user)
    return res.json({ user: parsedUser })
  })

  // @note: Currently, only volunteers are able to update their profile
  router.put('/user', async (req, res) => {
    try {
      const { ip } = req
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      let { phone, isDeactivated } = req.body
      phone = asString(phone)
      isDeactivated = asBoolean(isDeactivated)

      if (isDeactivated !== user.isDeactivated) {
        const updatedUser = Object.assign(user, { isDeactivated })
        MailService.createContact(updatedUser)

        if (isDeactivated)
          new UserActionCtrl.AccountActionCreator(
            user._id,
            ip
          ).accountDeactivated()
      }
      await updateVolunteerProfileById(user._id, isDeactivated, phone)
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
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      await UserService.addReference({
        userId: user._id,
        ip,
        ...req.body,
      } as unknown)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/user/volunteer-approval/reference/delete', async (req, res) => {
    try {
      const { ip } = req
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      await UserService.deleteReference(
        user._id,
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
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      const photoIdS3Key = await UserService.addPhotoId(user._id, ip)
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
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User

      // TODO: type validate update
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
        await VolunteerService.addBackgroundInfo(user._id, update, ip)
        res.sendStatus(200)
      } catch (error) {
        res.sendStatus(500)
      }
    }
  )

  router.get('/user/referred-friends', async (req, res) => {
    try {
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      const referredFriends = await getUsersReferredByOtherId(user._id)
      res.json({ referredFriends })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/user/:userId', authPassport.isAdmin, async function(req, res) {
    const { userId } = req.params
    const { page } = req.query

    try {
      const user = await UserService.adminGetUser(
        asObjectId(userId),
        parseInt(asString(page))
      )

      if (user.isVolunteer && user.photoIdS3Key)
        user.photoUrl = await AwsService.getPhotoIdUrl(user.photoIdS3Key)

      res.json({ user })
    } catch (err) {
      console.log(err)
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
