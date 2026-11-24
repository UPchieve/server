import _ from 'lodash'
import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeSomeRequired } from '../pgUtils'
import { ModerationType, GetModerationSettingResult } from './types'

export const getContextualSettings = getSettings('contextual')
export const getRealTimeSettings = getSettings('realtime_image')
export const getImageUploadSettings = getSettings('image_upload')

function getSettings(moderationType: ModerationType) {
  return async (client: TransactionClient = getClient()) => {
    try {
      const result = await pgQueries.getModerationSettingsByType.run(
        {
          moderationType,
        },
        client
      )

      const results = result.map((row) => {
        const data = makeSomeRequired(row, [
          'name',
          'threshold',
          'penaltyWeight',
        ])
        return {
          name: data.name,
          threshold: Number(data.threshold),
          penaltyWeight: Number(data.penaltyWeight),
        }
      })

      return _.keyBy(results, 'name') as GetModerationSettingResult
    } catch (err) {
      throw new RepoReadError(err)
    }
  }
}
