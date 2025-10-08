import { Job, JobOptions } from 'bull'
import QueueService from '../../services/QueueService'
import logger from '../../logger'
import { Jobs } from '../../worker/jobs'

type JobData = {
  name: string
  data?: object
  options: JobOptions
}
type JobSchedulerData = {
  jobs: JobData[]
}

export default async function scheduleJobs({ data }: Job<JobSchedulerData>) {
  for (const job of data.jobs) {
    if (!job.name || !Object.values(Jobs).includes(job.name as Jobs)) {
      throw new Error('Please provide a valid job name')
    } else if (!job.options.repeat) {
      throw new Error('Please provide a job repeat option')
    }

    await QueueService.add(job.name as Jobs, job.data, job.options)
    logger.info(data, `Added ${job.name} to the queue with jobOptions:`)
  }
}
