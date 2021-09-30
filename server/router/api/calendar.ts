import expressWs from '@small-tech/express-ws'
import { updateSchedule, clearSchedule } from '../../controllers/CalendarCtrl'
import { resError } from '../res-error'
import { InputError } from '../../models/Errors'

export function routeCalendar(router: expressWs.Router): void {
  router.post('/calendar/save', async function(req, res, next) {
    try {
      if (!req.body.hasOwnProperty('availability'))
        throw new InputError('No availability object specified')
      await updateSchedule({
        ...req.body,
        user: req.user,
        ip: req.ip
      })
      res.json({
        msg: 'Schedule saved'
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/calendar/clear', async function(req, res, next) {
    try {
      await clearSchedule(req.user, req.body.tz)
      res.json({
        msg: 'Schedule cleared'
      })
    } catch (err) {
      resError(res, err)
    }
  })
}
