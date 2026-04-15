/**
 * @property allowForTopicIds: Subject IDs for which this pattern should be allowed; generally, patterns describe
 * forbidden phrases, so this property represents the exceptions to that rule.
 */
export type Rules = {
  allowForTopicIds?: number[]
}

export type TextModerationPattern = {
  regex: RegExp
  rules: Rules | null
}
