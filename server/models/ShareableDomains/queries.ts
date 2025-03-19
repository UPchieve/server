import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { getRoClient, TransactionClient } from '../../db'

export async function getAllowedDomains(
  tc: TransactionClient = getRoClient()
): Promise<string[]> {
  try {
    const result = await pgQueries.getAllShareableDomains.run(undefined, tc)

    if (result.length) {
      return result.map(({ domain }: { domain: string }) => domain)
    }
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
