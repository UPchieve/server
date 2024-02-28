export const timeLimit = async ({
  promise,
  waitInMs,
  rejectWith,
}: {
  promise: Promise<any>
  waitInMs: number
  rejectWith: any
}) =>
  await Promise.race([
    new Promise((_, rej) =>
      setTimeout(() => {
        rej(rejectWith)
      }, waitInMs)
    ),
    promise,
  ])
