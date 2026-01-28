export default function generateAlphanumericOfLength(length: number) {
  let result = ''
  // excludes 0/O and 1/I to reduce confusion
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // pragma: allowlist secret
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
