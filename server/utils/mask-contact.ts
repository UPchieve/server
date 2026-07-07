import isValidEmail from './is-valid-email'
import isValidInternationalPhoneNumber from './is-valid-international-phone-number'

/**
 * Masks an email address, keeping the first and last character of the username part.
 * Example: "jane.doe@example.com" -> "j******e@example.com"
 */
export function maskEmail(email: string): string {
  return email.replace(
    /^(.)(.+)(.)(@.+)$/,
    (_match, first, middle, last, domain) =>
      first + '*'.repeat(middle.length) + last + domain
  )
}

/**
 * Masks a phone number, keeping the last 4 digits.
 * Example: "+14155551234" -> "********1234"
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone
  return '*'.repeat(phone.length - 4) + phone.slice(-4)
}

/**
 * Masks a contact (email or phone) based on its format.
 */
export function maskContact(contact: string): string {
  if (isValidEmail(contact)) return maskEmail(contact)
  if (isValidInternationalPhoneNumber(contact)) return maskPhone(contact)
  return contact
}
