import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import { AssociatedPartner } from './types'

export async function getAssociatedPartners(): Promise<AssociatedPartner[]> {
  try {
    const result = await pgQueries.getAssociatedPartners.run(undefined, getClient())
    const orgs: AssociatedPartner[] = result.map(org => makeSomeRequired(org, ['studentPartnerOrg', 'studentOrgDisplay', 'studentSponsorOrg']))
    return orgs
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssociatedPartnerByKey(key: string): Promise<AssociatedPartner> {
  try {
    const result = await pgQueries.getAssociatedPartnerByKey.run({key}, getClient())
    if (!(result.length && makeRequired(result[0])))
      throw new Error(`no associated partner found with key ${key}`)
    return makeSomeRequired(result[0], ['studentPartnerOrg', 'studentOrgDisplay', 'studentSponsorOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
