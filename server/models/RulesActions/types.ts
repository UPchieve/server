export type Rule = {
  ruleId: number
  name?: string
  description: string
}

export type Action = {
  actionId: number
  actionName: string
  description: string
}

export type RulesActionsResult = Pick<Rule, 'ruleId' | 'name'> & Pick<Action, 'actionId' | 'actionName'>
