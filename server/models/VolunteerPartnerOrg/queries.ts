import { PoolClient } from 'pg'
import { getClient } from '../../db'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  VolunteerPartnerOrg,
  VolunteerPartnerOrgForRegistration,
} from './types'

export async function getVolunteerPartnerOrgForRegistrationByKey(
  key: string
): Promise<VolunteerPartnerOrgForRegistration> {
  try {
    const result = await pgQueries.getVolunteerPartnerOrgForRegistrationByKey.run(
      { key },
      getClient()
    )
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no volunteer partner org found with key ${key}`)
    return makeSomeOptional(result[0], ['domains'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFullVolunteerPartnerOrgByKey(
  key: string
): Promise<VolunteerPartnerOrg> {
  try {
    const result = await pgQueries.getFullVolunteerPartnerOrgByKey.run(
      { key },
      getClient()
    )
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no volunteer partner org found with key ${key}`)
    return makeSomeOptional(result[0], ['domains'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerPartnerOrgIdByKey(
  volunteerPartnerOrg: string,
  poolClient?: PoolClient
): Promise<Ulid | undefined> {
  const client = poolClient ? poolClient : getClient()
  try {
    const result = await pgQueries.getVolunteerPartnerOrgIdByKey.run(
      { volunteerPartnerOrg },
      client
    )
    if (result.length) {
      return result[0].id
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerPartnerOrgs(): Promise<
  VolunteerPartnerOrg[]
> {
  try {
    const result = await pgQueries.getVolunteerPartnerOrgs.run(
      undefined,
      getClient()
    )
    const orgs: VolunteerPartnerOrg[] = result.map(org => {
      const temp = makeSomeOptional(org, ['domains'])
      return {
        ...temp,
        // TODO: remove reference to display name in frontend
        displayName: temp.name,
      }
    })
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function migrateExistingVolunteerPartnerOrgs(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingVolunteerPartnerOrgs.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to mgirate existing instances for volunteer partner orgs: ${err}`
    )
  }
}

export async function migrateExistingvolunteerPartnerOrgRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingvolunteerPartnerOrgRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to mgirate user-vpo relationships for volunteer partner orgs: ${err}`
    )
  }
}

export async function backfillVolunteerPartnerOrgStartDates(
  vpoName: string,
  createdAt: Date,
  endedAt?: Date,
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.backfillVolunteerPartnerOrgStartDates.run(
      { vpoName, createdAt, endedAt },
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to backfill volunteer partner org start date: ${err}`
    )
  }
}
