import { moderateMessage } from '../../controllers/ModerationCtrl'

test('Check incorrect email succeeds', done => {
  const email = 'j.@serve1.proseware.com'
  expect(moderateMessage(email)).toBeTruthy()
  done()
})

test('Check incorrect phone number succeeds', done => {
  const phoneNumber =
    'a message including 0.001193067% which is not a phone number'
  expect(moderateMessage(phoneNumber)).toBeTruthy()
  done()
})

test('Check correct email fails', done => {
  const email = 'student1@upchieve.com'
  expect(moderateMessage(email)).toBeFalsy()
  done()
})

test('Check vulgar word fails', done => {
  const word = '5hit'
  expect(moderateMessage(word)).toBeFalsy()
  done()
})

test('Check non-vulgar word succeeds', done => {
  const word = 'hello'
  expect(moderateMessage(word)).toBeTruthy()
  done()
})

test('Check correct phone number fails', done => {
  const phoneNumber =
    'a message including (555)555-5555 which is a phone number'
  expect(moderateMessage(phoneNumber)).toBeFalsy()
  done()
})
