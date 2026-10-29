import { getClient, TransactionClient } from '../../db'
import { RepoCreateError } from '../Errors'
import { getDbUlid, makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { InsertSessionOfferArgs } from './types'

export async function insertSessionOffer(
  args: InsertSessionOfferArgs,
  tc: TransactionClient = getClient()
): Promise<Ulid> {
  try {
    const [row] = await pgQueries.insertSessionOffer.run(
      {
        id: getDbUlid(),
        sessionId: args.sessionId,
        volunteerId: args.volunteerId,
        offeredAt: args.offeredAt,
        outcome: args.outcome,
        closedAt: args.closedAt,
        scorecardVersion: args.scorecardVersion,
        output: JSON.stringify(args.output),
      },
      tc
    )
    if (!row) throw new Error('Insert of session offer returned no row')
    return makeSomeRequired(row, ['id']).id
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
