import { Rules, TextModerationPattern } from './types'
import { RepoCreateError, RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient, getRoClient } from '../../db'
import { makeSomeRequired } from '../pgUtils'
export async function insertTextModerationPattern(
  regex: RegExp,
  flags?: string,
  rules?: Rules
) {
  try {
    const result = await pgQueries.insertTextModerationPattern.run(
      {
        regex: regex.toString(),
        flags,
        rules,
      },
      getClient()
    )
    if (!result.length) {
      throw new Error('Failed to insert text moderation pattern')
    }
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getTextModerationPatterns(): Promise<
  TextModerationPattern[]
> {
  try {
    const results = await pgQueries.getTextModerationPatterns.run(
      undefined,
      getRoClient()
    )
    return results.map((row) => {
      const camelCased = makeSomeRequired(row, ['regex', 'id'])
      return {
        ...camelCased,
        regex: new RegExp(camelCased.regex, camelCased.flags || ''),
        rules: (camelCased?.rules as Rules) ?? null,
      }
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}
