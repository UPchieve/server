import { Router } from 'express'
import config from '../../config'
import * as StudentRepo from '../../models/Student/queries'
import { asBoolean, asNumber, asUlid, asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as StudentService from '../../services/StudentService'
import { FavoriteLimitReachedError } from '../../services/Errors'
import { authPassport } from '../../utils/auth-utils'

export function routeStudents(router: Router): void {
  router.get('/students/remaining-favorite-volunteers', async function(
    req,
    res
  ) {
    try {
      const user = extractUser(req)
      const totalFavoriteVolunteers: number = (await StudentRepo.getTotalFavoriteVolunteers(
        String(user.id)
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
        String(user.id),
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
      const result = await StudentService.getFavoriteVolunteersPaginated(
        String(user.id),
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
      const volunteerId = asUlid(req.params.volunteerId)
      const user = extractUser(req)
      const isFavorite = asBoolean(req.body.isFavorite)
      const sessionId = req.body.sessionId
        ? asUlid(req.body.sessionId)
        : undefined

      const result = await StudentService.checkAndUpdateVolunteerFavoriting(
        isFavorite,
        user.id,
        volunteerId,
        sessionId,
        asString(req.ip)
      )

      res.json({ isFavorite: result.isFavorite })
    } catch (error) {
      if (error instanceof FavoriteLimitReachedError) {
        res.status(422).json({
          success: false,
          message: error.message,
        })
      } else resError(res, error)
    }
  })

  router.get('/students/partners/active', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const studentId = req.query.student
      const activePartners = await StudentService.adminGetActivePartnersForStudent(
        asString(studentId)
      )
      res.json({ activePartners: activePartners || [] })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/students/reminders/text', async function(req, res) {
    try {
      const user = extractUser(req)
      const phone = req.body.phone
      const reminderDate = req.body.reminderDate
      await StudentService.queueProcrastinationTextReminder(
        user.id,
        asString(phone),
        asString(reminderDate)
      )
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })
}
