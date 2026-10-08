import { Router, type Response } from 'express'
import multer from 'multer'
import { extractUser } from '../extract-user'
import * as TeacherService from '../../services/TeacherService'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import { asNumber, asString } from '../../utils/type-utils'
import { authPassport } from '../../utils/auth-utils'
import { resSuccess } from '../res-success'
import type {
  TeacherClassResponse,
  TeacherClassWithStudentsResponse,
  StudentsInTeacherClassResponse,
  UpdateTeacherClassResponse,
  RemovedStudentFromClassResponse,
  TeacherUpsertAssignmentResponse,
  TeacherCreateAssignmentsResponse,
  TeacherAssignmentsResponse,
} from '../../contracts/teachers'
import {
  toTeacherAssignmentPublic,
  toTeacherClassPublic,
  toTeacherClassWithStudentsPublic,
} from '../../contracts/teachers.mappers'
import { toStudentProfilePublic } from '../../contracts/students.mappers'

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
      res.json({ teacherClass: toTeacherClassPublic(teacherClass) })
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
        updatedClass: updatedClass
          ? toTeacherClassPublic(updatedClass)
          : undefined,
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
  const upload = multer({
    limits: { fileSize: 20 * 1024 * 1024 },
  })

  router
    .route('/assignment')
    .put(
      upload.array('files'),
      async function (req, res: Response<TeacherUpsertAssignmentResponse>) {
        try {
          const user = extractUser(req)
          const assignmentData = AssignmentsService.asAssignment(
            JSON.parse(req.body.assignmentData)
          )
          const {
            assignment,
            moderationInfractions,
            imageModerationInfractions,
          } = await AssignmentsService.upsertAssignment(
            user.id,
            assignmentData,
            req.files as Express.Multer.File[]
          )

          const publicAssignment = assignment
            ? {
                ...toTeacherAssignmentPublic(assignment),
                isCreated: assignment.isCreated,
              }
            : undefined

          if (moderationInfractions || imageModerationInfractions) {
            return resSuccess<TeacherUpsertAssignmentResponse>(
              res,
              {
                moderationInfractions,
                imageModerationInfractions,
                assignment: publicAssignment,
              },
              422
            )
          }
          resSuccess<TeacherUpsertAssignmentResponse>(
            res,
            { assignment: publicAssignment },
            assignment?.isCreated ? 201 : 200
          )
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router
    .route('/assignments')
    .post(
      upload.array('files'),
      async function (req, res: Response<TeacherCreateAssignmentsResponse>) {
        try {
          const user = extractUser(req)
          const assignmentData = AssignmentsService.asMultipleAssignments(
            JSON.parse(req.body.assignmentData)
          )

          const {
            assignments,
            moderationInfractions,
            imageModerationInfractions,
          } = await AssignmentsService.createAssignmentForClasses(
            user.id,
            assignmentData,
            assignmentData.classIds,
            req.files as Express.Multer.File[]
          )
          const publicAssignments = assignments?.map(toTeacherAssignmentPublic)
          if (moderationInfractions || imageModerationInfractions) {
            return resSuccess<TeacherCreateAssignmentsResponse>(
              res,
              {
                moderationInfractions,
                imageModerationInfractions,
                assignments: publicAssignments,
              },
              422
            )
          }

          return resSuccess<TeacherCreateAssignmentsResponse>(
            res,
            { assignments: publicAssignments },
            201
          )
        } catch (err) {
          resError(res, err)
        }
      }
    )

  router.route('/class/:classId/assignments').get(async function (
    req,
    res: Response<TeacherAssignmentsResponse>
  ) {
    try {
      const classId = req.params.classId as string
      const assignments =
        await AssignmentsService.getAssignmentsByClassId(classId)
      res.json({ assignments: assignments.map(toTeacherAssignmentPublic) })
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
      res.json({ assignments: assignments.map(toTeacherAssignmentPublic) })
    } catch (err) {
      resError(res, err)
    }
  })

  apiRouter.use('/teachers', authPassport.isTeacher, router)
}
