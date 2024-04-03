import { migrateProgressReportPromptIds } from '../models/ProgressReports'
import { log } from '../worker/logger'

export default async function MigrateProgressReportPromptIds(): Promise<void> {
  await migrateProgressReportPromptIds()
  log('Successfully updated progress report prompt ids')
}
