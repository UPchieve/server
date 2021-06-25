import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import * as IpAddressService from '../../services/IpAddressService'
import { routes as EligibilityRouter } from '../../router/eligibility'
import { NotAllowedError } from '../../models/Errors'

jest.mock('../../services/IpAddressService')
const mockedIpAddressService = mocked(IpAddressService, true)

const US_IP_ADDRESS = '161.185.160.93'
const API_ROUTE = '/api-public/eligibility'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

EligibilityRouter(app)

const agent = request.agent(app)

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

const IP_CHECK_PATH = '/ip-check'
describe(IP_CHECK_PATH, () => {
  test('Should send status code 200 with valid request', async () => {
    mockedIpAddressService.checkIpAddress.mockImplementationOnce(
      async () => undefined
    )
    const response = await sendGet(IP_CHECK_PATH, {})
    expect(response.status).toBe(200)
  })

  test('Should send status code 403 when the IP address not a U.S. IP address', async () => {
    mockedIpAddressService.checkIpAddress.mockImplementationOnce(async () => {
      throw new NotAllowedError()
    })
    const response = await sendGet(IP_CHECK_PATH, {})
    expect(response.status).toBe(403)
  })
})
