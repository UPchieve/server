import { getClient } from '../../db'
import { RepoReadError } from '../Errors'
import { makeRequired } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { GetEmailDomainBlocklistEntryResult } from './types'

export async function getEmailDomainBlocklistEntry(
  domain: string,
  tc = getClient()
): Promise<GetEmailDomainBlocklistEntryResult | undefined> {
  try {
    const result = await pgQueries.getEmailDomainBlocklistEntry.run(
      { domain },
      tc
    )
    if (result.length > 0) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
