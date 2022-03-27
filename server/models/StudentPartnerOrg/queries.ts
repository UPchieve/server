import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import { StudentPartnerOrg } from './types'

export async function getStudentPartnerOrgForRegistrationByKey(key: string) {
  try {
    const result = await pgQueries.getStudentPartnerOrgForRegistrationByKey.run({key}, getClient())
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no student partner org found with key ${key}`)
    return makeSomeRequired(result[0], ['sites'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFullStudentPartnerOrgByKey(key: string) {
  try {
    const result = await pgQueries.getStudentPartnerOrgForRegistrationByKey.run({key}, getClient())
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no student partner org found with key ${key}`)
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentPartnerOrgs() {
  try {
    const result = await pgQueries.getStudentPartnerOrgs.run(undefined, getClient())
    const orgs: StudentPartnerOrg[] = result.map(org => makeSomeRequired(org, ['sites']))
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}
