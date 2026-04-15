/** Types generated for queries found in "server/models/TextModerationPatterns/text_moderation_patterns.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'InsertTextModerationPattern' parameters type */
export interface IInsertTextModerationPatternParams {
  regex: string;
  rules?: Json | null | void;
}

/** 'InsertTextModerationPattern' return type */
export interface IInsertTextModerationPatternResult {
  createdAt: Date;
  id: number;
  regex: string;
  rules: Json | null;
  updatedAt: Date;
}

/** 'InsertTextModerationPattern' query type */
export interface IInsertTextModerationPatternQuery {
  params: IInsertTextModerationPatternParams;
  result: IInsertTextModerationPatternResult;
}

const insertTextModerationPatternIR: any = {"usedParamSet":{"regex":true,"rules":true},"params":[{"name":"regex","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":70}]},{"name":"rules","required":false,"transform":{"type":"scalar"},"locs":[{"a":73,"b":78}]}],"statement":"INSERT INTO text_moderation_patterns (regex, rules)\n    VALUES (:regex!, :rules)\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO text_moderation_patterns (regex, rules)
 *     VALUES (:regex!, :rules)
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


