import { convertThresholdToPercentage } from '../../utils/moderation-utils'

describe('moderation-utils', () => {
  describe('convertThresholdToPercentage', () => {
    it('Converts decimal thresholds to percentages', () => {
      expect(convertThresholdToPercentage(0.75)).toBe(75)
    })

    it('Leaves percentage values unchanged', () => {
      expect(convertThresholdToPercentage(100)).toBe(100)
    })
  })
})
