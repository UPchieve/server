export const convertObjectIdListToStringList = (objectIdList): string[] => {
  const arr = []
  for (let i = 0; i < objectIdList.length; i++) {
    arr.push(objectIdList[i].toString())
  }

  return arr
}

export function mockMongooseFindQuery(fn: Function) {
  return () => ({
    lean: () => ({
      exec: async () => {
        await fn()
      }
    })
  })
}
