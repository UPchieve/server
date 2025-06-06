import { PoolClient } from 'pg'
import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  CreateUserStudentPartnerOrgInstancePayload,
  GetStudentPartnerOrgResult,
  StudentPartnerOrg,
  StudentPartnerOrgForRegistration,
} from './types'
import logger from '../../logger'

export async function getStudentPartnerOrgByKey(
  tc: TransactionClient,
  partnerKey: string,
  partnerSite?: string
): Promise<GetStudentPartnerOrgResult | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerOrgByKey.run(
      {
        partnerKey,
        partnerSite,
      },
      tc
    )
    if (result.length) {
      return makeSomeOptional(result[0], ['siteId', 'siteName', 'schoolId'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgBySchoolId(
  tc: TransactionClient,
  schoolId: string
): Promise<GetStudentPartnerOrgResult | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerOrgBySchoolId.run(
      {
        schoolId,
      },
      tc
    )
    if (result.length) {
      if (result.length > 1)
        logger.warn(
          { schoolId },
          'Found multiple student partner orgs for this school ID. Returning the first match'
        )
      return makeSomeOptional(result[0], ['siteId', 'siteName', 'schoolId'])
    }
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
    return makeSomeOptional(result[0], ['sites'])
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
    const orgs: StudentPartnerOrg[] = result.map((org) => {
      const temp = makeSomeOptional(org, ['sites'])
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

export async function createUserStudentPartnerOrgInstance(
  uspoData: CreateUserStudentPartnerOrgInstancePayload,
  tc: TransactionClient
): Promise<void> {
  try {
    await pgQueries.createUserStudentPartnerOrgInstance.run(
      {
        userId: uspoData.userId,
        spoId: uspoData.studentPartnerOrgId,
        sposId: uspoData.studentPartnerOrgSiteId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createSchoolStudentPartnerOrg(
  schoolId: string,
  client: TransactionClient
): Promise<void> {
  try {
    await pgQueries.createSchoolStudentPartnerOrg.run(
      { schoolId },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoCreateError(
      `Failed to create school partner for schoolId ${schoolId} and partner instance: ${err}`
    )
  }
}

export async function createStudentPartnerOrgUpchieveInstance(
  schoolId: string,
  client: TransactionClient
): Promise<void> {
  try {
    await pgQueries.createStudentPartnerOrgInstance.run(
      { schoolId },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoCreateError(
      `Failed to create student partner org upchieve instance for school ${schoolId}`
    )
  }
}

export async function deactivateSchoolStudentPartnerOrgs(
  schoolId: string,
  client: TransactionClient
): Promise<void> {
  try {
    await pgQueries.deactivateStudentPartnerOrg.run(
      { schoolId },
      client ?? getClient()
    )
  } catch (err) {
    throw new RepoReadError(
      `Failed to deactivate student partner org(s) for school ${schoolId}: ${err}`
    )
  }
}

export async function deactivateUserStudentPartnerOrgInstance(
  tc: TransactionClient,
  userId: Ulid,
  studentPartnerOrgId: string
) {
  try {
    await pgQueries.deactivateUserStudentPartnerOrgInstance.run(
      {
        userId,
        spoId: studentPartnerOrgId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to deactivate instance of user ${userId} with student partner org ${studentPartnerOrgId}: ${err}`
    )
  }
}
