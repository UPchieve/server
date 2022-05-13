import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeSomeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import { SponsorOrg } from './types'

export async function getSponsorOrgs() {
  try {
    const result = await pgQueries.getSponsorOrgs.run(undefined, getClient())
    const orgs: SponsorOrg[] = result.map(org =>
      makeSomeRequired(org, [
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
    return makeSomeRequired(result[0], [
      'schoolIds',
      'studentPartnerOrgKeys',
      'studentPartnerOrgIds',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
