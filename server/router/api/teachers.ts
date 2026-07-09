import { Response, Router } from 'express'
import { extractUser } from '../extract-user'
import * as TeacherService from '../../services/TeacherService'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import { asNumber, asString } from '../../utils/type-utils'
import { authPassport } from '../../utils/auth-utils'
import {
  toTeacherClassPublic,
  toTeacherClassWithStudentsPublic,
} from '../../public/teachers'
import type {
  RemovedStudentFromClassResponse,
  StudentsInTeacherClassResponse,
  TeacherAssignmentsResponse,
  TeacherClassResponse,
  TeacherClassWithStudentsResponse,
  TeacherCreateAssignmentResponse,
  UpdateTeacherClassResponse,
} from '../../contracts/teachers'
import { toStudentProfilePublic } from '../../public/students'
import { toAssignmentPublic } from '../../public/assignments'

export function routeTeachers(apiRouter: Router): void {
  const router = Router()

  /* Classes */
  router.route('/class').post(async function (
    req,
    res: Response<TeacherClassResponse>
  ) {
    try {
      const user = extractUser(req)
      const className = req.body.className as string
      const topicId = (req.body.topicId as number) ?? null
      const teacherClass = await TeacherService.createTeacherClass(
        user.id,
        className,
        topicId
      )
      res.json({
        teacherClass: teacherClass
          ? toTeacherClassPublic(teacherClass)
          : undefined,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/classes').get(async function (
    req,
    res: Response<TeacherClassWithStudentsResponse>
  ) {
    try {
      const user = extractUser(req)
      const teacherClasses = await TeacherService.getTeacherClasses(user.id)
      res.json({
        teacherClasses: teacherClasses.map(toTeacherClassWithStudentsPublic),
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId/students').get(async function (
    req,
    res: Response<StudentsInTeacherClassResponse>
  ) {
    try {
      const classId = req.params.classId as string
      const students = await TeacherService.getStudentsInTeacherClass(classId)
      res.json({ students: students.map(toStudentProfilePublic) })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class').get(async function (
    req,
    res: Response<TeacherClassResponse>
  ) {
    try {
      const classCode = req.query.classCode as string
      const teacherClass =
        await TeacherService.getTeacherClassByClassCode(classCode)
      res.json({
        teacherClass: teacherClass
          ? toTeacherClassPublic(teacherClass)
          : undefined,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId').get(async function (
    req,
    res: Response<TeacherClassResponse>
  ) {
    try {
      const classId = req.params.classId as string
      const teacherClass = await TeacherService.getTeacherClassById(classId)
      res.json({
        teacherClass: teacherClass
          ? toTeacherClassPublic(teacherClass)
          : undefined,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/update').post(async function (
    req,
    res: Response<UpdateTeacherClassResponse>
  ) {
    try {
      const className = asString(req.body.className)
      const topicId = asNumber(req.body.topicId)
      const id = asString(req.body.id)

      const updatedClass = await TeacherService.updateTeacherClass(
        id,
        className,
        topicId
      )
      res.json({
        updatedClass: updatedClass
          ? toTeacherClassPublic(updatedClass)
          : undefined,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/deactivate').post(async function (
    req,
    res: Response<UpdateTeacherClassResponse>
  ) {
    try {
      const id = asString(req.body.id)

      const updatedClass = await TeacherService.deactivateTeacherClass(id)
      res.json({
        updatedClass: toTeacherClassPublic(updatedClass),
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router
    .route('/class/:classId/student/:studentId/remove')
    .delete(async function (
      req,
      res: Response<RemovedStudentFromClassResponse>
    ) {
      try {
        const studentId = asString(req.params.studentId)
        const classId = asString(req.params.classId)
        if (studentId && classId) {
          const removedId = await TeacherService.removeStudentFromClass(
            studentId,
            classId
          )
          // TODO: Refactor frontend to use `studentId` instead of `studentid`
          // and to not expect an array
          res.json({
            removedId: removedId.map((student) => ({
              studentId: student.studentId,
              studentid: student.studentId,
            })),
          })
        }
      } catch (err) {
        resError(res, err)
      }
    })

  /* Assignments */
  router.route('/assignment').post(async function (
    req,
    res: Response<TeacherCreateAssignmentResponse>
  ) {
    try {
      const assignmentData = AssignmentsService.asAssignment(
        req.body.assignmentData,
        req.body.studentIds
      )
      const moderationFailures =
        await AssignmentsService.moderateAssignment(assignmentData)
      if (moderationFailures) {
        res.status(422).json({ moderationFailures })
        return
      }

      const assignment =
        await AssignmentsService.createAssignment(assignmentData)
      res.status(201).json({
        assignment: toAssignmentPublic(assignment),
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId/assignments').get(async function (
    req,
    res: Response<TeacherAssignmentsResponse>
  ) {
    try {
      const classId = req.params.classId as string
      const assignments =
        await AssignmentsService.getAssignmentsByClassId(classId)
      res.json({ assignments: assignments.map(toAssignmentPublic) })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/assignments').get(async function (
    req,
    res: Response<TeacherAssignmentsResponse>
  ) {
    try {
      const user = extractUser(req)
      const assignments = await AssignmentsService.getAllAssignmentsForTeacher(
        user.id
      )
      res.json({ assignments: assignments.map(toAssignmentPublic) })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/assignment/edit').post(async function (req, res) {
    try {
      const assignmentData = AssignmentsService.asEditedAssignment(
        req.body.assignmentData
      )
      const moderationFailures =
        await AssignmentsService.moderateAssignment(assignmentData)
      if (moderationFailures) {
        res.status(422).json({ moderationFailures })
        return
      }

      const result = await AssignmentsService.editAssignment(assignmentData)
      res.status(200).json({
        assignment: toAssignmentPublic(result),
      })
    } catch (err) {
      resError(res, err)
    }
  })

  apiRouter.use('/teachers', authPassport.isTeacher, router)
}
