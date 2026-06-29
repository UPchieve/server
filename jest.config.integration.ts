import type { Config } from 'jest'
import { defaults as tsjPreset } from 'ts-jest/presets'

const transformKey = Object.keys(tsjPreset.transform ?? {})[0]

/**
 * Jest config for the integration test suite.
 * @see package.json -> "test:integration"
 * @see README.md -> Testing -> Integration tests
 */
const config: Config = {
  roots: ['<rootDir>/server/tests/integration'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    ...tsjPreset.transform,
    [transformKey]: [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js'],
}

export default config
