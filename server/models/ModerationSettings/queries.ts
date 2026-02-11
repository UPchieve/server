import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'
import { ModerationType, GetModerationSettingResult } from './types'

export const getContextualSettings = getSettings('contextual')
export const getRealTimeSettings = getSettings('realtime_image')

function getSettings(moderationType: ModerationType) {
  return async (
    client: TransactionClient = getClient()
  ): Promise<GetModerationSettingResult[]> => {
    try {
      const result = await pgQueries.getModerationSettingsByType.run(
        {
          moderationType,
        },
        client
      )

      return result.map((row) => {
        const data = makeRequired(row)
        return {
          name: data.name,
          threshold: Number(data.threshold),
          penaltyWeight: Number(data.penaltyWeight),
        }
      })
    } catch (err) {
      throw new RepoReadError(err)
    }
  }
}
