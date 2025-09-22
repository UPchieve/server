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

export async function observeWebTransaction(
  url: string,
  webTransaction: (...args: any[]) => Promise<void>
) {
  nr.startWebTransaction(url, async () => {
    const transaction = nr.getTransaction()

    try {
      await webTransaction()
    } catch (error) {
      nr.noticeError(error as Error)
    } finally {
      transaction.end()
    }
  }).catch(
    (error: {
      error: Error
      details?: { [key: string]: string | number | boolean }
      message?: string
    }) => {
      const errorContext = error?.details ? error.details : {}
      logger.error(
        { err: error.error, ...errorContext },
        error?.message ? error.message : ''
      )
      nr.noticeError(error.error, errorContext, true)
    }
  )
}
