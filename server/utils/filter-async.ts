export async function filterAsync<T>(
  collection: T[],
  filterFunction: (element: T) => Promise<boolean>
): Promise<{
  filtered: T[]
  rejected: [T, unknown][]
}> {
  const asyncResults = await Promise.allSettled(
    collection.map((element) => filterFunction(element))
  )
  const filtered: T[] = []
  const rejected: [T, unknown][] = []
  asyncResults.forEach((result, index) => {
    const element = collection[index]
    if (result.status === 'fulfilled') {
      if (result.value) {
        filtered.push(element)
      }
    } else {
      rejected.push([element, result.reason])
    }
  })
  return { filtered, rejected }
}
