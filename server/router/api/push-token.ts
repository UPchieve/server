import PushToken from '../../models/PushToken'
import { User } from '../../models/User'

export default function(router) {
  router.post('/push-token/save', async function(req, res) {
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
