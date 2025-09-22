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
        logger.error(`${name} error handling event ${event}: ${error}`)
        nr.noticeError(error as Error)
      } finally {
        transaction.end()
      }
    }).catch((error) => {
      logger.error(`error in event handler newrelic transaction: ${error}`)
      nr.noticeError(error)
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
      const errorWithDetails = error as WebTransactionError
      const errorContext = errorWithDetails?.details
        ? errorWithDetails.details
        : {}
      logger.error(
        { err: errorWithDetails.error, ...errorContext },
        errorWithDetails?.message ? error.message : ''
      )
      nr.noticeError(error as Error)
    } finally {
      transaction.end()
    }
  }).catch((error) => {
    nr.noticeError(error.error, false)
  })
}
