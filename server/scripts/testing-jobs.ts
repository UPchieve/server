import QueueService from '../services/QueueService'

async function main() {
  let exitCode = 0
  try {
    const jobToQueue = 'EndStaleSessions'
    await QueueService.add(jobToQueue, { delay: 0 })
    console.log('Added: ', jobToQueue)
  } catch (error) {
    console.log('Error: ', error)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

main()
