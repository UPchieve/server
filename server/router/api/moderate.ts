import * as ModerationService from '../../services/ModerationService'
import * as UserRolesService from '../../services/UserRolesService'
import { resError } from '../res-error'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { isVolunteerUserType } from '../../utils/user-type'
import multer from 'multer'

export function routeModeration(router: Router): void {
  const upload = multer()

  router.route('/moderate/message').post(async (req, res) => {
    try {
      const user = extractUser(req)
      const isVolunteer = isVolunteerUserType(
        UserRolesService.getUserTypeFromRoles(user.roles, user.id)
      )
      const args = req.body?.content
        ? {
            // Support old versions of high-line and midtown
            message: asString(req.body.content),
            senderId: asString(req.user?.id),
            isVolunteer,
          }
        : {
            message: asString(req.body.message),
            senderId: asString(req.user?.id),
            sessionId: req.body.sessionId,
            isVolunteer,
          }
      const isClean = await ModerationService.moderateMessage(args)
      res.json({ isClean })
    } catch (error) {
      resError(res, error)
    }
  })

  router
    .route('/moderate/image')
    .post(upload.single('image'), async (req, res) => {
      const imageToModerate = req.file
      const sessionId = req.body.sessionId
      if (!imageToModerate) {
        return res.status(400).json({ err: 'No file was attached' })
      }

      try {
        const userId = extractUser(req).id
        const moderationResult = await ModerationService.moderateImage(
          imageToModerate,
          sessionId,
          userId
        )
        res.status(200).json(moderationResult)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/moderate/video-frame')
    .post(upload.single('frame'), async (req, res) => {
      const frameToModerate = req.file
      const sessionId = req.body.sessionId
      const user = extractUser(req)

      if (!frameToModerate) {
        return res.status(400).json({ err: 'No file was attached' })
      }

      try {
        const moderationResult = await ModerationService.moderateVideoFrame(
          frameToModerate.buffer,
          sessionId,
          user.id,
          user.isVolunteer
        )
        res.status(200).json(moderationResult)
      } catch (err) {
        resError(res, err)
      }
    })
}
