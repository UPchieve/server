import type { Config } from 'jest'
import { defaults as tsjPreset } from 'ts-jest/presets'

const transformKey = Object.keys(tsjPreset.transform ?? {})[0]

/**
 * Integration tests (server/tests/integration). Need real credentials via
 * Doppler: `pnpm run test:integration`. No mocks-setup, so the real
 * env-driven config.ts is used.
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
