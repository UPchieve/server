import { UserActionAgentPublic } from '../contracts/user-agent'
import { UserActionAgent } from '../models/UserAction'

export function toUserAgentPublic(
  userAgent: Partial<UserActionAgent>
): UserActionAgentPublic {
  return {
    device: userAgent.device ?? '',
    browser: userAgent.browser,
    browserVersion: userAgent.browserVersion,
    operatingSystem: userAgent.operatingSystem,
    operatingSystemVersion: userAgent.operatingSystemVersion,
  }
}
