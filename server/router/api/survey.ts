import expressWs from 'express-ws'
import { User } from '../../models/User'
import { savePresessionSurvey, getPresessionSurvey } from '../../models/Survey/queries'
import { NotAuthenticatedError } from '../../models/Errors'
import { asObjectId } from '../../utils/type-utils'

export function routeSurvey(router: expressWs.Router): void {
  router.post(
    '/survey/presession/:sessionId',
    async (req, res, next) => {
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      const { sessionId } = req.params
      const { responseData } = req.body
      try {
        await savePresessionSurvey(
          user._id,
          asObjectId(sessionId),
          responseData // TODO: type validation on this
        )
        res.sendStatus(200)
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    '/survey/presession/:sessionId',
    async (req, res, next) => {
      if (!req.user) throw new NotAuthenticatedError()
      const user = req.user as User
      const { sessionId } = req.params

      try {
        const survey = await getPresessionSurvey(
          user._id,
          asObjectId(sessionId)
        )
        res.json({ survey })
      } catch (error) {
        next(error)
      }
    }
  )
}
