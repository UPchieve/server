import nr from 'newrelic'
import logger from '../logger'

export function eventObservabilityWrapper(
  event: string,
  handler: (...args: any[]) => Promise<void>,
  name: string
): (...args: any[]) => void {
  return (...args: any[]) => {
    nr.startBackgroundTransaction(`event:${event}`, async () => {
      const transaction = nr.getTransaction()
      logger.info(`handling ${event} with ${name}`, { args })
      try {
        await handler(...args)
        logger.info(`${name} successfully handled event ${event}`)
      } catch (error) {
        logger.error(`${name} error handling event ${event}`, { err: error })
      } finally {
        transaction.end()
      }
    }).catch((error) => {
      logger.error(`error in event handler newrelic transaction`, {
        err: error,
      })
    })
  }
}

export async function observeWebTransaction(
  url: string,
  webTransaction: (...args: any[]) => Promise<void>
) {
  nr.startWebTransaction(url, async () => {
    const transaction = nr.getTransaction()

    try {
      await webTransaction()
    } catch (error) {
      logger.error('Error in newrelic web transaction', { err: error })
    } finally {
      transaction.end()
    }
  }).catch((error) => {
    logger.error('Error in newrelic web transaction', { err: error, url })
  })
}
