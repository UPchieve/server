import { Job } from 'bull'
import * as MailService from '../../services/MailService'
import { Ulid } from '../../models/pgUtils'

export type SyncSendGridContactJobData = {
  userId: Ulid
}

export default async (job: Job<SyncSendGridContactJobData>): Promise<void> => {
  await MailService.createContact(job.data.userId)
}
