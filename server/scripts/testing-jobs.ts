import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'

async function main() {
  let exitCode = 0
  try {
    const jobToQueue = 'Some sample job' // Jobs.EmailOnboardingReminderOne
    await QueueService.add(jobToQueue, {})
    console.log('Added: ', jobToQueue)
  } catch (error) {
    console.log('Error: ', error)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

main()
