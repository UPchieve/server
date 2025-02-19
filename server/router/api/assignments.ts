import { Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import multer from 'multer'

const upload = multer()

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

  router.delete('/assignment/:assignmentId', async function(req, res) {
    try {
      const assignmentId = req.params.assignmentId as string
      if (assignmentId) {
        await AssignmentsService.deleteAssignment(assignmentId)
        res.sendStatus(200)
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.put('/assignment/upload', upload.single('file'), async (req, res) => {
    try {
      if (req.file) {
        await AssignmentsService.uploadAssignment(
          req.body.assignmentId,
          req.body.fileName,
          req.file
        )
        res.sendStatus(200)
      }
    } catch (err) {
      resError(res, err)
    }
  })
}
