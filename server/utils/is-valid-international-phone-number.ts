const isValidInternationalPhoneNumber = (phoneNumber: string) =>
  phoneNumber.match(/^\+\d{10,14}$/)

export default isValidInternationalPhoneNumber
