import Case from 'case'

export function toTitleCase(s?: string) {
  if (!s) {
    return ''
  }

  return Case.title(s)
}
