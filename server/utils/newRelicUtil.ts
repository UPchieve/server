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
      logger.info(
        `handling ${event} with ${name} on args ${JSON.stringify(args)}`
      )
      try {
        await handler(...args)
        logger.info(`${name} successfully handled event ${event}`)
      } catch (error) {
        logger.error(error, `${name} error handling event ${event}`)
      } finally {
        transaction.end()
      }
    }).catch((error) => {
      logger.error(error, `error in event handler newrelic transaction`)
    })
  }
}

type WebTransactionError = {
  error: Error
  details?: { [key: string]: string | number | boolean }
  message?: string
}

export async function observeWebTransaction(
  url: string,
  webTransaction: (...args: any[]) => Promise<void>
) {
  nr.startWebTransaction(url, async () => {
    const transaction = nr.getTransaction()

    try {
      await webTransaction()
    } catch (error: any) {
      logger.error(error, false)
    } finally {
      transaction.end()
    }
  }).catch((error) => {
    logger.error(error, false)
  })
}
