const expressWs: any = require('@small-tech/express-ws')
import { updateSchedule, clearSchedule } from '../../controllers/CalendarCtrl'
import { Request, Response, NextFunction } from 'express'
import { Volunteer } from '../../models/Volunteer'

export function routeCalendar(router: any): void {
  router.post('/calendar/save', async function(req: Request, res: Response, next: NextFunction) {
    try {
      await updateSchedule({
        user: (req.user as Volunteer),
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

  router.post('/calendar/clear', async function(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as Volunteer
      await clearSchedule(user, req.body.tz)
      res.json({
        msg: 'Schedule cleared'
      })
    } catch (error) {
      next(error)
    }
  })
}
