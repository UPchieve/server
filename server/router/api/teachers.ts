import { Express, Router } from 'express'
import { extractUser } from '../extract-user'
import * as TeacherService from '../../services/TeacherService'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'
import { asString, asArray } from '../../utils/type-utils'

export function routeTeachers(app: Express, router: Router): void {
  /* Classes */
  router.route('/class').post(async function(req, res) {
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

  router.route('/classes').get(async function(req, res) {
    try {
      const user = extractUser(req)
      const teacherClasses = await TeacherService.getTeacherClasses(user.id)
      res.json({ teacherClasses })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId/students').get(async function(req, res) {
    try {
      const classId = req.params.classId as string
      const students = await TeacherService.getStudentsInTeacherClass(classId)
      res.json({ students })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class').get(async function(req, res) {
    try {
      const classCode = req.query.classCode as string
      const teacherClass = await TeacherService.getTeacherClassByClassCode(
        classCode
      )
      res.json({ teacherClass })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId').get(async function(req, res) {
    try {
      const classId = req.params.classId as string
      const teacherClass = await TeacherService.getTeacherClassById(classId)
      res.json({ teacherClass })
    } catch (err) {
      resError(res, err)
    }
  })

  /* Assignments */
  router.route('/assignment').post(async function(req, res) {
    try {
      const assignmentData = AssignmentsService.asAssignment(
        req.body.assignmentData
      )
      const studentIds = req.body.studentIds
      const assignment = await AssignmentsService.createAssignment(
        assignmentData,
        studentIds
      )
      res.json({ assignment })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/class/:classId/assignments').get(async function(req, res) {
    try {
      const classId = req.params.classId as string
      const assignments = await AssignmentsService.getAssignmentsByClassId(
        classId
      )
      res.json({ assignments })
    } catch (err) {
      resError(res, err)
    }
  })

  router.route('/assignments').get(async function(req, res) {
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

  app.use('/api/teachers', router)
}
