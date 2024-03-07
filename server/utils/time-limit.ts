import logger from '../logger'

const DEFAULT_WAIT_IN_MS = 1000

/*
  The `timeLimit` util provides a way to gracefully fallback to a default value
  if the passed in `promise` takes more than the specified time or throws an error
*/
export const timeLimit = async <ResolveWith>({
  promise,
  fallbackReturnValue,
  timeLimitReachedErrorMessage,
  waitInMs = DEFAULT_WAIT_IN_MS,
}: {
  promise: Promise<ResolveWith>
  fallbackReturnValue: ResolveWith
  timeLimitReachedErrorMessage: string
  waitInMs?: number
}): Promise<ResolveWith> => {
  try {
    return await Promise.race([
      new Promise<ResolveWith>(resolve =>
        setTimeout(() => {
          logger.error(
            new Error(
              `Time limit of ${waitInMs}ms reached. ${timeLimitReachedErrorMessage}`
            )
          )
          resolve(fallbackReturnValue)
        }, waitInMs)
      ),
      promise,
    ])
  } catch (e) {
    logger.error(new Error(`Passed in promise '${promise}' rejected with ${e}`))
    return Promise.resolve(fallbackReturnValue)
  }
}
