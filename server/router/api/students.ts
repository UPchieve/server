import { Router } from 'express'
import config from '../../config'
import * as StudentRepo from '../../models/Student/queries'
import {
  asBoolean,
  asNumber,
  asObjectId,
  asString,
} from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as StudentService from '../../services/StudentService'

export function routeStudents(router: Router): void {
  router.get('/students/remaining-favorite-volunteers', async function(
    req,
    res
  ) {
    try {
      const user = extractUser(req)
      const totalFavoriteVolunteers: number = (await StudentRepo.getTotalFavoriteVolunteers(
        String(user._id)
      )) as number
      res.json({
        remaining: config.favoriteVolunteerLimit - totalFavoriteVolunteers,
      })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/students/favorite-volunteers/:volunteerId', async function(
    req,
    res
  ) {
    try {
      const volunteerId = asString(req.params.volunteerId)
      const user = extractUser(req)
      const isFavorite = await StudentRepo.isFavoriteVolunteer(
        String(user._id),
        volunteerId
      )
      res.json({
        isFavorite,
      })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/students/favorite-volunteers', async function(req, res) {
    try {
      const user = extractUser(req)
      const page = asNumber(req.query.page)
      const result = await StudentRepo.getFavoriteVolunteers(
        String(user._id),
        page
      )
      res.json(result)
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/students/favorite-volunteers/:volunteerId', async function(
    req,
    res
  ) {
    try {
      const volunteerId = asString(req.params.volunteerId)
      const user = extractUser(req)
      const isFavorite = asBoolean(req.body.isFavorite)
      const sessionId = req.body.sessionId ? req.body.sessionId : ''
      const result = await StudentService.checkAndUpdateVolunteerFavoriting(
        isFavorite,
        user._id,
        volunteerId,
        sessionId
      )

      if (result) res.json({ isFavorite: result })
      // TODO: determine error message return type
      else
        res.status(422).json({
          success: false,
          message: 'Favorited volunteer limit reached.',
        })
    } catch (error) {
      resError(res, error)
    }
  })
}
