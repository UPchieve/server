import express, { Express, Router } from 'express'
import { extractUserIfExists } from '../extract-user'
import { resError } from '../res-error'
import * as StudentService from '../../services/StudentService'
import * as VolunteerService from '../../services/VolunteerService'
import * as TeacherService from '../../services/TeacherService'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import { InputError } from '../../models/Errors'
import { asString } from '../../utils/type-utils'

export function routes(app: Express) {
  const router: Router = express.Router()

  router.post('/students/class', async function (req, res) {
    try {
      const classCode = req.body.classCode as string
      const email = req.body.email as string
      const authenticatedUser = extractUserIfExists(req)

      if (authenticatedUser?.email.toLowerCase() === email.toLowerCase()) {
        const teacherClass =
          await TeacherService.addStudentToTeacherClassByClassCode(
            authenticatedUser.id,
            classCode
          )
        return res.json({ teacherClass })
      }

      const teacherClass =
        await TeacherService.getTeacherClassByClassCode(classCode)
      if (!teacherClass) {
        throw new InputError('Invalid class code.')
      }

      const isExistingStudent =
        await StudentService.doesStudentWithEmailExist(email)
      res.json({ isExistingStudent })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/nths-groups/join', async function (req, res) {
    try {
      const inviteCode = asString(req.body.inviteCode)
      const email = asString(req.body.email).toLocaleLowerCase()
      const authenticatedUser = extractUserIfExists(req)
      const group = await NTHSGroupsService.getNTHSGroupByInviteCode(inviteCode)

      if (!group) {
        throw new InputError('Invalid team invite code')
      }

      if (
        authenticatedUser &&
        authenticatedUser.email.toLowerCase() === email
      ) {
        const existingGroups = await NTHSGroupsService.getGroups(
          authenticatedUser.id
        )

        // For now, we won't let you join multiple groups
        if (existingGroups.length > 0) {
          return res.json({ NTHSGroup: existingGroups[0] })
        }

        const NTHSGroup = await NTHSGroupsService.joinGroupAsMemberByGroupId(
          authenticatedUser.id,
          group.id
        )

        return res.json({ NTHSGroup })
      }

      const isExistingVolunteer =
        await VolunteerService.doesVolunteerWithEmailExist(email)
      res.json({ isExistingVolunteer })
    } catch (err) {
      resError(res, err)
    }
  })
  router.get('/nths-groups/:inviteCode', async function (req, res) {
    try {
      const inviteCode = asString(req.params.inviteCode)
      const group = await NTHSGroupsService.getNTHSGroupByInviteCode(inviteCode)

      if (!group) {
        throw new InputError('Invalid team invite code')
      }
      return res.json({ NTHSGroup: group })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public', router)
}
