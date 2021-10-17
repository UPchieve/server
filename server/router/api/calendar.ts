import expressWs from 'express-ws'
import { updateSchedule, clearSchedule } from '../../controllers/CalendarCtrl'
import { resError } from '../res-error'
import { InputError } from '../../models/Errors'
import { Volunteer } from '../../models/Volunteer'
import { LoadedRequest } from '../app'

export function routeCalendar(router: expressWs.Router): void {
  router.post('/calendar/save', async function(req: LoadedRequest, res) {
    try {
      if (!req.body.hasOwnProperty('availability'))
        throw new InputError('No availability object specified')
      await updateSchedule({
        ...req.body,
        user: req.user as Volunteer,
        ip: req.ip
      })
      res.json({
        msg: 'Schedule saved'
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/calendar/clear', async function(req: LoadedRequest, res) {
    try {
      await clearSchedule(req.user as Volunteer, req.body.tz)
      res.json({
        msg: 'Schedule cleared'
      })
    } catch (err) {
      resError(res, err)
    }
  })
}
