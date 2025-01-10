import { mocked } from 'jest-mock'
import * as PgClient from '../../db'

jest.unmock('pg')
jest.mock('../../db')
const mockedClient = mocked(PgClient)
// @ts-ignore
const testDbClient = global.__TEST_DB_CLIENT__
mockedClient.getClient.mockReturnValue(testDbClient)
console.log('******test db client', testDbClient)
// @ts-ignore
mockedClient.getRoClient.mockReturnValue(global.__TEST_DB_CLIENT__)
