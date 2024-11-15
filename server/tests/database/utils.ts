export function normalizeUlid(val: string) {
  return val.toLowerCase().replace(/-/g, '')
}
