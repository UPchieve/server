import { getClient, TransactionClient } from '../../db'
import { RulesActionsResult } from './types'
import * as pgQueries from './pg.queries'
import { RepoReadError } from '../Errors'
import { makeSomeRequired } from '../pgUtils'

export async function getRulesActionsFromFlagId(
  flagId: number,
  tc: TransactionClient = getClient()
): Promise<RulesActionsResult[] | void> {
  try {
    const result = await pgQueries.getRulesActionsFromFlagId.run({ flagId }, tc)

    if (!result.length) return

    return result.map((v) =>
      makeSomeRequired(v, ['ruleId', 'actionId', 'actionName', 'ruleName'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}
