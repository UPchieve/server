import { Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import multer from 'multer'
import { asString } from '../../utils/type-utils'
import { isEmpty } from 'lodash'
import { NotAuthenticatedError } from '../../models/Errors'

export function routeAssignments(router: Router): void {
  router.get('/assignment/:assignmentId', async function (req, res) {
    try {
      const assignmentId = req.params.assignmentId as string
      const assignment =
        await AssignmentsService.getAssignmentById(assignmentId)
      if (assignment)
        assignment.isGettingStartedAssignment =
          await AssignmentsService.isGettingStartedAssignment(assignment.id)
      res.json({ assignment })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/assignment/:assignmentId/students', async function (req, res) {
    try {
      const assignmentId = req.params.assignmentId as string
      const studentAssignments =
        await AssignmentsService.getStudentAssignmentCompletion(assignmentId)
      res.json({ studentAssignments })
    } catch (err) {
      resError(res, err)
    }
  })

  router.delete('/assignment/:assignmentId', async function (req, res) {
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
      const userId = req.user?.id
      if (!userId) {
        throw new NotAuthenticatedError()
      }
      if (req.files) {
        const files = req.files as Express.Multer.File[]
        const assignmentId = req.body.assignmentId

        const moderationFailures =
          await AssignmentsService.uploadAssignmentFiles(
            assignmentId,
            files,
            userId
          )

        if (isEmpty(moderationFailures)) {
          res.sendStatus(200)
        } else {
          res.status(422).json({
            moderationFailures,
          })
        }
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/assignment/:assignmentId/documents', async (req, res) => {
    try {
      const assignmentId = asString(req.params.assignmentId)
      const assignmentDocuments =
        await AssignmentsService.getAssignmentDocuments(assignmentId)

      res.json({ assignmentDocuments })
    } catch (err) {
      resError(res, err)
    }
  })
}
