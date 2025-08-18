import { getClient, TransactionClient } from '../../db'
import { makeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'

export async function getBlockedEmailDomainByDomain(
  domain: string,
  tc: TransactionClient = getClient()
) {
  try {
    const result = await pgQueries.getBlockedEmailDomainByDomain.run(
      { email_domain: domain },
      tc
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
