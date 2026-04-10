import { updateSchedule } from '../../controllers/CalendarCtrl'
import { resError } from '../res-error'
import { InputError } from '../../models/Errors'
import type { Router, Response } from 'express'
import { extractUser } from '../extract-user'
import { SaveCalendarResponse } from '../../contracts/calendar'

export function routeCalendar(router: Router): void {
  router.post(
    '/calendar/save',
    async function (req, res: Response<SaveCalendarResponse>) {
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
    }
  )
}
