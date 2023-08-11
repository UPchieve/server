import { mocked } from 'ts-jest/utils'
import * as PgClient from '../../db'

jest.unmock('pg')
jest.mock('../../db')
const mockedClient = mocked(PgClient, true)
// @ts-ignore
mockedClient.getClient.mockReturnValue(global.__TEST_DB_CLIENT__)
