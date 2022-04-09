// Fix to parse out $numberInt subobject from postgres jsonb values
// TODO: remove this once we fix postgres data
export function fixNumberInt<T>(obj: T): any {
  if (!obj) return
  const temp: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      temp[key] = fixNumberInt(value)
    } else if (key === '$numberInt') {
      return Number(value)
    } else temp[key] = value
  }
  return temp
}
