import { Express, Router } from 'express'
import { extractUser } from '../extract-user'
import * as TeacherService from '../../services/TeacherService'
import * as AssignmentsService from '../../services/AssignmentsService'
import { resError } from '../res-error'

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
      const assignmentData = {
        classId: req.body.classId as string,
        description: (req.body.description as string) ?? null,
        title: (req.body.title as string) ?? null,
        numberOfSessions: (req.body.numberOfSessions as number) ?? null,
        minDurationInMinutes: (req.body.minDurationInMinutes as number) ?? null,
        isRequired: req.body.isRequired as boolean,
        dueDate: (req.body.dueDate as Date) ?? null,
        startDate: (req.body.startDate as Date) ?? null,
        subjectId: (req.body.subjectId as number) ?? null,
      }
      const assignment = await AssignmentsService.createAssignment(assignmentData)
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

  app.use('/api/teachers', router)
}
