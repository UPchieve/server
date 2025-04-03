import * as ModerationService from '../../services/ModerationService'
import { resError } from '../res-error'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import multer from 'multer'
import logger from '../../logger'

export function routeModeration(router: Router): void {
  const upload = multer()

  router.route('/moderate/message').post(async (req, res) => {
    try {
      const user = extractUser(req)
      const userType = user.roleContext.activeRole
      const args = req.body?.content
        ? {
            // Support old versions of high-line and midtown
            message: asString(req.body.content),
            senderId: asString(req.user?.id),
            userType,
          }
        : {
            message: asString(req.body.message),
            senderId: asString(req.user?.id),
            sessionId: req.body.sessionId,
            userType,
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
      const user = extractUser(req)
      if (!imageToModerate) {
        return res.status(400).json({ err: 'No file was attached' })
      }

      try {
        const moderationResult = await ModerationService.moderateImage({
          image: imageToModerate.buffer,
          sessionId,
          userId: user.id,
          isVolunteer: user.isVolunteer,
          source: 'image_upload',
          aggregateInfractions: true,
        })
        res.status(200).json(moderationResult)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/moderate/video-frame')
    .post(upload.single('frame'), (req, res) => {
      const frameToModerate = req.file
      const sessionId = req.body.sessionId
      const user = extractUser(req)

      if (!frameToModerate) {
        return res.status(400).json({ err: 'No file was attached' })
      }

      logger.info(`Moderating video frame for session ${sessionId}`)
      try {
        ModerationService.moderateImage({
          image: frameToModerate.buffer,
          sessionId,
          userId: user.id,
          isVolunteer: user.isVolunteer,
          source: 'screenshare',
          aggregateInfractions: false,
        })

        res.status(201).send()
      } catch (err) {
        resError(res, err)
      }
    })
}
