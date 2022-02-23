import { client } from './db-utils'

jest.setTimeout(10 * 1000)

beforeAll(async () => {
  await client.connect()
})

afterAll(async () => {
  await client.end()
})
