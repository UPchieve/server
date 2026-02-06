import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'
import { ModerationSettingsType, ModerationSettingsResult } from './types'

function getSettings(moderationType: ModerationSettingsType) {
  return async (
    client: TransactionClient = getClient()
  ): Promise<ModerationSettingsResult[]> => {
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
          penalty_weight: Number(data.penaltyWeight),
        }
      })
    } catch (err) {
      throw new RepoReadError(err)
    }
  }
}

export const getContextualSettings = getSettings('contextual')

export const getRealTimeSettings = getSettings('realtime_image')
