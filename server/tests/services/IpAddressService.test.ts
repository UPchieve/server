import { mocked } from 'jest-mock'
import axios, { AxiosResponse } from 'axios'
import * as IpAddressService from '../../services/IpAddressService'
import { NotAllowedError, InputError } from '../../models/Errors'
jest.mock('axios')
const mockedAxios = mocked(axios)

beforeEach(async () => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

describe('checkIpAddress', () => {
  function mockIpWhoIsReturnValue(countryCode: string): AxiosResponse {
    return {
      data: {
        country_code: countryCode,
      },
      status: 200, // Add other necessary properties to match AxiosResponse
      statusText: 'OK',
      headers: {},
      config: {},
    }
  }

  test('Should throw InputError on non-string IP address data type', async () => {
    const ipAddress = 123456789
    await expect(
      IpAddressService.checkIpAddress(ipAddress)
    ).rejects.toBeInstanceOf(InputError)
  })

  test('Should throw not a valid IP address when IP address formatted incorrectly', async () => {
    const invalidIpAddress = '999.999.999.999'
    await expect(
      IpAddressService.checkIpAddress(invalidIpAddress)
    ).rejects.toThrowError('Not a valid IP address')
  })

  test('Should throw NotAllowedError if IP address is outside of the U.S.', async () => {
    const londonIpAddress = '78.110.170.119'

    mockedAxios.get.mockResolvedValueOnce(mockIpWhoIsReturnValue('GB'))
    await expect(
      IpAddressService.checkIpAddress(londonIpAddress)
    ).rejects.toBeInstanceOf(NotAllowedError)
  })

  test('Should not throw error for valid IPv4 address', async () => {
    const newYorkIpAddress = '161.185.160.93'

    mockedAxios.get.mockResolvedValueOnce(mockIpWhoIsReturnValue('US'))
    expect(() =>
      IpAddressService.checkIpAddress(newYorkIpAddress)
    ).not.toThrow()
  })

  test('Should not throw error for valid IPv6 address', async () => {
    const newYorkIpAddress = '2604:a880:400:d1::75a:a001'

    mockedAxios.get.mockResolvedValueOnce(mockIpWhoIsReturnValue('US'))
    expect(() =>
      IpAddressService.checkIpAddress(newYorkIpAddress)
    ).not.toThrow()
  })
})
