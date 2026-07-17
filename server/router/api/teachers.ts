import { Router } from 'express'
import multer from 'multer'
import { extractUser } from '../extract-user'
import * as TeacherService from '../../services/TeacherService'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import { asNumber, asString } from '../../utils/type-utils'
import { authPassport } from '../../utils/auth-utils'
import { resSuccess } from '../res-success'

export function routeTeachers(apiRouter: Router): void {
  const router = Router()

  /* Classes */
  router.route('/class').post(async function (req, res) {
    try {
      const user = extractUser(req)
      const className = req.body.className as string
      const topicId = (req.body.topicId as number) ?? null
      const teacherClass = await TeacherService.createTeacherClass(
        user.id,
        className,
        topicId
      )
      res.json({ teacherClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/classes').get(async function (req, res) {
    try {
      const user = extractUser(req)
      const teacherClasses = await TeacherService.getTeacherClasses(user.id)
      res.json({ teacherClasses })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId/students').get(async function (req, res) {
    try {
      const classId = req.params.classId as string
      const students = await TeacherService.getStudentsInTeacherClass(classId)
      res.json({ students })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class').get(async function (req, res) {
    try {
      const classCode = req.query.classCode as string
      const teacherClass =
        await TeacherService.getTeacherClassByClassCode(classCode)
      res.json({ teacherClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId').get(async function (req, res) {
    try {
      const classId = req.params.classId as string
      const teacherClass = await TeacherService.getTeacherClassById(classId)
      res.json({ teacherClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/update').post(async function (req, res) {
    try {
      const className = asString(req.body.className)
      const topicId = asNumber(req.body.topicId)
      const id = asString(req.body.id)

      const updatedClass = await TeacherService.updateTeacherClass(
        id,
        className,
        topicId
      )
      res.json({ updatedClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/deactivate').post(async function (req, res) {
    try {
      const id = asString(req.body.id)

      const updatedClass = await TeacherService.deactivateTeacherClass(id)
      res.json({ updatedClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router
    .route('/class/:classId/student/:studentId/remove')
    .delete(async function (req, res) {
      try {
        const studentId = asString(req.params.studentId)
        const classId = asString(req.params.classId)
        if (studentId && classId) {
          const removedId = await TeacherService.removeStudentFromClass(
            studentId,
            classId
          )
          res.json({ removedId })
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
    .put(upload.array('files'), async function (req, res) {
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

        if (moderationInfractions || imageModerationInfractions) {
          return resSuccess(
            res,
            { moderationInfractions, imageModerationInfractions, assignment },
            422
          )
        }
        resSuccess(res, { assignment }, assignment?.isCreated ? 201 : 200)
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/assignments')
    .post(upload.array('files'), async function (req, res) {
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
        if (moderationInfractions || imageModerationInfractions) {
          return resSuccess(
            res,
            { moderationInfractions, imageModerationInfractions, assignments },
            422
          )
        }

        return resSuccess(res, { assignments }, 201)
      } catch (err) {
        resError(res, err)
      }
    })

  router.route('/class/:classId/assignments').get(async function (req, res) {
    try {
      const classId = req.params.classId as string
      const assignments =
        await AssignmentsService.getAssignmentsByClassId(classId)
      res.json({ assignments })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/assignments').get(async function (req, res) {
    try {
      const user = extractUser(req)
      const assignments = await AssignmentsService.getAllAssignmentsForTeacher(
        user.id
      )
      res.json({ assignments })
    } catch (err) {
      resError(res, err)
    }
  })

  apiRouter.use('/teachers', authPassport.isTeacher, router)
}
