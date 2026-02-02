import { convertThresholdToPercentage } from '../../utils/moderation-utils'

describe('moderation-utils', () => {
  describe('convertThresholdToPercentage', () => {
    it('Converts decimal thresholds (0-1) to percentages (0-100)', () => {
      expect(convertThresholdToPercentage(0.75)).toBe(75)
      expect(convertThresholdToPercentage(0.5)).toBe(50)
      expect(convertThresholdToPercentage(0.9)).toBe(90)
      expect(convertThresholdToPercentage(1)).toBe(100)
    })

    it('Returns percentage values unchanged', () => {
      expect(convertThresholdToPercentage(75)).toBe(75)
      expect(convertThresholdToPercentage(50)).toBe(50)
      expect(convertThresholdToPercentage(100)).toBe(100)
    })
  })
})
