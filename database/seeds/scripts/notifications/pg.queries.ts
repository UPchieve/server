/** Types generated for queries found in "database/seeds/scripts/notifications/notifications.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertNotificationMethod' parameters type */
export interface IInsertNotificationMethodParams {
  method: string;
}

/** 'InsertNotificationMethod' return type */
export interface IInsertNotificationMethodResult {
  ok: number | null;
}

/** 'InsertNotificationMethod' query type */
export interface IInsertNotificationMethodQuery {
  params: IInsertNotificationMethodParams;
  result: IInsertNotificationMethodResult;
}

const insertNotificationMethodIR: any = {"name":"insertNotificationMethod","params":[{"name":"method","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":137,"b":143,"line":4,"col":17},{"a":312,"b":318,"line":12,"col":60}]}}],"usedParamSet":{"method":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO notification_methods (method, created_at, updated_at)\n        VALUES (:method!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM notification_methods WHERE method=:method!","loc":{"a":37,"b":318,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO notification_methods (method, created_at, updated_at)
 *         VALUES (:method!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM notification_methods WHERE method=:method!
 * ```
 */
export const insertNotificationMethod = new PreparedQuery<IInsertNotificationMethodParams,IInsertNotificationMethodResult>(insertNotificationMethodIR);


/** 'InsertNotificationType' parameters type */
export interface IInsertNotificationTypeParams {
  type: string;
}

/** 'InsertNotificationType' return type */
export interface IInsertNotificationTypeResult {
  ok: number | null;
}

/** 'InsertNotificationType' query type */
export interface IInsertNotificationTypeQuery {
  params: IInsertNotificationTypeParams;
  result: IInsertNotificationTypeResult;
}

const insertNotificationTypeIR: any = {"name":"insertNotificationType","params":[{"name":"type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":454,"b":458,"line":18,"col":17},{"a":623,"b":627,"line":26,"col":56}]}}],"usedParamSet":{"type":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO notification_types (type, created_at, updated_at)\n        VALUES (:type!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM notification_types WHERE type=:type!","loc":{"a":358,"b":627,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO notification_types (type, created_at, updated_at)
 *         VALUES (:type!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM notification_types WHERE type=:type!
 * ```
 */
export const insertNotificationType = new PreparedQuery<IInsertNotificationTypeParams,IInsertNotificationTypeResult>(insertNotificationTypeIR);


/** 'InsertPriorityGroup' parameters type */
export interface IInsertPriorityGroupParams {
  name: string;
  priority: number;
}

/** 'InsertPriorityGroup' return type */
export interface IInsertPriorityGroupResult {
  ok: number | null;
}

/** 'InsertPriorityGroup' query type */
export interface IInsertPriorityGroupQuery {
  params: IInsertPriorityGroupParams;
  result: IInsertPriorityGroupResult;
}

const insertPriorityGroupIR: any = {"name":"insertPriorityGroup","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":780,"b":784,"line":32,"col":17},{"a":971,"b":975,"line":40,"col":66}]}},{"name":"priority","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":788,"b":796,"line":32,"col":25}]}}],"usedParamSet":{"name":true,"priority":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO notification_priority_groups (name, priority, created_at, updated_at)\n        VALUES (:name!, :priority!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM notification_priority_groups WHERE name=:name!","loc":{"a":664,"b":975,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO notification_priority_groups (name, priority, created_at, updated_at)
 *         VALUES (:name!, :priority!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM notification_priority_groups WHERE name=:name!
 * ```
 */
export const insertPriorityGroup = new PreparedQuery<IInsertPriorityGroupParams,IInsertPriorityGroupResult>(insertPriorityGroupIR);


