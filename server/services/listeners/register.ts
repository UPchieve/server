import { emitter } from '../EventsService'
import { eventObservabilityWrapper } from '../../utils/newRelicUtil'

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
