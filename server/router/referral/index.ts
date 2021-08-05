import express from 'express'
import * as UserService from '../../services/UserService'
import { Express, Request, Response, NextFunction, Router } from 'express'

export default function referralRouter(app: Express): void {
  const router: Router = express.Router() // eslint-disable-line @typescript-eslint/no-explicit-any

  router.get('/:referralCode', async function(req: Request, res: Response, next: NextFunction) {
    const { referralCode } = req.params

    try {
      const user = await UserService.getUser(
        { referralCode },
        {
          firstname: 1
        }
      )
      res.json({ user })
    } catch (err) {
      next(err)
    }
  })

  app.use('/api-public/referral', router)
}
