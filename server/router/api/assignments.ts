import { Response, Router } from 'express'
import * as AssignmentsService from '../../services/AssignmentsService'
import {
  toAssigmentPublic,
  toAssignmentDocumentPublic,
  toStudentAssignmentSubmissionPublic,
} from '../../public/assignments'
import { resError } from '../res-error'
import { asString } from '../../utils/type-utils'
import {
  AssignmentDocumentsResponse,
  AssignmentResponse,
  StudentAssignmentCompletionResponse,
} from '../../contracts/assignments'

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
