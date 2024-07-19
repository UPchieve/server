import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeSomeOptional } from '../pgUtils'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { SponsorOrg } from './types'
import { PoolClient } from 'pg'

export async function getSponsorOrgs() {
  try {
    const result = await pgQueries.getSponsorOrgs.run(undefined, getClient())
    const orgs: SponsorOrg[] = result.map(org =>
      makeSomeOptional(org, [
        'schoolIds',
        'studentPartnerOrgKeys',
        'studentPartnerOrgIds',
      ])
    )
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSponsorOrgsByKey(sponsorOrg: string) {
  try {
    const result = await pgQueries.getSponsorOrgsByKey.run(
      { sponsorOrg },
      getClient()
    )
    return makeSomeOptional(result[0], [
      'schoolIds',
      'studentPartnerOrgKeys',
      'studentPartnerOrgIds',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function migrateExistingSponsorOrgs(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingSponsorOrgs.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to migrate existing sponsor orgs to instances: ${err}`
    )
  }
}

export async function migrateExistingPartnerOrgSponsorOrgRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingPartnerOrgSponsorOrgRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to migrate partner orgs for sponsor orgs: ${err}`
    )
  }
}

export async function migrateExistingSchoolsSponsorOrgRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingSchoolsSponsorOrgRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to migrate schools for sponsor orgs: ${err}`
    )
  }
}
