import * as UserCtrl from '../../controllers/UserCtrl'
import * as UserService from '../../services/UserService'
import * as MailService from '../../services/MailService'
import * as AwsService from '../../services/AwsService'
import { authPassport } from '../../utils/auth-utils'
import config from '../../config'
import * as UserActionCtrl from '../../controllers/UserActionCtrl'
import { Request, Response, NextFunction, Router } from 'express'
import { User } from '../../models/User'
import { Volunteer } from '../../models/Volunteer'
import { Student } from '../../models/Student'

export default function(router: Router) {
  router.route('/user').get(function(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        err: 'Client has no authenticated session'
      })
    }

    const parsedUser = UserService.parseUser((req.user as Volunteer | Student))
    return res.json({ user: parsedUser })
  })

  // @note: Currently, only volunteers are able to update their profile
  router.put('/user', async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User
    const { ip } = req
    const { phone, isDeactivated } = req.body

    if (isDeactivated !== user.isDeactivated) {
      const updatedUser = Object.assign(req.user, { isDeactivated })
      if (updatedUser)
        MailService.createContact(updatedUser)

      if (isDeactivated)
        new UserActionCtrl.AccountActionCreator(_id, ip).accountDeactivated()
    }

    try {
      await Volunteer.updateOne({ _id: user._id }, { phone, isDeactivated })
      res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  })

  // Admin route to update a user
  router.put('/user/:userId', authPassport.isAdmin, async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    try {
      await UserService.adminUpdateUser(userId, req.body.firstname, req.body.lastname, req.body.email, req.body.partnerOrg, req.body.partnerSite, req.body.isVerified, req.body.isBanned, req.body.isDeactivated, req.body.isApproved)
      res.sendStatus(200)
    } catch (err) {
      next(err)
    }
  })

  router.post('/user/volunteer-approval/reference', async (req: Request, res: Response, next: NextFunction) => {
    const { ip } = req
    const { _id } = req.user
    const { referenceFirstName, referenceLastName, referenceEmail } = req.body
    await UserService.addReference({
      userId: _id,
      referenceFirstName,
      referenceLastName,
      referenceEmail,
      ip
    })
    res.sendStatus(200)
  })

  router.post('/user/volunteer-approval/reference/delete', async (req: Request, res: Response) => {
    const { ip } = req
    const { _id } = req.user
    const { referenceEmail } = req.body
    await UserService.deleteReference({
      userId: _id,
      referenceEmail,
      ip
    })
    res.sendStatus(200)
  })

  router.get('/user/volunteer-approval/photo-url', async (req: Request, res: Response, next: NextFunction) => {
    const { ip } = req
    const { _id } = req.user
    const photoIdS3Key = await UserService.addPhotoId({ userId: _id, ip })
    const uploadUrl = await AwsService.getPhotoIdUploadUrl({ photoIdS3Key, ip })

    if (uploadUrl) {
      res.json({
        success: true,
        message: 'AWS SDK S3 pre-signed URL generated successfully',
        uploadUrl
      })
    } else {
      res.json({
        success: false,
        message: 'Pre-signed URL error'
      })
    }
  })

  router.post(
    '/user/volunteer-approval/background-information',
    async (req, res) => {
      const { ip } = req
      const { _id } = req.user
      const {
        occupation,
        experience,
        company,
        college,
        linkedInUrl,
        languages,
        country,
        state,
        city
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
        city
      }

      try {
        await UserService.addBackgroundInfo({
          volunteerId: _id,
          ip,
          update
        })
        res.sendStatus(200)
      } catch (error) {
        res.sendStatus(500)
      }
    }
  )

  router.get('/user/referred-friends', async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user: ExpressUser | undefined = req.user
      if (user === undefined) return res.status(400).json({err: 'must include a user object on request'})
      const referredFriends = await UserService.getReferredFriends(user._id, {
        firstname: 1
      })
      res.json({ referredFriends })
    } catch (err) {
      next(err)
    }
  })

  router.get('/user/:userId', authPassport.isAdmin, async function(
    req,
    res,
    next
  ) {
    const { userId } = req.params
    const page: string = req.query.page

    try {
      const user = await UserService.adminGetUser(userId, parseInt(page))

      if (user.isVolunteer && user.photoIdS3Key)
        user.photoUrl = await AwsService.getPhotoIdUrl({
          photoIdS3Key: user.photoIdS3Key
        })

      res.json({ user })
    } catch (err) {
      console.log(err)
      next(err)
    }
  })

  router.get('/users', authPassport.isAdmin, async function(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, isLastPage } = await UserService.getUsers(req.query.userId, req.query.firstName, req.query.lastName, req.query.email, req.query.partnerOrg, req.query.highSchool, req.query.page)
      res.json({ users, isLastPage })
    } catch (err) {
      next(err)
    }
  })

  /**
   * This is a utility route used by Cypress to clean up after e2e tests
   * Not available for use on production
   */
  router.delete('/user', authPassport.isAdmin, async function(req: Request, res: Response) {
    if (config.NODE_ENV === 'production') {
      return res.status(405).json({
        err: 'Deleting users is not allowed on production'
      })
    }

    const userEmail = req.body.email
    const deleteResult = await UserCtrl.deleteUserByEmail(userEmail)
    const didDelete = !!deleteResult.deletedCount

    return res.status(200).json({ didDelete })
  })
}
