/** Types generated for queries found in "server/models/DirectMessage/direct_message.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'CreateConversationIfEligible' parameters type */
export interface ICreateConversationIfEligibleParams {
  id: string;
  minSessionLength: NumberOrString;
  studentId: string;
  volunteerId: string;
}

/** 'CreateConversationIfEligible' return type */
export type ICreateConversationIfEligibleResult = void;

/** 'CreateConversationIfEligible' query type */
export interface ICreateConversationIfEligibleQuery {
  params: ICreateConversationIfEligibleParams;
  result: ICreateConversationIfEligibleResult;
}

const createConversationIfEligibleIR: any = {"usedParamSet":{"id":true,"studentId":true,"volunteerId":true,"minSessionLength":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":110}]},{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":127},{"a":291,"b":301}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":146},{"a":334,"b":346}]},{"name":"minSessionLength","required":true,"transform":{"type":"scalar"},"locs":[{"a":416,"b":433}]}],"statement":"INSERT INTO direct_message_conversations (id, student_id, volunteer_id, created_at, updated_at)\nSELECT\n    :id!,\n    :studentId!,\n    :volunteerId!,\n    NOW(),\n    NOW()\nWHERE\n    EXISTS (\n        SELECT\n            1\n        FROM\n            sessions\n        WHERE\n            student_id = :studentId!\n            AND volunteer_id = :volunteerId!\n            AND ended_at IS NOT NULL\n            AND time_tutored > :minSessionLength!)\nON CONFLICT (volunteer_id,\n    student_id)\n    DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_message_conversations (id, student_id, volunteer_id, created_at, updated_at)
 * SELECT
 *     :id!,
 *     :studentId!,
 *     :volunteerId!,
 *     NOW(),
 *     NOW()
 * WHERE
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             sessions
 *         WHERE
 *             student_id = :studentId!
 *             AND volunteer_id = :volunteerId!
 *             AND ended_at IS NOT NULL
 *             AND time_tutored > :minSessionLength!)
 * ON CONFLICT (volunteer_id,
 *     student_id)
 *     DO NOTHING
 * ```
 */
export const createConversationIfEligible = new PreparedQuery<ICreateConversationIfEligibleParams,ICreateConversationIfEligibleResult>(createConversationIfEligibleIR);


/** 'GetConversationByParticipants' parameters type */
export interface IGetConversationByParticipantsParams {
  studentId: string;
  volunteerId: string;
}

/** 'GetConversationByParticipants' return type */
export interface IGetConversationByParticipantsResult {
  /** not_pii */
  createdAt: Date;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Foreign key */
  studentId: string;
  /** not_pii: When the student last viewed the conversation */
  studentLastSeen: Date | null;
  /** not_pii: Foreign key */
  volunteerId: string;
  /** not_pii: When the volunteer last viewed the conversation */
  volunteerLastSeen: Date | null;
}

/** 'GetConversationByParticipants' query type */
export interface IGetConversationByParticipantsQuery {
  params: IGetConversationByParticipantsParams;
  result: IGetConversationByParticipantsResult;
}

const getConversationByParticipantsIR: any = {"usedParamSet":{"studentId":true,"volunteerId":true},"params":[{"name":"studentId","required":true,"transform":{"type":"scalar"},"locs":[{"a":173,"b":183}]},{"name":"volunteerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":208,"b":220}]}],"statement":"SELECT\n    id,\n    student_id,\n    volunteer_id,\n    student_last_seen,\n    volunteer_last_seen,\n    created_at\nFROM\n    direct_message_conversations\nWHERE\n    student_id = :studentId!\n    AND volunteer_id = :volunteerId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     student_id,
 *     volunteer_id,
 *     student_last_seen,
 *     volunteer_last_seen,
 *     created_at
 * FROM
 *     direct_message_conversations
 * WHERE
 *     student_id = :studentId!
 *     AND volunteer_id = :volunteerId!
 * ```
 */
export const getConversationByParticipants = new PreparedQuery<IGetConversationByParticipantsParams,IGetConversationByParticipantsResult>(getConversationByParticipantsIR);


