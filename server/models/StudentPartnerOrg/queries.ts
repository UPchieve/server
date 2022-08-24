import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import { StudentPartnerOrg, StudentPartnerOrgForRegistration } from './types'
import { PoolClient } from 'pg'

export async function getStudentPartnerOrgForRegistrationByKey(
  key: string
): Promise<StudentPartnerOrgForRegistration> {
  try {
    const result = await pgQueries.getStudentPartnerOrgForRegistrationByKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no student partner org found with key ${key}`)
    return makeSomeRequired(result[0], ['sites'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFullStudentPartnerOrgByKey(key: string) {
  try {
    const result = await pgQueries.getFullStudentPartnerOrgByKey.run(
      { key },
      getClient()
    )
    if (!result.length)
      throw new Error(`no student partner org found with key ${key}`)
    return makeSomeRequired(result[0], ['sites'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgs() {
  try {
    const result = await pgQueries.getStudentPartnerOrgs.run(
      undefined,
      getClient()
    )
    const orgs: StudentPartnerOrg[] = result.map(org => {
      const temp = makeSomeRequired(org, ['sites'])
      return {
        ...temp,
        displayName: temp.name,
      }
    })
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgKeyByCode(
  signupCode: string
): Promise<string> {
  try {
    const result = await pgQueries.getStudentPartnerOrgKeyByCode.run(
      { signupCode },
      getClient()
    )
    if (!(result.length && makeRequired(result[0])))
      throw new Error(
        `no student partner org found with signup code ${signupCode}`
      )
    return makeRequired(result[0]).key
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function migrateExistingStudentPartnerOrgs(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingStudentPartnerOrgs.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate existing instances for student partner orgs: ${err}`
    )
  }
}

export async function migrateExistingStudentPartnerOrgRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingStudentPartnerOrgRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate existing user relationships for student partner orgs: ${err}`
    )
  }
}

// TODO: waiting on programs to get list mapping partnerSchool->partnership start date
// Will need custom mapping of school names to student_partner_orgs_upchieve_instance.created_at
// MUST BE RUN FIRST
export async function migratePartnerSchoolsToPartnerOrgs(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migratepPartnerSchoolsToPartnerOrgs.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate schools to student partner orgs: ${err}`
    )
  }
}

// must be run after migrating schools to partner orgs
export async function migrateExistingPartnerSchoolRelationships(
  client?: PoolClient
): Promise<void> {
  try {
    await pgQueries.migrateExistingPartnerSchoolRelationships.run(
      undefined,
      client || getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to migrate user-school relationship for student partner orgs: ${err}`
    )
  }
}
