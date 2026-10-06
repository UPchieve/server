import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { ImpactStudyCampaign, UserProductFlags } from './types'
import type { Json, Uuid } from '../../types/shared'

type UserProductFlagsRow = {
  userId: Uuid
  sentReadyToCoachEmail: boolean
  sentHourSummaryIntroEmail: boolean
  sentInactiveThirtyDayEmail: boolean
  sentInactiveSixtyDayEmail: boolean
  sentInactiveNinetyDayEmail: boolean
  gatesQualified: boolean
  fallIncentiveEnrollmentAt: Date | null
  impactStudyEnrollmentAt: Date | null
  impactStudyCampaigns: Json | null
  createdAt: Date
  updatedAt: Date
}

function toImpactStudyCampaign(
  value: ImpactStudyCampaignJson
): ImpactStudyCampaign {
  const { id, surveyId, viewCount, maxViewCount, rewardAmount } = value
  return {
    id,
    surveyId,
    viewCount,
    maxViewCount,
    rewardAmount: rewardAmount ?? undefined,
    createdAt: new Date(value.createdAt),
    submittedAt:
      value.submittedAt != null ? new Date(value.submittedAt) : undefined,
    launchedAt:
      value.launchedAt != null ? new Date(value.launchedAt) : undefined,
  }
}

function toImpactStudyCampaignsMap(
  value: Record<string, ImpactStudyCampaignJson>
) {
  return Object.fromEntries(
    Object.entries(value).map(([key, campaign]) => [
      key,
      toImpactStudyCampaign(campaign),
    ])
  )
}

function toUserProductFlags(row: UserProductFlagsRow): UserProductFlags {
  const flags = makeSomeOptional(row, [
    'fallIncentiveEnrollmentAt',
    'impactStudyEnrollmentAt',
    'impactStudyCampaigns',
  ])
  return {
    userId: flags.userId,
    sentReadyToCoachEmail: flags.sentReadyToCoachEmail,
    sentHourSummaryIntroEmail: flags.sentHourSummaryIntroEmail,
    sentInactiveThirtyDayEmail: flags.sentInactiveThirtyDayEmail,
    sentInactiveSixtyDayEmail: flags.sentInactiveSixtyDayEmail,
    sentInactiveNinetyDayEmail: flags.sentInactiveNinetyDayEmail,
    gatesQualified: flags.gatesQualified,
    fallIncentiveEnrollmentAt: flags.fallIncentiveEnrollmentAt,
    impactStudyEnrollmentAt: flags.impactStudyEnrollmentAt,
    createdAt: flags.createdAt,
    updatedAt: flags.updatedAt,
    impactStudyCampaigns:
      row.impactStudyCampaigns != null
        ? toImpactStudyCampaignsMap(
            row.impactStudyCampaigns as Record<string, ImpactStudyCampaignJson>
          )
        : undefined,
  }
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
      return toUserProductFlags(result[0])
    }
    throw new RepoCreateError('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getUPFByUserId(
  userId: Ulid,
  tc?: TransactionClient
): Promise<UserProductFlags | undefined> {
  try {
    const result = await pgQueries.getUpfByUserId.run(
      {
        userId,
      },
      tc ?? getClient()
    )

    if (result.length) {
      return toUserProductFlags(result[0])
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

export async function enrollStudentToImpactStudy(
  userId: Ulid,
  tc?: TransactionClient
): Promise<Date> {
  try {
    const result = await pgQueries.enrollStudentToImpactStudy.run(
      { userId },
      tc ?? getClient()
    )
    if (result.length) return makeRequired(result[0]).impactStudyEnrollmentAt
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

type ImpactStudyCampaignJson = Omit<
  ImpactStudyCampaign,
  'createdAt' | 'submittedAt' | 'launchedAt'
> & {
  createdAt: string
  launchedAt?: string
  submittedAt?: string
}

export async function upsertImpactStudyCampaign(
  userId: Ulid,
  campaign: ImpactStudyCampaign,
  tc?: TransactionClient
) {
  try {
    const campaignData: ImpactStudyCampaignJson = {
      ...campaign,
      createdAt: campaign.createdAt.toISOString(),
      submittedAt: campaign.submittedAt
        ? campaign.submittedAt.toISOString()
        : undefined,
      launchedAt: campaign.launchedAt
        ? campaign.launchedAt.toISOString()
        : undefined,
    }
    const result = await pgQueries.upsertImpactStudyCampaign.run(
      {
        userId,
        campaignId: campaign.id,
        campaignData,
      },
      tc ?? getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}
