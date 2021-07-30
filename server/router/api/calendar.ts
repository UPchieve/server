import expressWs from '@small-tech/express-ws'
import { updateSchedule, clearSchedule } from '../../controllers/CalendarCtrl'

export function routeCalendar(router: expressWs.Router): void {
  router.post('/calendar/save', async function(req, res, next) {
    try {
      await updateSchedule({
        user: req.user,
        availability: req.body.availability,
        tz: req.body.tz,
        ip: req.ip
      })
      res.json({
        msg: 'Schedule saved'
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/calendar/clear', async function(req, res, next) {
    try {
      await clearSchedule(req.user, req.body.tz)
      res.json({
        msg: 'Schedule cleared'
      })
    } catch (error) {
      next(error)
    }
  })
}
