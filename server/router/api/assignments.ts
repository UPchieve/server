import { Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import multer from 'multer'
import { asString } from '../../utils/type-utils'

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
      const assignmentId = asString(req.params.assignmentId)
      if (assignmentId) {
        await AssignmentsService.deleteAssignment(assignmentId)
        res.sendStatus(200)
      }
    } catch (err) {
      resError(res, err)
    }
  })

  const upload = multer({
    limits: { fileSize: 20 * 1024 * 1024 },
  })

  router.put('/assignment/upload', upload.array('files'), async (req, res) => {
    try {
      if (req.files) {
        const files = req.files as Express.Multer.File[]
        const assignmentId = req.body.assignmentId

        await AssignmentsService.uploadAssignment(assignmentId, files)

        res.sendStatus(200)
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/assignment/:assignmentId/documents', async (req, res) => {
    try {
      const assignmentId = asString(req.params.assignmentId)
      const assignmentDocuments = await AssignmentsService.getAssignmentDocuments(
        assignmentId
      )

      res.json({ assignmentDocuments })
    } catch (err) {
      resError(res, err)
    }
  })
}
