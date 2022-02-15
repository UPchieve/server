/** Types generated for queries found in "database/seeds/scripts/sessions/sessions.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertReportReason' parameters type */
export interface IInsertReportReasonParams {
  reason: string;
}

/** 'InsertReportReason' return type */
export interface IInsertReportReasonResult {
  ok: number | null;
}

/** 'InsertReportReason' query type */
export interface IInsertReportReasonQuery {
  params: IInsertReportReasonParams;
  result: IInsertReportReasonResult;
}

const insertReportReasonIR: any = {"name":"insertReportReason","params":[{"name":"reason","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":125,"b":131,"line":4,"col":17},{"a":294,"b":300,"line":12,"col":54}]}}],"usedParamSet":{"reason":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO report_reasons (reason, created_at, updated_at)\n        VALUES (:reason!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM report_reasons WHERE reason=:reason!","loc":{"a":31,"b":300,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO report_reasons (reason, created_at, updated_at)
 *         VALUES (:reason!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM report_reasons WHERE reason=:reason!
 * ```
 */
export const insertReportReason = new PreparedQuery<IInsertReportReasonParams,IInsertReportReasonResult>(insertReportReasonIR);


/** 'InsertSessionFlag' parameters type */
export interface IInsertSessionFlagParams {
  name: string;
}

/** 'InsertSessionFlag' return type */
export interface IInsertSessionFlagResult {
  ok: number | null;
}

/** 'InsertSessionFlag' query type */
export interface IInsertSessionFlagQuery {
  params: IInsertSessionFlagParams;
  result: IInsertSessionFlagResult;
}

const insertSessionFlagIR: any = {"name":"insertSessionFlag","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":426,"b":430,"line":18,"col":17},{"a":590,"b":594,"line":26,"col":51}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO session_flags (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM session_flags WHERE name=:name!","loc":{"a":335,"b":594,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO session_flags (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM session_flags WHERE name=:name!
 * ```
 */
export const insertSessionFlag = new PreparedQuery<IInsertSessionFlagParams,IInsertSessionFlagResult>(insertSessionFlagIR);


