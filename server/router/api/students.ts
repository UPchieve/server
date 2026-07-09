import type { Router, Response } from 'express'
import config from '../../config'
import * as StudentRepo from '../../models/Student/queries'
import { asBoolean, asNumber, asUlid, asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as StudentService from '../../services/StudentService'
import * as AssignmentsService from '../../services/AssignmentsService'
import { FavoriteLimitReachedError } from '../../services/Errors'
import { authPassport } from '../../utils/auth-utils'
import type {
  ActivePartnerOrgsResponse,
  ActiveStudentClassesResponse,
  FavoriteLimitReachedResponse,
  FavoriteVolunteersResponse,
  IsFavoriteVolunteerResponse,
  RemainingFavoriteAmountResponse,
} from '../../contracts/students'
import {
  toFavoriteVolunteerPublic,
  toStudentPartnerOrgInstancePublic,
} from '../../public/students'
import { toTeacherClassForStudentPublic } from '../../public/teachers'
import { toStudentAssignmentPublic } from '../../public/assignments'
import { StudentAssignmentsResponse } from '../../contracts/assignments'

export function routeStudents(router: Router): void {
  router.get(
    '/students/remaining-favorite-volunteers',
    async function (req, res: Response<RemainingFavoriteAmountResponse>) {
      try {
        const user = extractUser(req)
        const totalFavoriteVolunteers =
          await StudentRepo.getTotalFavoriteVolunteers(String(user.id))
        res.json({
          remaining: config.favoriteVolunteerLimit - totalFavoriteVolunteers,
        })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get(
    '/students/favorite-volunteers',
    async function (req, res: Response<FavoriteVolunteersResponse>) {
      try {
        const user = extractUser(req)
        const page = asNumber(req.query.page)
        const result = await StudentService.getFavoriteVolunteersPaginated(
          String(user.id),
          page
        )
        res.json({
          favoriteVolunteers: result.favoriteVolunteers.map(
            toFavoriteVolunteerPublic
          ),
          isLastPage: result.isLastPage,
        })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get(
    '/students/favorite-volunteers/:volunteerId',
    async function (req, res: Response<IsFavoriteVolunteerResponse>) {
      try {
        const volunteerId = asString(req.params.volunteerId)
        const user = extractUser(req)
        const isFavorite = await StudentRepo.isFavoriteVolunteer(
          String(user.id),
          volunteerId
        )
        res.json({
          isFavorite,
        })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.post(
    '/students/favorite-volunteers/:volunteerId',
    async function (
      req,
      res: Response<IsFavoriteVolunteerResponse | FavoriteLimitReachedResponse>
    ) {
      try {
        const volunteerId = asUlid(req.params.volunteerId)
        const user = extractUser(req)
        const isFavorite = asBoolean(req.body.isFavorite)
        const sessionId = req.body.sessionId
          ? asUlid(req.body.sessionId)
          : undefined

        const result = await StudentService.checkAndUpdateVolunteerFavoriting(
          isFavorite,
          user.id,
          volunteerId,
          sessionId,
          asString(req.ip)
        )

        res.json({ isFavorite: result.isFavorite })
      } catch (error) {
        if (error instanceof FavoriteLimitReachedError) {
          res.status(422).json({
            success: false,
            message: error.message,
          })
        } else resError(res, error)
      }
    }
  )

  router.get(
    '/students/partners/active',
    authPassport.isAdmin,
    async function (req, res: Response<ActivePartnerOrgsResponse>) {
      try {
        const studentId = req.query.student
        const activePartners =
          await StudentService.adminGetActivePartnersForStudent(
            asString(studentId)
          )
        res.json({
          activePartners:
            activePartners?.map(toStudentPartnerOrgInstancePublic) || [],
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/students/classes',
    async function (req, res: Response<ActiveStudentClassesResponse>) {
      try {
        const user = extractUser(req)
        const classes = await StudentService.getActiveClassesForStudent(user.id)
        res.json({ classes: classes.map(toTeacherClassForStudentPublic) })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/students/assignments',
    async function (req, res: Response<StudentAssignmentsResponse>) {
      try {
        const user = extractUser(req)
        const assignments = await AssignmentsService.getAssignmentsByStudentId(
          user.id
        )
        res.json({ assignments: assignments.map(toStudentAssignmentPublic) })
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
