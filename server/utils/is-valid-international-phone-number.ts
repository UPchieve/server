export function isValidInternationalPhoneNumber(phoneNumber: string): boolean {
  const matchOutcome = phoneNumber.match(/^\+\d{10,14}$/)
  if (matchOutcome === null) {
    return false
  } else {
    return true
  }
}

export default isValidInternationalPhoneNumber
