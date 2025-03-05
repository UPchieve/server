import logger from '../logger'

const DEFAULT_WAIT_IN_MS = 2000

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
  fallbackReturnValue: any
  timeLimitReachedErrorMessage: string
  waitInMs?: number
}): Promise<any> => {
  let timeoutId: undefined | ReturnType<typeof setTimeout>
  return await Promise.race([
    new Promise<ResolveWith>((resolve) => {
      timeoutId = setTimeout(() => {
        logger.error(
          new Error(
            `Time limit of ${waitInMs}ms reached. ${timeLimitReachedErrorMessage}`
          )
        )
        resolve(fallbackReturnValue)
      }, waitInMs)
    }),
    promise.catch((e) => {
      logger.error(
        new Error(`${waitInMs} Passed in promise rejected with ${e}`)
      )
      return Promise.resolve(fallbackReturnValue)
    }),
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}
