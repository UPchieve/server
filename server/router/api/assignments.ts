import { Response, Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import {
  toAssigmentPublic,
  toAssignmentDocumentPublic,
  toStudentAssignmentSubmissionPublic,
} from '../../public/assignments'
import { resError } from '../res-error'
import multer from 'multer'
import { asString } from '../../utils/type-utils'
import {
  AssignmentDocumentsResponse,
  AssignmentResponse,
  AssignmentUploadResponse,
  StudentAssignmentCompletionResponse,
} from '../../contracts/assignments'
import { isEmpty } from 'lodash'
import { extractUser } from '../extract-user'

export function routeAssignments(router: Router): void {
  router.get(
    '/assignment/:assignmentId',
    async function (req, res: Response<AssignmentResponse>) {
      try {
        const assignmentId = req.params.assignmentId as string
        const assignment =
          await AssignmentsService.getAssignmentById(assignmentId)
        if (assignment)
          assignment.isGettingStartedAssignment =
            await AssignmentsService.isGettingStartedAssignment(assignment.id)
        res.json({
          assignment: assignment ? toAssigmentPublic(assignment) : undefined,
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/assignment/:assignmentId/students',
    async function (req, res: Response<StudentAssignmentCompletionResponse>) {
      try {
        const assignmentId = req.params.assignmentId as string
        const studentAssignments =
          await AssignmentsService.getStudentAssignmentCompletion(assignmentId)
        res.json({
          studentAssignments: studentAssignments.map(
            toStudentAssignmentSubmissionPublic
          ),
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.delete(
    '/assignment/:assignmentId',
    async function (req, res: Response<void>) {
      try {
        const assignmentId = asString(req.params.assignmentId)
        if (assignmentId) {
          await AssignmentsService.deleteAssignment(assignmentId)
          res.sendStatus(200)
        }
      } catch (err) {
        resError(res, err)
      }
    }
  )

  const upload = multer({
    limits: { fileSize: 20 * 1024 * 1024 },
  })

  router.put(
    '/assignment/upload',
    upload.array('files'),
    async (req, res: Response<AssignmentUploadResponse>) => {
      try {
        const user = extractUser(req)
        if (req.files) {
          const files = req.files as Express.Multer.File[]
          const assignmentId = req.body.assignmentId

          const moderationFailures =
            await AssignmentsService.uploadAssignmentFiles(
              assignmentId,
              files,
              user.id
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
    }
  )

  router.get(
    '/assignment/:assignmentId/documents',
    async (req, res: Response<AssignmentDocumentsResponse>) => {
      try {
        const assignmentId = asString(req.params.assignmentId)
        const assignmentDocuments =
          await AssignmentsService.getAssignmentDocuments(assignmentId)

        res.json({
          assignmentDocuments: assignmentDocuments.map(
            toAssignmentDocumentPublic
          ),
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
