import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { UserProductFlags } from './types'

export async function createUPFByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<UserProductFlags> {
  try {
    const result = await pgQueries.createUpfByUserId.run(
      {
        userId,
      },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getUPFByUserId(
  userId: Ulid
): Promise<UserProductFlags | undefined> {
  try {
    const result = await pgQueries.getUpfByUserId.run(
      {
        userId,
      },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PublicUserProductFlags = Pick<
  UserProductFlags,
  'userId' | 'gatesQualified' | 'fallIncentiveProgram'
>

export async function getPublicUPFByUserId(
  userId: Ulid
): Promise<PublicUserProductFlags | undefined> {
  try {
    const result = await pgQueries.getPublicUpfByUserId.run(
      {
        userId,
      },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateSentInactiveThirtyDayEmail(
  userId: Ulid,
  sentInactiveThirtyDayEmail: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateSentInactiveThirtyDayEmail.run(
      { userId, sentInactiveThirtyDayEmail },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateSentInactiveSixtyDayEmail(
  userId: Ulid,
  sentInactiveSixtyDayEmail: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateSentInactiveSixtyDayEmail.run(
      { userId, sentInactiveSixtyDayEmail },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateSentInactiveNinetyDayEmail(
  userId: Ulid,
  sentInactiveNinetyDayEmail: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateSentInactiveNinetyDayEmail.run(
      { userId, sentInactiveNinetyDayEmail },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateFallIncentiveProgram(
  userId: Ulid,
  status: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateFallIncentiveProgram.run(
      { userId, status },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}
