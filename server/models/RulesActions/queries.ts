import { getClient, TransactionClient } from '../../db'
import { RulesActionsResult } from './types'
import * as pgQueries from './pg.queries'
import { RepoReadError, RepoUpdateError } from '../Errors'
import { makeSomeRequired, Uuid } from '../pgUtils'

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

export async function shadowBanStudent(
  studentId: Uuid,
  tc: TransactionClient = getClient()
): Promise<void> {
  try {
    await pgQueries.shadowBanStudent.run({ studentId }, tc)
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}