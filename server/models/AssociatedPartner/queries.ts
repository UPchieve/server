import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeSomeOptional } from '../pgUtils'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { AssociatedPartner, AssociatedPartnersAndSchools } from './types'
import * as SponsorOrgRepo from '../SponsorOrg/queries'
import { PoolClient } from 'pg'

export async function getAssociatedPartners(): Promise<AssociatedPartner[]> {
  try {
    const result = await pgQueries.getAssociatedPartners.run(
      undefined,
      getClient()
    )
    const orgs: AssociatedPartner[] = result.map(org =>
      makeSomeOptional(org, [
        'studentPartnerOrg',
        'studentPartnerOrgId',
        'studentOrgDisplay',
        'studentSponsorOrgId',
        'studentSponsorOrg',
      ])
    )
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssociatedPartnerByKey(
  key: string
): Promise<AssociatedPartner> {
  try {
    const result = await pgQueries.getAssociatedPartnerByKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no associated partner found with key ${key}`)
    return makeSomeOptional(result[0], [
      'studentPartnerOrg',
      'studentPartnerOrgId',
      'studentOrgDisplay',
      'studentSponsorOrgId',
      'studentSponsorOrg',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssociatedPartnerByPartnerOrg(
  key: string
): Promise<AssociatedPartner> {
  try {
    const result = await pgQueries.getAssociatedPartnerByPartnerOrgKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no associated partner found with key ${key}`)
    return makeSomeOptional(result[0], [
      'studentPartnerOrg',
      'studentPartnerOrgId',
      'studentOrgDisplay',
      'studentSponsorOrgId',
      'studentSponsorOrg',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssociatedPartnerBySponsorOrg(
  key: string
): Promise<AssociatedPartner> {
  try {
    const result = await pgQueries.getAssociatedPartnerBySponsorOrgKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no associated partner found with key ${key}`)
    return makeSomeOptional(result[0], [
      'studentPartnerOrg',
      'studentPartnerOrgId',
      'studentOrgDisplay',
      'studentSponsorOrgId',
      'studentSponsorOrg',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssociatedPartnerByVolunteerPartnerKey(
  key: string
): Promise<AssociatedPartner | undefined> {
  try {
    const result = await pgQueries.getAssociatedPartnerByVolunteerPartnerKey.run(
      { key },
      getClient()
    )
    if (result.length)
      return makeSomeOptional(result[0], [
        'studentPartnerOrg',
        'studentPartnerOrgId',
        'studentOrgDisplay',
        'studentSponsorOrgId',
        'studentSponsorOrg',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssociatedPartnersAndSchools(
  partnerOrg: string
): Promise<AssociatedPartnersAndSchools> {
  const associatedPartner = await getAssociatedPartnerByVolunteerPartnerKey(
    partnerOrg
  )
  const associatedStudentPartnerOrgs: string[] = []
  const associatedPartnerSchools: string[] = []

  if (associatedPartner?.studentPartnerOrgId)
    associatedStudentPartnerOrgs.push(associatedPartner.studentPartnerOrgId)
  else if (associatedPartner?.studentSponsorOrg) {
    const sponsorOrg = await SponsorOrgRepo.getSponsorOrgsByKey(
      associatedPartner.studentSponsorOrg
    )

    if (Array.isArray(sponsorOrg.schoolIds) && sponsorOrg.schoolIds.length)
      associatedPartnerSchools.push(...sponsorOrg.schoolIds)
    if (
      Array.isArray(sponsorOrg.studentPartnerOrgIds) &&
      sponsorOrg.studentPartnerOrgIds.length
    )
      associatedStudentPartnerOrgs.push(...sponsorOrg.studentPartnerOrgIds)
  }

  return { associatedStudentPartnerOrgs, associatedPartnerSchools }
}

export async function migrateStudentPartnerOrgAssociatedPartners(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateStudentPartnerOrgAssociatedPartners.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to migrate student partner orgs for associated partners: ${err}`
    )
  }
}

export async function migrateSponsorOrgAssociatedPartners(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateSponsorOrgAssociatedPartners.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to migrate sponsor orgs for associated partners: ${err}`
    )
  }
}
