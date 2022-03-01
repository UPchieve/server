import { Router } from 'express'
import * as StudentRepo from '../../models/Student/queries'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'

export function routeStudents(router: Router): void {
  router.post('/students/favorite-volunteer/:volunteerId', async function (req,res) {
    try {
      const volunteerId = asString(req.params.volunteerId)
      const user = extractUser(req)
      const { update } = req.body

      const isFavorite = await StudentRepo.updateVolunteerFavoritedStatus(asString(user._id), volunteerId, update)
      res.json({
        isFavorite
      })
    } catch (error) {
      resError(res,error)
    }
  })
}