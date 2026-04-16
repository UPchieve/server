/** Types generated for queries found in "server/models/TextModerationPatterns/text_moderation_patterns.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** Query 'InsertTextModerationPattern' is invalid, so its result is assigned type 'never'.
 *  */
export type IInsertTextModerationPatternResult = never;

/** Query 'InsertTextModerationPattern' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IInsertTextModerationPatternParams = never;

const insertTextModerationPatternIR: any = {"usedParamSet":{"regex":true,"flags":true,"rules":true},"params":[{"name":"regex","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":77}]},{"name":"flags","required":false,"transform":{"type":"scalar"},"locs":[{"a":80,"b":85}]},{"name":"rules","required":false,"transform":{"type":"scalar"},"locs":[{"a":88,"b":93}]}],"statement":"INSERT INTO text_moderation_patterns (regex, flags, rules)\n    VALUES (:regex!, :flags, :rules)\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO text_moderation_patterns (regex, flags, rules)
 *     VALUES (:regex!, :flags, :rules)
 * RETURNING
 *     *
 * ```
 */
export const insertTextModerationPattern = new PreparedQuery<IInsertTextModerationPatternParams,IInsertTextModerationPatternResult>(insertTextModerationPatternIR);


/** 'GetTextModerationPatterns' parameters type */
export type IGetTextModerationPatternsParams = void;

/** 'GetTextModerationPatterns' return type */
export interface IGetTextModerationPatternsResult {
  createdAt: Date;
  id: number;
  regex: string;
  rules: Json | null;
  updatedAt: Date;
}

/** 'GetTextModerationPatterns' query type */
export interface IGetTextModerationPatternsQuery {
  params: IGetTextModerationPatternsParams;
  result: IGetTextModerationPatternsResult;
}

const getTextModerationPatternsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n    *\nFROM\n    text_moderation_patterns"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     *
 * FROM
 *     text_moderation_patterns
 * ```
 */
export const getTextModerationPatterns = new PreparedQuery<IGetTextModerationPatternsParams,IGetTextModerationPatternsResult>(getTextModerationPatternsIR);


