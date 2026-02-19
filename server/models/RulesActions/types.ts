export type Rule = {
  ruleId: number
  name: string
  description: string
}

export type Action = {
  actionId: number
  actionName: string
  description: string
}

export type RulesActionsResult = {
  ruleId: number
  actionId: number
  actionName: string
  ruleName: string
}
