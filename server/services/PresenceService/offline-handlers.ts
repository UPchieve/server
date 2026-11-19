import logger from '../../logger'
import { Ulid } from '../../types/shared'
import type { OnlineRole } from './index'

/**
 * Handler to be called when a user goes offline.
 */
type OfflineHandler = {
  name: string
  handler: (userId: Ulid) => Promise<void>
}

const offlineHandlersByUserRole: Record<OnlineRole, OfflineHandler[]> = {
  student: [],
  volunteer: [],
  teacher: [],
}

/**
 * Registers a handler to run when a user goes offline in one of `roles`.
 *
 * Handlers are stored per process, so they run only in a process that
 * registered them.
 *
 * **Register from an init that every process runs (see
 * services/listeners)!!** Or else an offline event that's handled by a process
 * that skipped registration would not run the handlers.
 *
 * @param roles - the roles that the handler should be applied for
 * @param name - unique name of handler, prevents duplicative registration
 */
export function registerOfflineHandler(
  roles: OnlineRole[],
  name: string,
  handler: (userId: Ulid) => Promise<void>
) {
  for (const role of roles) {
    if (offlineHandlersByUserRole[role].some((h) => h.name === name)) continue
    offlineHandlersByUserRole[role].push({ name, handler })
  }
}

export async function runOfflineHandlers(userId: Ulid, role: OnlineRole) {
  for (const { name, handler } of offlineHandlersByUserRole[role]) {
    try {
      await handler(userId)
    } catch (err) {
      logger.error(`Failed to run role exit handler ${name}`, {
        err,
        userId,
        role,
      })
    }
  }
}
