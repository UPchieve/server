import { getClient, getRoClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import { UserRole } from '../User'
import * as pgQueries from './pg.queries'

export async function addReferral(
  userId: Ulid,
  referrerId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.addReferral.run(
      {
        userId,
        referredBy: referrerId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getReferredUsersWithFilter(
  userId: Ulid,
  filters?: {
    withPhoneOrEmailVerified?: boolean
    withRoles?: UserRole[]
  }
) {
  try {
    const result = await pgQueries.getReferredUsersWithFilter.run(
      {
        userId,
        phoneOrEmailVerified: filters?.withPhoneOrEmailVerified ?? null,
        hasRoles: filters?.withRoles ?? null,
      },
      getRoClient()
    )
    result.map((row) => makeRequired(row))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
