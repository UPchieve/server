import { listeners as StudentServiceListeners } from './StudentServiceListeners'
import { listeners as UserCreationServiceListeners } from './UserCreationServiceListeners'
import { registerOfflineHandlers as registerSessionOfferOfflineHandlers } from '../SessionOfferService'

/**
 * Shared init for every process: the API server (main.ts) and the worker
 * (worker/index.ts) both call this. Anything that has to be set up no matter
 * which process ends up handling an event belongs here.
 */
export function registerListeners() {
  StudentServiceListeners()
  UserCreationServiceListeners()
  // Presence can mark coaches offline from any process (including the worker),
  // so every process needs the offline handlers. See `registerOfflineHandlers`
  registerSessionOfferOfflineHandlers()
}
