import { Express, Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'

export function routeAssignments(app: Express, router: Router): void {
  router.route('/assignment').post(async function(req, res) {
    try {
      const classId = req.body.classId
      const description = (req.body.description as string) ?? null
      const title = (req.body.title as string) ?? null
      const numberOfSessions = (req.body.numberOfSessions as number) ?? null
      const minDurationInMinutes =
        (req.body.minDurationInMinutes as number) ?? null
      const dueDate = (req.body.dueDate as Date) ?? null
      const startAt = (req.body.startDate as Date) ?? null
      const subjectId = (req.body.subjectId as number) ?? null
      const assignment = await AssignmentsService.createAssignment(
        classId,
        description,
        title,
        numberOfSessions,
        minDurationInMinutes,
        dueDate,
        startAt,
        subjectId
      )
      res.json({ assignment })
    } catch (err) {
      resError(res, err)
    }
  })
}
