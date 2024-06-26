import nr from 'newrelic'

import logger from '../../logger'
import { emitter } from '../EventsService'

function eventObservabilityWrapper(
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
    }).catch(error => {
      logger.error(`error in event handler newrelic transaction: ${error}`)
      nr.noticeError(error)
    })
  }
}

/**
 * Registers a handler for an event with standard observability patterns. Handlers
 * should throw errors to be logged by the wrapper instead of logging on their own
 *
 * @param event {string} event name
 * @param handler {Function} event handler
 */
export default function register(
  event: string,
  handler: (...args: any[]) => Promise<void>,
  name: string
): void {
  emitter.on(event, eventObservabilityWrapper(event, handler, name))
}
