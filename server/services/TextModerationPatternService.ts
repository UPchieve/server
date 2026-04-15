import { Rules, TextModerationPattern } from '../models/TextModerationPatterns'
import * as TextModerationPatternsRepo from '../models/TextModerationPatterns/queries'
export async function insertTextModerationPattern(
  regex: RegExp,
  rules?: Rules
) {
  await TextModerationPatternsRepo.insertTextModerationPattern(regex, rules)
}

async function getTextModerationPatterns(): Promise<TextModerationPattern[]> {
  // @TODO: Read from cache first!
  return await TextModerationPatternsRepo.getTextModerationPatterns()
}
