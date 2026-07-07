import * as ModerationService from '../../services/ModerationService'
import { resError } from '../res-error'
import { Response, Router } from 'express'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import multer from 'multer'
import logger from '../../logger'
import {
  ModerateImageResultResponse,
  ModerateMessageResponse,
} from '../../contracts/moderate'
import type { ErrorResponse } from '../../contracts/shared'
import * as mappers from '../../public/moderate'

export function routeModeration(router: Router): void {
  const upload = multer()

  router
    .route('/moderate/message')
    .post(async (req, res: Response<ModerateMessageResponse>) => {
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
        const isClean = await ModerationService.moderateMessage(
          args,
          req.body?.source
        )
        res.json({ isClean: mappers.toModerationResultPublic(isClean) })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/moderate/image')
    .post(
      upload.single('image'),
      async (req, res: Response<ModerateImageResultResponse>) => {
        const imageToModerate = req.file
        const sessionId = req.body.sessionId
        const user = extractUser(req)
        if (!imageToModerate) {
          return res.status(400).json({ err: 'No file was attached' })
        }

        try {
          const moderationResult = await ModerationService.moderateImage(
            imageToModerate.buffer,
            {
              source: 'image_upload',
              sessionId,
              userId: user.id,
              isVolunteer: user.roleContext.hasRole('volunteer'),
            }
          )
          res
            .status(200)
            .json(
              moderationResult
                ? mappers.toModerateImageResultPublic(moderationResult)
                : undefined
            )
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/moderate/video-frame')
    .post(
      upload.single('frame'),
      (req, res: Response<ErrorResponse | void>) => {
        const frameToModerate = req.file
        const sessionId = req.body.sessionId
        const user = extractUser(req)

        if (!frameToModerate) {
          return res.status(400).json({ err: 'No file was attached' })
        }

        logger.info(`Moderating video frame for session ${sessionId}`)
        try {
          ModerationService.moderateScreenshareImage({
            image: frameToModerate.buffer,
            sessionId,
            userId: user.id,
            isVolunteer: user.roleContext.hasRole('volunteer'),
          })

          res.status(201).send()
        } catch (err) {
          resError(res, err)
        }
      }
    )
}
