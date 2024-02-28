import logger from '../logger'

export const timeLimit = async ({
  promise,
  waitInMs,
  resolveWith,
  timeReachedErrorMessage,
}: {
  promise: Promise<any>
  waitInMs: number
  resolveWith: any
  timeReachedErrorMessage: string
}) =>
  await Promise.race([
    new Promise(resolve =>
      setTimeout(() => {
        logger.error(new Error(timeReachedErrorMessage))
        resolve(resolveWith)
      }, waitInMs)
    ),
    promise,
  ])
