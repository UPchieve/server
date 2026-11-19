import { isGenerallyAvailableSession } from '../../utils/session-utils'
import { getUuid } from '../../models/pgUtils'

describe('isGenerallyAvailableSession', () => {
  test('a waiting session is generally available', () => {
    expect(isGenerallyAvailableSession({})).toBe(true)
  })

  test.each([
    ['has a volunteer', { volunteerId: getUuid() }],
    ['has ended', { endedAt: new Date() }],
    ['is requested for one coach', { requestedVolunteerId: getUuid() }],
  ])('a session that %s is not generally available', (_, session) => {
    expect(isGenerallyAvailableSession(session)).toBe(false)
  })

  test('a requested session that was opened to all is generally available', () => {
    expect(
      isGenerallyAvailableSession({
        requestedVolunteerId: getUuid(),
        openedToAllAt: new Date(),
      })
    ).toBe(true)
  })
})
