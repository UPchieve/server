import { maskContact, maskEmail, maskPhone } from '../../utils/mask-contact'

describe('maskContact', () => {
  test('returns contact as-is if not a valid email or phone', () => {
    const contact = 'random'
    const result = maskContact(contact)
    expect(result).toBe(contact)
  })

  test('returns contact as-is if not a valid email', () => {
    const contact = 'invalid@email@email.com'
    const result = maskContact(contact)
    expect(result).toBe(contact)
  })

  test('returns contact as-if if not a valid phone number', () => {
    const contact = '1112223334444'
    const result = maskContact(contact)
    expect(result).toBe(contact)
  })

  test('masks valid email', () => {
    const contact = 'email@email.com'
    const result = maskContact(contact)
    expect(result).toBe('e***l@email.com')
  })

  test('masks valid phone number', () => {
    const contact = '+18887779999'
    const result = maskContact(contact)
    expect(result).toBe('********9999')
  })
})

describe('maskEmail', () => {
  test('masks the middle of an email username', () => {
    const contact = 'l-randomremoved-l@meow.com'
    const result = maskEmail(contact)
    expect(result).toBe('l***************l@meow.com')
  })
})

describe('maskPhone', () => {
  test('masks all but the last four characters', () => {
    const contact = 'asdfasasdfkljdsklf4444'
    const result = maskPhone(contact)
    expect(result).toBe('******************4444')
  })
})
