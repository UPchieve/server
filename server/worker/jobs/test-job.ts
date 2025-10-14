import type { Job } from 'bullmq'

export default async (job: Job): Promise<void> => {
  console.log('\n\n==========TEST JOB==========\n\n', { job })
}
