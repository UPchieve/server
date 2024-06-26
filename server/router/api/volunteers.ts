import moment from 'moment'
import config from '../../config'
import * as VolunteersCtrl from '../../controllers/VolunteersCtrl'
import * as VolunteerService from '../../services/VolunteerService'
import { authPassport } from '../../utils/auth-utils'
import * as cache from '../../cache'
import { Router } from 'express'
import { asNumber, asString } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routeVolunteers(router: Router): void {
  router.get(
    '/volunteers/availability/:certifiedSubject',
    authPassport.isAdmin,
    async function(req, res) {
      try {
        const certifiedSubject = asString(req.params.certifiedSubject)
        const aggAvailabilities = await VolunteersCtrl.getVolunteersAvailability(
          certifiedSubject
        )
        res.json({
          msg: 'Users retreived from database',
          aggAvailabilities: aggAvailabilities,
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get('/volunteers/review', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const { page } = req.query
      const pageNum = page ? asNumber(page) : 1
      const {
        volunteers,
        isLastPage,
      } = await VolunteerService.getVolunteersToReview(pageNum)
      res.json({
        volunteers: volunteers.map(vol => ({
          ...vol,
          _id: vol.id,
          firstname: vol.firstName,
          lastname: vol.lastName,
        })),
        isLastPage,
      })
    } catch (error) {
      res
        .status(500)
        .json({ err: 'There was an error retrieving the pending volunteers.' })
    }
  })

  router.post('/volunteers/review/:id', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const volunteerId = asString(req.params.id)
      const { photoIdStatus } = req.body
      await VolunteerService.updatePendingVolunteerStatus(
        volunteerId,
        asString(photoIdStatus).toLowerCase()
      )
      res.sendStatus(200)
    } catch (error) {
      res.status(500).json({ err: (error as Error).message })
    }
  })

  router.get('/volunteers/hours-last-updated', async function(req, res) {
    try {
      const cacheValue = await cache.get(
        config.cacheKeys.updateTotalVolunteerHoursLastRun
      )
      const lastUpdated = moment(cacheValue).format('M/DD/YYYY')
      res.json({ lastUpdated })
    } catch (error) {
      if (error instanceof cache.KeyNotFoundError) {
        res.status(409)
      } else {
        res.status(500)
      }
      res.json({ err: (error as Error).message })
    }
  })
}
