import { deleteDuplicateUserSurveys } from '../models/Survey'
import { log } from '../worker/logger'

export default async function main(): Promise<void> {
  await deleteDuplicateUserSurveys()
  log(`Successfully deleted duplicate user surveys`)
}
