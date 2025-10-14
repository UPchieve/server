import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'
// run with `npx ts-node server/scripts/testing-jobs.ts`
async function main() {
  let exitCode = 0
  try {
    // const jobToQueue = 'Some sample job' as Jobs // Jobs.EmailOnboardingReminderOne
    const jobToQueue = Jobs.TestJob
    await QueueService.addMQ(jobToQueue, { butt: 'hi' })
    console.log('Added: ', jobToQueue)
  } catch (error) {
    console.log('Error: ', error)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

main()
