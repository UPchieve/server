import { Express, Router } from 'express'
import { authPassport } from '../../utils/auth-utils'
import { getPartnerSchools } from '../../services/SchoolService'
import { resError } from '../res-error'

export function routeAdmin(app: Express, router: Router): void {
  router.get('/schools/partner-schools', async function(_req, res) {
    try {
      const schools = await getPartnerSchools()
      res.send(schools)
    } catch (error) {
      resError(res, error)
    }
  })

  app.use('/admin', authPassport.isAdmin, router)
}
