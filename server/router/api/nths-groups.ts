import { NextFunction, Request, Response, Router } from 'express'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'

export async function isGroupAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user && req.user.id && req.params.groupId) {
    const groupMember = await NTHSGroupsService.getGroupMember(
      req.user?.id!,
      req.params.groupId
    )
    if (groupMember?.roleName === 'admin') {
      return next()
    }
  }
  return res.status(403).json({ err: 'Unauthorized' })
}

export function routeNTHSGroups(router: Router): void {
  router.route('/nths-groups').get(async (req: Request, res: Response) => {
    try {
      const user = extractUser(req)
      const groups = await NTHSGroupsService.getGroups(user.id)
      res.json({ groups })
    } catch (error) {
      resError(res, error)
    }
  })

  router
    .route('/nths-groups/:groupId/members')
    .get(async (req: Request, res: Response) => {
      try {
        const members = await NTHSGroupsService.getGroupMembers(
          req.params.groupId
        )
        return res.json({ members })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/nths-groups/:groupId/members/:memberId')
    .put(isGroupAdmin, async (req: Request, res: Response) => {
      try {
        const user = extractUser(req)
        await NTHSGroupsService.updateGroupMemberRole(
          req.params.memberId,
          req.params.groupId,
          req.body.role
        )
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    })
}
