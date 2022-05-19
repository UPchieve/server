import { deleteDuplicatePushTokens } from '../models/PushToken'
import { log } from '../worker/logger'
import { Job } from 'bull'

type DeleteDuplicatePushTokensData = {}

export default async function DeleteDuplicatePushTokens(
  job: Job<DeleteDuplicatePushTokensData>
): Promise<void> {
  await deleteDuplicatePushTokens()
  log(`Successfully deleted duplatcate push tokens`)
}
