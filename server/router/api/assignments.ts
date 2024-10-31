import { Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'

export function routeAssignments(router: Router): void {
  router.get('/assignment/:assignmentId', async function(req, res) {
    try {
      const assignmentId = req.params.assignmentId as string
      const assignment = await AssignmentsService.getAssignmentById(
        assignmentId
      )
      res.json({ assignment })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/assignment/:assignmentId/students', async function(req, res) {
    try {
      const assignmentId = req.params.assignmentId as string
      const studentAssignments = await AssignmentsService.getStudentAssignmentCompletion(
        assignmentId
      )
      res.json({ studentAssignments })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/assignment/delete', async function(req, res) {
    try {
      const assignmentId = req.body.assignmentId as string
      const classId = req.body.classId as string

      await AssignmentsService.deleteAssignment(assignmentId, classId)
      res.json({ assignmentId })
    } catch(err) {
      resError(res, err)
    }
  })
}
