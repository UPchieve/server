/** Types generated for queries found in "database/seeds/static/notifications/notifications.sql" */
import { PreparedQuery } from '@pgtyped/query'

/** 'InsertNotificationMethod' parameters type */
export interface IInsertNotificationMethodParams {
  method: string
}

/** 'InsertNotificationMethod' return type */
export interface IInsertNotificationMethodResult {
  ok: number
}

/** 'InsertNotificationMethod' query type */
export interface IInsertNotificationMethodQuery {
  params: IInsertNotificationMethodParams
  result: IInsertNotificationMethodResult
}

const insertNotificationMethodIR: any = {
  name: 'insertNotificationMethod',
  params: [
    {
      name: 'method',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 112, b: 118, line: 2, col: 75 }] },
    },
  ],
  usedParamSet: { method: true },
  statement: {
    body:
      'INSERT INTO notification_methods (method, created_at, updated_at) VALUES (:method!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 37, b: 175, line: 2, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notification_methods (method, created_at, updated_at) VALUES (:method!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertNotificationMethod = new PreparedQuery<
  IInsertNotificationMethodParams,
  IInsertNotificationMethodResult
>(insertNotificationMethodIR)

/** 'InsertNotificationType' parameters type */
export interface IInsertNotificationTypeParams {
  type: string
}

/** 'InsertNotificationType' return type */
export interface IInsertNotificationTypeResult {
  ok: number
}

/** 'InsertNotificationType' query type */
export interface IInsertNotificationTypeQuery {
  params: IInsertNotificationTypeParams
  result: IInsertNotificationTypeResult
}

const insertNotificationTypeIR: any = {
  name: 'insertNotificationType',
  params: [
    {
      name: 'type',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 285, b: 289, line: 5, col: 71 }] },
    },
  ],
  usedParamSet: { type: true },
  statement: {
    body:
      'INSERT INTO notification_types (type, created_at, updated_at) VALUES (:type!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 214, b: 346, line: 5, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notification_types (type, created_at, updated_at) VALUES (:type!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertNotificationType = new PreparedQuery<
  IInsertNotificationTypeParams,
  IInsertNotificationTypeResult
>(insertNotificationTypeIR)

/** 'InsertPriorityGroup' parameters type */
export interface IInsertPriorityGroupParams {
  name: string
  priority: number
}

/** 'InsertPriorityGroup' return type */
export interface IInsertPriorityGroupResult {
  ok: number
}

/** 'InsertPriorityGroup' query type */
export interface IInsertPriorityGroupQuery {
  params: IInsertPriorityGroupParams
  result: IInsertPriorityGroupResult
}

const insertPriorityGroupIR: any = {
  name: 'insertPriorityGroup',
  params: [
    {
      name: 'name',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 473, b: 477, line: 8, col: 91 }] },
    },
    {
      name: 'priority',
      required: true,
      transform: { type: 'scalar' },
      codeRefs: { used: [{ a: 481, b: 489, line: 8, col: 99 }] },
    },
  ],
  usedParamSet: { name: true, priority: true },
  statement: {
    body:
      'INSERT INTO notification_priority_groups (name, priority, created_at, updated_at) VALUES (:name!, :priority!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok',
    loc: { a: 382, b: 546, line: 8, col: 0 },
  },
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notification_priority_groups (name, priority, created_at, updated_at) VALUES (:name!, :priority!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok
 * ```
 */
export const insertPriorityGroup = new PreparedQuery<
  IInsertPriorityGroupParams,
  IInsertPriorityGroupResult
>(insertPriorityGroupIR)
