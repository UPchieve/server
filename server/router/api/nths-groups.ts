import { Router } from 'express'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'

export function routeNTHSGroups(router: Router): void {
  router.route('/nths-groups').get(async (req, res) => {
    try {
      const user = extractUser(req)
      const groups = await NTHSGroupsService.getGroups(user.id)
      res.json({ groups })
    } catch (error) {
      resError(res, error)
    }
  })
}
