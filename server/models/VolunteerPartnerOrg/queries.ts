import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import {VolunteerPartnerOrg } from './types'

export async function getVolunteerPartnerOrgForRegistrationByKey(key: string) {
  try {
    const result = await pgQueries.getVolunteerPartnerOrgForRegistrationByKey.run({key}, getClient())
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no volunteer partner org found with key ${key}`)
    return makeSomeRequired(result[0], ['domains'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFullVolunteerPartnerOrgByKey(key: string) {
  try {
    const result = await pgQueries.getVolunteerPartnerOrgForRegistrationByKey.run({key}, getClient())
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no volunteer partner org found with key ${key}`)
    return makeSomeRequired(result[0], ['domains'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getVolunteerPartnerOrgs() {
  try {
    const result = await pgQueries.getVolunteerPartnerOrgs.run(undefined, getClient())
    const orgs: VolunteerPartnerOrg[] = result.map(org => makeSomeRequired(org, ['domains']))
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}
