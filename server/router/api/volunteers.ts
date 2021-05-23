import moment from 'moment'
import config from '../../config'
import * as VolunteersCtrl from '../../controllers/VolunteersCtrl'
import * as UserService from '../../services/UserService'
import { authPassport } from '../../utils/auth-utils'
import * as cache from '../../cache'

export default function(router) {
  router.get('/volunteers', authPassport.isAdmin, function(req, res, next) {
    VolunteersCtrl.getVolunteers(function(volunteers, err) {
      if (err) {
        next(err)
      } else {
        res.json({
          msg: 'Users retreived from database',
          volunteers: volunteers
        })
      }
    })
  })

  router.get(
    '/volunteers/availability/:certifiedSubject',
    authPassport.isAdmin,
    function(req, res, next) {
      const certifiedSubject = req.params.certifiedSubject
      VolunteersCtrl.getVolunteersAvailability(
        {
          certifiedSubject: certifiedSubject
        },
        function(aggAvailabilities, err) {
          if (err) {
            next(err)
          } else {
            res.json({
              msg: 'Users retreived from database',
              aggAvailabilities: aggAvailabilities
            })
          }
        }
      )
    }
  )

  router.get('/volunteers/review', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const { page } = req.query
      const {
        volunteers,
        isLastPage
      } = await UserService.getVolunteersToReview(page)
      res.json({ volunteers, isLastPage })
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
    const { id } = req.params
    const { photoIdStatus, referencesStatus } = req.body

    try {
      await UserService.updatePendingVolunteerStatus({
        volunteerId: id,
        photoIdStatus,
        referencesStatus
      })
      res.sendStatus(200)
    } catch (error) {
      res.status(500).json({ err: error.message })
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
      res.json({ err: error.message })
    }
  })
}
