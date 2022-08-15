import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoReadError, RepoUpdateError } from '../Errors'
import {
  VolunteerPartnerOrg,
  VolunteerPartnerOrgForRegistration,
} from './types'
import { PoolClient } from 'pg'

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
    return makeSomeRequired(result[0], ['domains'])
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
    return makeSomeRequired(result[0], ['domains'])
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
      const temp = makeSomeRequired(org, ['domains'])
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
