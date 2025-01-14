import { SUBJECT_TYPES } from '../../constants'
import * as CleverAPIService from '../../services/CleverAPIService'

describe('getTopicFromCleverSubject', () => {
  test('returns READING_WRITING for english/language arts', () => {
    const result = CleverAPIService.getTopicFromCleverSubject(
      'english/language arts'
    )
    expect(result).toBe(SUBJECT_TYPES.READING_WRITING)
  })

  test('returns MATH for math', () => {
    const result = CleverAPIService.getTopicFromCleverSubject('math')
    expect(result).toBe(SUBJECT_TYPES.MATH)
  })

  test('returns SCIENCE for science', () => {
    const result = CleverAPIService.getTopicFromCleverSubject('science')
    expect(result).toBe(SUBJECT_TYPES.SCIENCE)
  })

  test('returns SOCIAL_STUDIES for social studies', () => {
    const result = CleverAPIService.getTopicFromCleverSubject('social studies')
    expect(result).toBe(SUBJECT_TYPES.SOCIAL_STUDIES)
  })

  test('returns undefined for anything else', () => {
    let result = CleverAPIService.getTopicFromCleverSubject('other')
    expect(result).toBe(undefined)
    result = CleverAPIService.getTopicFromCleverSubject('PE and health')
    expect(result).toBe(undefined)
    result = CleverAPIService.getTopicFromCleverSubject('arts and music')
    expect(result).toBe(undefined)
    result = CleverAPIService.getTopicFromCleverSubject('dancing in the rain')
    expect(result).toBe(undefined)
  })
})
