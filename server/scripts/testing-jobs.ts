import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'

async function main() {
  let exitCode = 0
  try {
    const jobToQueue = Jobs.SendVolunteerFeedbackToStudent // Jobs.EmailOnboardingReminderOne
    await QueueService.add(jobToQueue, {
      volunteerFeedback: 'Hello World!!!',
      sessionId: '0198c3f4-55eb-be7e-c933-d01e4b43e86d',
    })
    console.log('Added: ', jobToQueue)
  } catch (error) {
    console.log('Error: ', error)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

main()
