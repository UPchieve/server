import parseUnleashFeatureFlags from '@/utils/parse-unleash-feature-flags'

const defaultFlags = {
  'test-flag-one': false,
  'test-flag-two': true,
}

describe('parseUnleashFeatureFlags', () => {
  test('Should return default flags when unleash data is empty', () => {
    const unleashData = {}
    expect(parseUnleashFeatureFlags(unleashData, defaultFlags)).toEqual(
      defaultFlags
    )
  })

  test('Should return default flags when unleash data doesnt match the unleash API', () => {
    const unleashData = {
      features: [],
    }
    expect(parseUnleashFeatureFlags(unleashData, defaultFlags)).toEqual(
      defaultFlags
    )
  })

  test('Should return default flags when there are no feature flags from unleash', () => {
    const unleashData = {
      features: [],
    }
    expect(parseUnleashFeatureFlags(unleashData, defaultFlags)).toEqual(
      defaultFlags
    )
  })

  test('Should return updated feature flags when receiving unleash data response', () => {
    const unleashData = {
      features: [
        {
          name: 'test-flag-one',
          enabled: true,
        },
        {
          name: 'test-flag-two',
          enabled: false,
        },
      ],
    }
    const expectedFlags = {
      'test-flag-one': true,
      'test-flag-two': false,
    }
    expect(parseUnleashFeatureFlags(unleashData, defaultFlags)).toEqual(
      expectedFlags
    )
  })
})
