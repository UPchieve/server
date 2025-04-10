import {
  getAnalyticsClient,
  getClient,
  runInTransaction,
  TransactionClient,
} from '../../db'
import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoTransactionError,
  RepoUpdateError,
  RepoUpsertError,
} from '../Errors'
import {
  generateReferralCode,
  getDbUlid,
  makeRequired,
  makeSomeRequired,
  makeSomeOptional,
  Ulid,
  Uuid,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import { USER_BAN_TYPES, USER_ROLES, USER_ROLES_TYPE } from '../../constants'
import { getUserRolesById } from '../User'

export async function addSessionSummary(sessionId: Ulid, summary: string, userType: USER_ROLES_TYPE, tc?: TransactionClient) {
  try {
    const result = await pgQueries.addSessionSummary.run( { sessionId, summary, userType }, tc ?? getClient() )
  } catch (err) {

  }
}