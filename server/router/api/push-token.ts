import PushToken from '../../models/PushToken'
import { User } from '../../models/User'
import { Router, Request, Response } from 'express'

export default function(router: Router) {
  router.post('/push-token/save', async function(req: Request, res: Response) {
    const { token } = req.body
    const user = req.user as User
    const pushToken = new PushToken({
      user: user._id,
      token
    })

    try {
      await pushToken.save()
      res.sendStatus(200)
    } catch (error) {
      res.sendStatus(422)
    }
  })
}
