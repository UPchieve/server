import * as ZCRepo from '../models/ZipCode'
import logger from '../logger'

export default async function upsertPostalCodes(): Promise<
  void
  > {
  try {
    const result = await ZCRepo.upsertZipcodes()
  } catch (err) {
    logger.error(`Error upserting new zipcode data: ${err}`)
  }
}
