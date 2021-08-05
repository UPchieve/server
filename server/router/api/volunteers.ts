import moment from 'moment'
import config from '../../config'
import * as VolunteersCtrl from '../../controllers/VolunteersCtrl'
import * as UserService from '../../services/UserService'
import { authPassport } from '../../utils/auth-utils'
import * as cache from '../../cache'
import { Request, Response, NextFunction, Router } from 'express'
import { Volunteer } from '../../models/Volunteer'

export default function(router: Router) {
  router.get('/volunteers', authPassport.isAdmin, function(req: Request, res: Response, next: NextFunction) {
    VolunteersCtrl.getVolunteers(function(volunteers: Volunteer[], err: Error) {
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
    function(req: Request, res: Response, next: NextFunction) {
      const certifiedSubject = req.params.certifiedSubject
      VolunteersCtrl.getVolunteersAvailability(
        {
          certifiedSubject: certifiedSubject
        },
        function(aggAvailabilities: any, err: Error) {
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
    req: Request, res: Response
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
    req: Request, res: Response
  ) {
    const { id } = req.params
    const { photoIdStatus, referencesStatus } = req.body

    try {
      await UserService.updatePendingVolunteerStatus(
        id,
        photoIdStatus,
        referencesStatus
      )
      res.sendStatus(200)
    } catch (error) {
      res.status(500).json({ err: error.message })
    }
  })

  router.get('/volunteers/hours-last-updated', async function(req: Request, res: Response) {
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
