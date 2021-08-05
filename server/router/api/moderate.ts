import * as ModerationCtrl from '../../controllers/ModerationCtrl'
import { Request, Response, NextFunction, Router } from 'express'

export default function(router: Router) {
  router.route('/moderate/message').post((req: Request, res: Response, next: NextFunction) => {
    try {
      const isClean = ModerationCtrl.moderateMessage(req.body)
      res.json({ isClean })
    } catch (error) {
      next(error)
    }
  })
}
