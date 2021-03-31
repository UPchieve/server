const isValidInternationalPhoneNumber = phoneNumber =>
  phoneNumber.match(/^\+\d{10,14}$/)

module.exports = isValidInternationalPhoneNumber
export default isValidInternationalPhoneNumber
