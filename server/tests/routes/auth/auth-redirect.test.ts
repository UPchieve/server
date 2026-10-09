import { AuthRedirect } from '../../../router/auth/auth-redirect'

const appOrigin = new URL(AuthRedirect.successRedirect()).origin

const hostilePaths: (string | undefined)[] = [
  undefined,
  '',
  '@evil.example',
  '.evil.example',
  'https://evil.example',
  '//evil.example',
  '/\\evil.example',
  'evil',
  ['/', '@evil.example'] as unknown as string,
]
const userData = { firstName: 'Ada', email: 'ada@example.com' }

type Case = {
  name: string
  build: (path?: string) => string
  fallbackPath: string
  validPath: string
  expectedParams: Record<string, string>
}
const cases: Case[] = [
  {
    name: 'successRedirect',
    build: (path) => AuthRedirect.successRedirect(path),
    fallbackPath: '/',
    validPath: '/join-team/abc?x=1',
    expectedParams: {},
  },
  {
    name: 'failureRedirect sign-up',
    build: (path) =>
      AuthRedirect.failureRedirect(
        false,
        'google',
        path,
        { ...userData },
        'boom'
      ),
    fallbackPath: '/',
    validPath: '/sign-up/student/account',
    expectedParams: { error: 'boom', ...userData },
  },
  {
    name: 'loginFailureRedirect',
    build: (path) => AuthRedirect.loginFailureRedirect('google', path),
    fallbackPath: '/login',
    validPath: '/profile',
    expectedParams: { '400': 'true', provider: 'google' },
  },
]

describe.each(cases)(
  '$name',
  ({ build, fallbackPath, validPath, expectedParams }) => {
    test.each(hostilePaths)(
      'falls back to the default path for %j and stays on the app origin',
      (path) => {
        const url = new URL(build(path))
        expect(url.origin).toBe(appOrigin)
        expect(url.pathname).toBe(fallbackPath)
        expect(Object.fromEntries(url.searchParams)).toEqual(expectedParams)
      }
    )

    test('keeps a valid path', () => {
      const query = new URLSearchParams(expectedParams).toString()
      expect(build(validPath)).toBe(
        `${appOrigin}${validPath}${query ? '?' + query : ''}`
      )
    })
  }
)
