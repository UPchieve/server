import startsWithVowel from '../../utils/starts-with-vowel'

test('Should return true for vowels', () => {
  expect(startsWithVowel('Alligator')).toBeTruthy()
  expect(startsWithVowel('Elephant')).toBeTruthy()
  expect(startsWithVowel('Igloo')).toBeTruthy()
  expect(startsWithVowel('Octopus')).toBeTruthy()
  expect(startsWithVowel('Universe')).toBeTruthy()
  expect(startsWithVowel('alligator')).toBeTruthy()
  expect(startsWithVowel('elephant')).toBeTruthy()
  expect(startsWithVowel('igloo')).toBeTruthy()
  expect(startsWithVowel('octopus')).toBeTruthy()
  expect(startsWithVowel('universe')).toBeTruthy()
})

test('Should return false for consonants', () => {
  expect(startsWithVowel('test')).toBeFalsy()
})

test('Should return false for non alphabet characters', () => {
  expect(startsWithVowel('1234')).toBeFalsy()
  expect(startsWithVowel('!')).toBeFalsy()
  expect(startsWithVowel('@')).toBeFalsy()
  expect(startsWithVowel('{')).toBeFalsy()
})
