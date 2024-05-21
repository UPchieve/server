import { moderateMessage } from '../../services/ModerationService'

test('Check incorrect email succeeds', async () => {
  const email = 'j.@serve1.proseware.com'
  expect(
    await moderateMessage({ message: email, senderId: '123' })
  ).toBeTruthy()
})

test('Check incorrect phone number succeeds', async () => {
  const phoneNumber =
    'a message including 0.001193067% which is not a phone number'
  expect(
    await moderateMessage({ message: phoneNumber, senderId: '123' })
  ).toBeTruthy()
})

test('Check correct email fails', async () => {
  const email = 'student1@upchieve.com'
  expect(await moderateMessage({ message: email, senderId: '123' })).toBeFalsy()
})

test('Check vulgar word fails', async () => {
  const word = '5hit'
  expect(await moderateMessage({ message: word, senderId: '123' })).toBeFalsy()
})

test('Check non-vulgar word succeeds', async () => {
  const word = 'hello'
  expect(await moderateMessage({ message: word, senderId: '123' })).toBeTruthy()
})

test('Check correct phone number fails', async () => {
  const phoneNumber =
    'a message including (555)555-5555 which is a phone number'
  expect(
    await moderateMessage({ message: phoneNumber, senderId: '123' })
  ).toBeFalsy()
})
