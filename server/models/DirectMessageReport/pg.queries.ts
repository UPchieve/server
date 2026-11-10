/** Types generated for queries found in "server/models/DirectMessageReport/direct_message_report.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateReport' parameters type */
export interface ICreateReportParams {
  conversationId: string;
  id: string;
  reportedUserId: string;
  reportingUserId: string;
  reportMessage?: string | null | void;
  reportReason: string;
}

/** 'CreateReport' return type */
export interface ICreateReportResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'CreateReport' query type */
export interface ICreateReportQuery {
  params: ICreateReportParams;
  result: ICreateReportResult;
}

const createReportIR: any = {"usedParamSet":{"id":true,"conversationId":true,"reportMessage":true,"reportingUserId":true,"reportedUserId":true,"reportReason":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":139,"b":142}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":164}]},{"name":"reportMessage","required":false,"transform":{"type":"scalar"},"locs":[{"a":194,"b":207}]},{"name":"reportingUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":214,"b":230}]},{"name":"reportedUserId","required":true,"transform":{"type":"scalar"},"locs":[{"a":237,"b":252}]},{"name":"reportReason","required":true,"transform":{"type":"scalar"},"locs":[{"a":297,"b":310}]}],"statement":"INSERT INTO direct_message_reports (id, conversation_id, report_reason_id, report_message, reporting_user_id, reported_user_id)\nSELECT\n    :id!,\n    :conversationId!,\n    report_reasons.id,\n    :reportMessage,\n    :reportingUserId!,\n    :reportedUserId!\nFROM\n    report_reasons\nWHERE\n    reason = :reportReason!\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_message_reports (id, conversation_id, report_reason_id, report_message, reporting_user_id, reported_user_id)
 * SELECT
 *     :id!,
 *     :conversationId!,
 *     report_reasons.id,
 *     :reportMessage,
 *     :reportingUserId!,
 *     :reportedUserId!
 * FROM
 *     report_reasons
 * WHERE
 *     reason = :reportReason!
 * RETURNING
 *     id
 * ```
 */
export const createReport = new PreparedQuery<ICreateReportParams,ICreateReportResult>(createReportIR);


/** 'CreateReportFlag' parameters type */
export interface ICreateReportFlagParams {
  conversationId: string;
  flagName: string;
  id: string;
  reportId: string;
}

/** 'CreateReportFlag' return type */
export interface ICreateReportFlagResult {
  /** not_pii: Primary key */
  id: string;
}

/** 'CreateReportFlag' query type */
export interface ICreateReportFlagQuery {
  params: ICreateReportFlagParams;
  result: ICreateReportFlagResult;
}

const createReportFlagIR: any = {"usedParamSet":{"id":true,"flagName":true,"reportId":true,"conversationId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":97}]},{"name":"flagName","required":true,"transform":{"type":"scalar"},"locs":[{"a":243,"b":252}]},{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":277,"b":286}]},{"name":"conversationId","required":true,"transform":{"type":"scalar"},"locs":[{"a":322,"b":337}]}],"statement":"INSERT INTO direct_message_flags (id, conversation_id, session_flag_id, report_id)\nSELECT\n    :id!,\n    reports.conversation_id,\n    flags.id,\n    reports.id\nFROM\n    direct_message_reports reports\n    JOIN session_flags flags ON flags.name = :flagName!\nWHERE\n    reports.id = :reportId!\n    AND reports.conversation_id = :conversationId!\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO direct_message_flags (id, conversation_id, session_flag_id, report_id)
 * SELECT
 *     :id!,
 *     reports.conversation_id,
 *     flags.id,
 *     reports.id
 * FROM
 *     direct_message_reports reports
 *     JOIN session_flags flags ON flags.name = :flagName!
 * WHERE
 *     reports.id = :reportId!
 *     AND reports.conversation_id = :conversationId!
 * RETURNING
 *     id
 * ```
 */
export const createReportFlag = new PreparedQuery<ICreateReportFlagParams,ICreateReportFlagResult>(createReportFlagIR);


/** 'GetReportById' parameters type */
export interface IGetReportByIdParams {
  reportId: string;
}

/** 'GetReportById' return type */
export interface IGetReportByIdResult {
  /** not_pii: Foreign key */
  conversationId: string;
  /** not_pii: Primary key */
  id: string;
  /** not_pii: Reported user foreign key */
  reportedUserId: string;
  /** not_pii: Reporting user foreign key */
  reportingUserId: string;
  /** not_pii: Optional report explanation */
  reportMessage: string | null;
  /** not_pii: Reason for the action (text or JSON) */
  reportReason: string;
  /** not_pii: Foreign key */
  studentId: string;
  /** not_pii: Foreign key */
  volunteerId: string;
}

/** 'GetReportById' query type */
export interface IGetReportByIdQuery {
  params: IGetReportByIdParams;
  result: IGetReportByIdResult;
}

const getReportByIdIR: any = {"usedParamSet":{"reportId":true},"params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":473,"b":482}]}],"statement":"SELECT\n    reports.id,\n    reports.conversation_id,\n    reports.reporting_user_id,\n    reports.reported_user_id,\n    reports.report_message,\n    reasons.reason AS report_reason,\n    conversations.student_id,\n    conversations.volunteer_id\nFROM\n    direct_message_reports reports\n    JOIN report_reasons reasons ON reasons.id = reports.report_reason_id\n    JOIN direct_message_conversations conversations ON conversations.id = reports.conversation_id\nWHERE\n    reports.id = :reportId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     reports.id,
 *     reports.conversation_id,
 *     reports.reporting_user_id,
 *     reports.reported_user_id,
 *     reports.report_message,
 *     reasons.reason AS report_reason,
 *     conversations.student_id,
 *     conversations.volunteer_id
 * FROM
 *     direct_message_reports reports
 *     JOIN report_reasons reasons ON reasons.id = reports.report_reason_id
 *     JOIN direct_message_conversations conversations ON conversations.id = reports.conversation_id
 * WHERE
 *     reports.id = :reportId!
 * ```
 */
export const getReportById = new PreparedQuery<IGetReportByIdParams,IGetReportByIdResult>(getReportByIdIR);


