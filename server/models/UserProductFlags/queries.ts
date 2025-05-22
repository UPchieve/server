import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  ImpactStudyCampaign,
  ImpactStudyCampaignsMap,
  PublicUserProductFlags,
  UserProductFlags,
} from './types'

export function toImpactStudyCampaignsMap(
  campaigns: unknown
): ImpactStudyCampaignsMap | undefined {
  if (!campaigns) return undefined

  return typeof campaigns === 'object' &&
    campaigns !== null &&
    !Array.isArray(campaigns)
    ? (campaigns as ImpactStudyCampaignsMap)
    : undefined
}

export function toUserProductFlags(
  upf: Omit<UserProductFlags, 'impactStudyCampaigns'> & {
    impactStudyCampaigns: unknown
  }
): UserProductFlags {
  return {
    ...upf,
    impactStudyCampaigns: toImpactStudyCampaignsMap(upf.impactStudyCampaigns),
  } as UserProductFlags
}

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
    if (result.length) {
      const upf = makeSomeOptional(result[0], [
        'fallIncentiveEnrollmentAt',
        'impactStudyEnrollmentAt',
        'tellThemCollegePrepModalSeenAt',
        'impactStudyCampaigns',
      ])
      return toUserProductFlags(upf)
    }
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

    if (result.length) {
      const upf = makeSomeOptional(result[0], [
        'fallIncentiveEnrollmentAt',
        'impactStudyEnrollmentAt',
        'tellThemCollegePrepModalSeenAt',
        'impactStudyCampaigns',
      ])
      return toUserProductFlags(upf)
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

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

    if (result.length) {
      const upf = makeSomeOptional(result[0], [
        'fallIncentiveEnrollmentAt',
        'impactStudyEnrollmentAt',
        'tellThemCollegePrepModalSeenAt',
        'impactStudyCampaigns',
      ])
      return {
        ...upf,
        impactStudyCampaigns: toImpactStudyCampaignsMap(
          upf.impactStudyCampaigns
        ),
      }
    }
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

export async function enrollStudentToFallIncentiveProgram(
  userId: Ulid
): Promise<Date> {
  try {
    const result = await pgQueries.enrollStudentToFallIncentiveProgram.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).fallIncentiveEnrollmentAt
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function enrollStudentToImpactStudy(userId: Ulid): Promise<Date> {
  try {
    const result = await pgQueries.enrollStudentToImpactStudy.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).impactStudyEnrollmentAt
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function updateTellThemCollegePrepModalSeenAt(userId: Ulid) {
  try {
    const result = await pgQueries.tellThemCollegePrepModalSeenAt.run(
      { userId },
      getClient()
    )
    if (result.length)
      return makeRequired(result[0]).tellThemCollegePrepModalSeenAt
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function upsertImpactStudyCampaign(
  userId: Ulid,
  campaign: ImpactStudyCampaign
) {
  try {
    const result = await pgQueries.upsertImpactStudyCampaign.run(
      {
        userId,
        campaignId: campaign.id,
        campaignData: {
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
        },
      },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}
