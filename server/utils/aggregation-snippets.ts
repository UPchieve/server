export const EMAIL_RECIPIENT = {
  isBanned: false,
  isDeactivated: false,
  isFakeUser: false,
  isTestUser: false
}

const SEPARATOR = '.'

export const emailRecipientPrefixed = function(prefix: string) {
  const emailRecipientPrefixed = {}
  for (const [key, value] of Object.entries(EMAIL_RECIPIENT)) {
    emailRecipientPrefixed[prefix + SEPARATOR + key] = value
  }
  return emailRecipientPrefixed
}
