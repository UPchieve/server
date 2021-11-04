import { Types } from 'mongoose'

export const convertObjectIdListToStringList = (
  objectIdList: Types.ObjectId[]
): string[] => {
  const arr = []
  for (let i = 0; i < objectIdList.length; i++) {
    arr.push(objectIdList[i].toString())
  }

  return arr
}

export function mockMongooseFindQuery<T>(fn: () => Promise<T>) {
  return () => ({
    lean: () => ({
      exec: async () => {
        await fn()
      },
    }),
  })
}
