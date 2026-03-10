/** Types generated for queries found in "server/models/RulesActions/rules_actions.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetRulesActionsFromFlagId' parameters type */
export interface IGetRulesActionsFromFlagIdParams {
  flagId: number;
}

/** 'GetRulesActionsFromFlagId' return type */
export interface IGetRulesActionsFromFlagIdResult {
  actionId: number;
  actionName: string | null;
  ruleId: number;
  ruleName: string | null;
}

/** 'GetRulesActionsFromFlagId' query type */
export interface IGetRulesActionsFromFlagIdQuery {
  params: IGetRulesActionsFromFlagIdParams;
  result: IGetRulesActionsFromFlagIdResult;
}

const getRulesActionsFromFlagIdIR: any = {"usedParamSet":{"flagId":true},"params":[{"name":"flagId","required":true,"transform":{"type":"scalar"},"locs":[{"a":346,"b":353}]}],"statement":"SELECT\n    mrf.rule_id AS rule_id,\n    mra.action_id AS action_id,\n    ma.action_name,\n    mr.name AS rule_name\nFROM\n    moderation_rules_flags mrf\n    JOIN moderation_rule_actions mra ON mrf.rule_id = mra.rule_id\n    JOIN moderation_actions ma ON mra.action_id = ma.id\n    JOIN moderation_rules mr ON mrf.rule_id = mr.id\nWHERE\n    mrf.flag_id = :flagId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     mrf.rule_id AS rule_id,
 *     mra.action_id AS action_id,
 *     ma.action_name,
 *     mr.name AS rule_name
 * FROM
 *     moderation_rules_flags mrf
 *     JOIN moderation_rule_actions mra ON mrf.rule_id = mra.rule_id
 *     JOIN moderation_actions ma ON mra.action_id = ma.id
 *     JOIN moderation_rules mr ON mrf.rule_id = mr.id
 * WHERE
 *     mrf.flag_id = :flagId!
 * ```
 */
export const getRulesActionsFromFlagId = new PreparedQuery<IGetRulesActionsFromFlagIdParams,IGetRulesActionsFromFlagIdResult>(getRulesActionsFromFlagIdIR);


