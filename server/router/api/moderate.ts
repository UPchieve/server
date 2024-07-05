import * as ModerationService from '../../services/ModerationService'
import * as UserRolesService from '../../services/UserRolesService'
import { resError } from '../res-error'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { isVolunteerUserType } from '../../utils/user-type'

export function routeModeration(router: Router): void {
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
}
