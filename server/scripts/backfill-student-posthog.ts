import { processStudentTrackingPostHog } from '../services/StudentService'
import { asUlid } from '../utils/type-utils'
import { Job } from 'bull'
import { log } from '../worker/logger'

type BackfillStudentPosthogData = {
  studentId: string
}

export default async function BackfillStudentPosthog(
  job: Job<BackfillStudentPosthogData>
) {
  const studentId = asUlid(job.data.studentId)

  await processStudentTrackingPostHog(studentId)
  log(`Successfully updated posthog association for student ${studentId}`)
}
