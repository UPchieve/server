const Question = require('../../models/Question')

test('Called getSubcategories using good data', () => {
  const subcategories = Question.getSubcategories('algebra')
  expect(subcategories[0]).toBe('linear equations')
})

test('Called getSubcategories using nonexistant category', () => {
  expect(() => {
    Question.getSubcategories('math')
  }).toThrowError(ReferenceError)
})

test.todo('Called getSubcategories using wrong capitalization data')

test('Called getSubcategories using wrong type', () => {
  expect(() => {
    Question.getSubcategories(1)
  }).toThrowError(TypeError)
})
