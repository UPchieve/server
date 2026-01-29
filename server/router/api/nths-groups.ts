import { NextFunction, Request, Response, Router } from 'express'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import {
  NotAuthenticatedError,
  NTHSGroupNameTakenError,
  RepoUpdateError,
} from '../../models/Errors'

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
        await NTHSGroupsService.updateGroupMember(
          req.params.memberId,
          req.params.groupId,
          req.body
        )
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/nths-groups/:groupId/leave')
    // This route is similar to the above, but is for a member removing **themselves** from a group
    // whereas the above is a group admin action to update other members' settings.
    .delete(async (req: Request, res: Response) => {
      try {
        const userId = req.user?.id
        if (!userId) throw new NotAuthenticatedError()
        await NTHSGroupsService.updateGroupMember(userId, req.params.groupId, {
          isActive: false,
        })
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    })

  router.route('/nths-groups/new').post(async (req, res) => {
    try {
      const user = extractUser(req)
      const group = await NTHSGroupsService.foundGroup(user.id)
      res.json({ group })
    } catch (error) {
      resError(res, error)
    }
  })
  router.route('/nths-groups/:groupId').put(isGroupAdmin, async (req, res) => {
    try {
      const name = req.body.name
      const group = await NTHSGroupsService.updateGroupName(
        req.params.groupId,
        name
      )
      res.json({ group })
    } catch (error) {
      if (
        error instanceof RepoUpdateError &&
        error.message.includes('unique_name')
      ) {
        return resError(
          res,
          new NTHSGroupNameTakenError(
            `Team name must be unique: ${req.body.name} is already taken`
          )
        )
      }
      resError(res, error)
    }
  })
}
