import { mocked } from 'jest-mock'
import * as PgClient from '../../db'

jest.unmock('pg')
jest.mock('../../db')
const mockedClient = mocked(PgClient)
// @ts-ignore
mockedClient.getClient.mockReturnValue(global.__TEST_DB_CLIENT__)
