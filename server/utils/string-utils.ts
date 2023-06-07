export function toTitleCase(s?: string): string | undefined {
  return s?.replace(/\w\S*/g, sub => {
    return sub.charAt(0).toUpperCase() + sub.substr(1).toLowerCase()
  })
}
