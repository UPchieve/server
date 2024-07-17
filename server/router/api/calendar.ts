import { updateSchedule, clearSchedule } from '../../controllers/CalendarCtrl'
import { resError } from '../res-error'
import { InputError } from '../../models/Errors'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'

export function routeCalendar(router: Router): void {
  router.post('/calendar/save', async function(req, res) {
    try {
      const user = extractUser(req)
      if (!req.body.hasOwnProperty('availability'))
        throw new InputError('No availability object specified')
      await updateSchedule({
        ...req.body,
        user: user,
        ip: req.ip,
      })
      res.json({
        msg: 'Schedule saved',
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/calendar/clear', async function(req, res) {
    try {
      const user = extractUser(req)
      await clearSchedule(user, asString(req.body.tz))
      res.json({
        msg: 'Schedule cleared',
      })
    } catch (err) {
      resError(res, err)
    }
  })
}
