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

  router.post('/assignment/upload', upload.single('file'), async function(req, res) {
    try {

        if(req.file){
          const file = req.file
          const assignmentId = req.body.assignmentId
          const fileName = req.body.fileName
          const response = await AssignmentsService.uploadAssignment(
            assignmentId,
            fileName,
            file
          )

          res.json({ response })
        }
      // console.log('***inside post request')
      // console.log('***req body', req.body)
      // const assignmentId = req.body.assignmentId as string
      // const fileName = req.body.fileName as string
      // const file = req.body.file as string
      // console.log('***assignment id', assignmentId)
      // console.log('****filename', fileName)
      // console.log('****files', file)
      // const response = await AssignmentsService.uploadAssignment(assignmentId, fileName, file)
      // res.json({ response })
    } catch (err) {
      resError (res, err)
    }
  })
}
