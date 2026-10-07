import { deleteDuplicateUserSurveys } from '../models/Survey'
import logger from '../logger'

export default async function main(): Promise<void> {
  await deleteDuplicateUserSurveys()
  logger.info(`Successfully deleted duplicate user surveys`)
}
