import { UserActionAgent } from '../models/UserAction'
import UAParser from 'ua-parser-js'
import getDeviceFromUserAgent from './getDeviceFromUserAgent'

export function getUserAgentInfo(userAgent: string): UserActionAgent {
  const userAgentParserResult = new UAParser(userAgent).getResult()
  const { device, browser, os } = userAgentParserResult
  return {
    device: device.vendor || getDeviceFromUserAgent(userAgent),
    browser: browser.name || '',
    browserVersion: browser.version || '',
    operatingSystem: os.name || '',
    operatingSystemVersion: os.version || '',
  }
}
