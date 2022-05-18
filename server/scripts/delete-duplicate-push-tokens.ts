import { deleteDuplicatePushTokens } from '../models/PushToken'
import { log } from '../worker/logger'

export default async function DeleteDuplicatePushTokens(
) {
  let exitCode = 0
  try {
    await deleteDuplicatePushTokens()
    log(`Successfully deleted duplatcate push tokens`)
  } catch (error) {
    console.log('Error: ', error)
    exitCode = 1
  }
}
