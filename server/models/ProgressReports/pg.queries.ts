/** Types generated for queries found in "server/models/ProgressReports/progress_reports.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type stringArray = (string)[];

/** 'InsertProgressReport' parameters type */
export interface IInsertProgressReportParams {
  id: string;
  promptId: number;
  status: string;
  userId: string;
}

/** 'InsertProgressReport' return type */
export interface IInsertProgressReportResult {
  id: string;
}

/** 'InsertProgressReport' query type */
export interface IInsertProgressReportQuery {
  params: IInsertProgressReportParams;
  result: IInsertProgressReportResult;
}

const insertProgressReportIR: any = {"usedParamSet":{"id":true,"userId":true,"promptId":true,"status":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":79}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":93}]},{"name":"promptId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":126}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":224,"b":231}]}],"statement":"INSERT INTO progress_reports (id, user_id, status_id, prompt_id)\nSELECT\n    :id!,\n    :userId!,\n    subquery.id,\n    :promptId!\nFROM (\n    SELECT\n        id\n    FROM\n        progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_reports (id, user_id, status_id, prompt_id)
 * SELECT
 *     :id!,
 *     :userId!,
 *     subquery.id,
 *     :promptId!
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         progress_report_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReport = new PreparedQuery<IInsertProgressReportParams,IInsertProgressReportResult>(insertProgressReportIR);


/** 'InsertProgressReportSession' parameters type */
export interface IInsertProgressReportSessionParams {
  analysisType: string;
  reportId: string;
  sessionId: string;
}

/** 'InsertProgressReportSession' return type */
export interface IInsertProgressReportSessionResult {
  ok: string;
}

/** 'InsertProgressReportSession' query type */
export interface IInsertProgressReportSessionQuery {
  params: IInsertProgressReportSessionParams;
  result: IInsertProgressReportSessionResult;
}

const insertProgressReportSessionIR: any = {"usedParamSet":{"reportId":true,"sessionId":true,"analysisType":true},"params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":115,"b":124}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":141}]},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"locs":[{"a":262,"b":275}]}],"statement":"INSERT INTO progress_report_sessions (progress_report_id, session_id, progress_report_analysis_type_id)\nSELECT\n    :reportId!,\n    :sessionId!,\n    subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        progress_report_analysis_types\n    WHERE\n        name = :analysisType!) AS subquery\nRETURNING\n    progress_report_id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_sessions (progress_report_id, session_id, progress_report_analysis_type_id)
 * SELECT
 *     :reportId!,
 *     :sessionId!,
 *     subquery.id
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         progress_report_analysis_types
 *     WHERE
 *         name = :analysisType!) AS subquery
 * RETURNING
 *     progress_report_id AS ok
 * ```
 */
export const insertProgressReportSession = new PreparedQuery<IInsertProgressReportSessionParams,IInsertProgressReportSessionResult>(insertProgressReportSessionIR);


/** 'InsertProgressReportSummary' parameters type */
export interface IInsertProgressReportSummaryParams {
  id: string;
  overallGrade: number;
  reportId: string;
  summary: string;
}

/** 'InsertProgressReportSummary' return type */
export interface IInsertProgressReportSummaryResult {
  id: string;
}

/** 'InsertProgressReportSummary' query type */
export interface IInsertProgressReportSummaryQuery {
  params: IInsertProgressReportSummaryParams;
  result: IInsertProgressReportSummaryResult;
}

const insertProgressReportSummaryIR: any = {"usedParamSet":{"id":true,"reportId":true,"summary":true,"overallGrade":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":102}]},{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":105,"b":114}]},{"name":"summary","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":125}]},{"name":"overallGrade","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":141}]}],"statement":"INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)\n    VALUES (:id!, :reportId!, :summary!, :overallGrade!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)
 *     VALUES (:id!, :reportId!, :summary!, :overallGrade!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportSummary = new PreparedQuery<IInsertProgressReportSummaryParams,IInsertProgressReportSummaryResult>(insertProgressReportSummaryIR);


/** 'InsertProgressReportConcept' parameters type */
export interface IInsertProgressReportConceptParams {
  description: string;
  grade: number;
  id: string;
  name: string;
  reportId: string;
}

/** 'InsertProgressReportConcept' return type */
export interface IInsertProgressReportConceptResult {
  id: string;
}

/** 'InsertProgressReportConcept' query type */
export interface IInsertProgressReportConceptQuery {
  params: IInsertProgressReportConceptParams;
  result: IInsertProgressReportConceptResult;
}

const insertProgressReportConceptIR: any = {"usedParamSet":{"id":true,"name":true,"description":true,"grade":true,"reportId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":100,"b":103}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":111}]},{"name":"description","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":126}]},{"name":"grade","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":135}]},{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":147}]}],"statement":"INSERT INTO progress_report_concepts (id, name, description, grade, progress_report_id)\n    VALUES (:id!, :name!, :description!, :grade!, :reportId!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_concepts (id, name, description, grade, progress_report_id)
 *     VALUES (:id!, :name!, :description!, :grade!, :reportId!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportConcept = new PreparedQuery<IInsertProgressReportConceptParams,IInsertProgressReportConceptResult>(insertProgressReportConceptIR);


/** 'InsertProgressReportSummaryDetail' parameters type */
export interface IInsertProgressReportSummaryDetailParams {
  content: string;
  focusArea: string;
  id: string;
  infoType: string;
  reportSummaryId: string;
}

/** 'InsertProgressReportSummaryDetail' return type */
export interface IInsertProgressReportSummaryDetailResult {
  id: string;
}

/** 'InsertProgressReportSummaryDetail' query type */
export interface IInsertProgressReportSummaryDetailQuery {
  params: IInsertProgressReportSummaryDetailParams;
  result: IInsertProgressReportSummaryDetailResult;
}

const insertProgressReportSummaryDetailIR: any = {"usedParamSet":{"id":true,"content":true,"reportSummaryId":true,"focusArea":true,"infoType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":158,"b":161}]},{"name":"content","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":176}]},{"name":"reportSummaryId","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":199}]},{"name":"focusArea","required":true,"transform":{"type":"scalar"},"locs":[{"a":324,"b":334}]},{"name":"infoType","required":true,"transform":{"type":"scalar"},"locs":[{"a":455,"b":464}]}],"statement":"INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_focus_area_id, progress_report_info_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportSummaryId!,\n    (\n        SELECT\n            id\n        FROM\n            progress_report_focus_areas\n        WHERE\n            name = :focusArea!), (\n        SELECT\n            id\n        FROM\n            progress_report_info_types\n        WHERE\n            name = :infoType!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_focus_area_id, progress_report_info_type_id)
 * SELECT
 *     :id!,
 *     :content!,
 *     :reportSummaryId!,
 *     (
 *         SELECT
 *             id
 *         FROM
 *             progress_report_focus_areas
 *         WHERE
 *             name = :focusArea!), (
 *         SELECT
 *             id
 *         FROM
 *             progress_report_info_types
 *         WHERE
 *             name = :infoType!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportSummaryDetail = new PreparedQuery<IInsertProgressReportSummaryDetailParams,IInsertProgressReportSummaryDetailResult>(insertProgressReportSummaryDetailIR);


/** 'InsertProgressReportConceptDetail' parameters type */
export interface IInsertProgressReportConceptDetailParams {
  content: string;
  focusArea: string;
  id: string;
  infoType: string;
  reportConceptId: string;
}

/** 'InsertProgressReportConceptDetail' return type */
export interface IInsertProgressReportConceptDetailResult {
  id: string;
}

/** 'InsertProgressReportConceptDetail' query type */
export interface IInsertProgressReportConceptDetailQuery {
  params: IInsertProgressReportConceptDetailParams;
  result: IInsertProgressReportConceptDetailResult;
}

const insertProgressReportConceptDetailIR: any = {"usedParamSet":{"id":true,"content":true,"reportConceptId":true,"focusArea":true,"infoType":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":158,"b":161}]},{"name":"content","required":true,"transform":{"type":"scalar"},"locs":[{"a":168,"b":176}]},{"name":"reportConceptId","required":true,"transform":{"type":"scalar"},"locs":[{"a":183,"b":199}]},{"name":"focusArea","required":true,"transform":{"type":"scalar"},"locs":[{"a":324,"b":334}]},{"name":"infoType","required":true,"transform":{"type":"scalar"},"locs":[{"a":455,"b":464}]}],"statement":"INSERT INTO progress_report_concept_details (id, content, progress_report_concept_id, progress_report_focus_area_id, progress_report_info_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportConceptId!,\n    (\n        SELECT\n            id\n        FROM\n            progress_report_focus_areas\n        WHERE\n            name = :focusArea!), (\n        SELECT\n            id\n        FROM\n            progress_report_info_types\n        WHERE\n            name = :infoType!)\nRETURNING\n    id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_concept_details (id, content, progress_report_concept_id, progress_report_focus_area_id, progress_report_info_type_id)
 * SELECT
 *     :id!,
 *     :content!,
 *     :reportConceptId!,
 *     (
 *         SELECT
 *             id
 *         FROM
 *             progress_report_focus_areas
 *         WHERE
 *             name = :focusArea!), (
 *         SELECT
 *             id
 *         FROM
 *             progress_report_info_types
 *         WHERE
 *             name = :infoType!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportConceptDetail = new PreparedQuery<IInsertProgressReportConceptDetailParams,IInsertProgressReportConceptDetailResult>(insertProgressReportConceptDetailIR);


/** 'UpdateProgressReportStatus' parameters type */
export interface IUpdateProgressReportStatusParams {
  reportId: string;
  status: string;
}

/** 'UpdateProgressReportStatus' return type */
export interface IUpdateProgressReportStatusResult {
  ok: string;
}

/** 'UpdateProgressReportStatus' query type */
export interface IUpdateProgressReportStatusQuery {
  params: IUpdateProgressReportStatusParams;
  result: IUpdateProgressReportStatusResult;
}

const updateProgressReportStatusIR: any = {"usedParamSet":{"status":true,"reportId":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":187}]},{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":234,"b":243}]}],"statement":"UPDATE\n    progress_reports\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    progress_reports.id = :reportId!\nRETURNING\n    progress_reports.id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     progress_reports
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         progress_report_statuses
 *     WHERE
 *         name = :status!) AS subquery
 * WHERE
 *     progress_reports.id = :reportId!
 * RETURNING
 *     progress_reports.id AS ok
 * ```
 */
export const updateProgressReportStatus = new PreparedQuery<IUpdateProgressReportStatusParams,IUpdateProgressReportStatusResult>(updateProgressReportStatusIR);


/** 'GetProgressReportInfoBySessionId' parameters type */
export interface IGetProgressReportInfoBySessionIdParams {
  analysisType: string;
  sessionId: string;
  userId: string;
}

/** 'GetProgressReportInfoBySessionId' return type */
export interface IGetProgressReportInfoBySessionIdResult {
  createdAt: Date;
  id: string;
  readAt: Date | null;
  status: string;
}

/** 'GetProgressReportInfoBySessionId' query type */
export interface IGetProgressReportInfoBySessionIdQuery {
  params: IGetProgressReportInfoBySessionIdParams;
  result: IGetProgressReportInfoBySessionIdResult;
}

const getProgressReportInfoBySessionIdIR: any = {"usedParamSet":{"userId":true,"sessionId":true,"analysisType":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":612,"b":619}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":643,"b":653}]},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"locs":[{"a":701,"b":714}]}],"statement":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status,\n    progress_reports.created_at,\n    progress_reports.read_at\nFROM\n    progress_reports\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\n    LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND sessions.id = :sessionId!\n    AND progress_report_analysis_types.name = :analysisType!\nORDER BY\n    progress_reports.created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_reports.id,
 *     progress_report_statuses.name AS status,
 *     progress_reports.created_at,
 *     progress_reports.read_at
 * FROM
 *     progress_reports
 *     JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
 *     JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
 *     JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
 *     LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id
 * WHERE
 *     progress_reports.user_id = :userId!
 *     AND sessions.id = :sessionId!
 *     AND progress_report_analysis_types.name = :analysisType!
 * ORDER BY
 *     progress_reports.created_at DESC
 * ```
 */
export const getProgressReportInfoBySessionId = new PreparedQuery<IGetProgressReportInfoBySessionIdParams,IGetProgressReportInfoBySessionIdResult>(getProgressReportInfoBySessionIdIR);


/** 'GetProgressReportByReportId' parameters type */
export interface IGetProgressReportByReportIdParams {
  reportId: string;
}

/** 'GetProgressReportByReportId' return type */
export interface IGetProgressReportByReportIdResult {
  createdAt: Date;
  id: string;
  readAt: Date | null;
  status: string;
}

/** 'GetProgressReportByReportId' query type */
export interface IGetProgressReportByReportIdQuery {
  params: IGetProgressReportByReportIdParams;
  result: IGetProgressReportByReportIdResult;
}

const getProgressReportByReportIdIR: any = {"usedParamSet":{"reportId":true},"params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"locs":[{"a":291,"b":300}]}],"statement":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status,\n    progress_reports.created_at,\n    progress_reports.read_at\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\nWHERE\n    progress_reports.id = :reportId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_reports.id,
 *     progress_report_statuses.name AS status,
 *     progress_reports.created_at,
 *     progress_reports.read_at
 * FROM
 *     progress_reports
 *     JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
 * WHERE
 *     progress_reports.id = :reportId!
 * ```
 */
export const getProgressReportByReportId = new PreparedQuery<IGetProgressReportByReportIdParams,IGetProgressReportByReportIdResult>(getProgressReportByReportIdIR);


/** 'GetProgressReportSummariesForMany' parameters type */
export interface IGetProgressReportSummariesForManyParams {
  reportIds: stringArray;
}

/** 'GetProgressReportSummariesForMany' return type */
export interface IGetProgressReportSummariesForManyResult {
  content: string;
  createdAt: Date;
  detailId: string;
  focusArea: string;
  id: string;
  infoType: string;
  overallGrade: number;
  reportId: string;
  reportReadAt: Date | null;
  sessionCreatedAt: Date | null;
  summary: string;
}

/** 'GetProgressReportSummariesForMany' query type */
export interface IGetProgressReportSummariesForManyQuery {
  params: IGetProgressReportSummariesForManyParams;
  result: IGetProgressReportSummariesForManyResult;
}

const getProgressReportSummariesForManyIR: any = {"usedParamSet":{"reportIds":true},"params":[{"name":"reportIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":1458,"b":1468},{"a":1708,"b":1718}]}],"statement":"SELECT\n    progress_report_summaries.id,\n    progress_report_summaries.summary,\n    progress_report_summaries.overall_grade,\n    progress_report_summary_details.id AS detail_id,\n    progress_report_summary_details.content,\n    progress_report_focus_areas.name AS focus_area,\n    progress_report_info_types.name AS info_type,\n    progress_report_summaries.progress_report_id AS report_id,\n    progress_reports.read_at AS report_read_at,\n    progress_report_summaries.created_at,\n    latest_session_for_summary.created_at AS session_created_at\nFROM\n    progress_report_summaries\n    JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id\n    JOIN progress_report_info_types ON progress_report_summary_details.progress_report_info_type_id = progress_report_info_types.id\n    JOIN progress_report_focus_areas ON progress_report_summary_details.progress_report_focus_area_id = progress_report_focus_areas.id\n    JOIN progress_reports ON progress_report_summaries.progress_report_id = progress_reports.id\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN (\n        SELECT\n            progress_report_id,\n            MAX(sessions.created_at) AS created_at\n        FROM\n            progress_report_sessions\n            JOIN sessions ON progress_report_sessions.session_id = sessions.id\n        WHERE\n            progress_report_id = ANY (:reportIds!)\n        GROUP BY\n            progress_report_id) AS latest_session_for_summary ON progress_report_summaries.progress_report_id = latest_session_for_summary.progress_report_id\nWHERE\n    progress_report_summaries.progress_report_id = ANY (:reportIds!)\n    AND progress_report_statuses.name = 'complete'\nORDER BY\n    progress_report_summaries.created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_report_summaries.id,
 *     progress_report_summaries.summary,
 *     progress_report_summaries.overall_grade,
 *     progress_report_summary_details.id AS detail_id,
 *     progress_report_summary_details.content,
 *     progress_report_focus_areas.name AS focus_area,
 *     progress_report_info_types.name AS info_type,
 *     progress_report_summaries.progress_report_id AS report_id,
 *     progress_reports.read_at AS report_read_at,
 *     progress_report_summaries.created_at,
 *     latest_session_for_summary.created_at AS session_created_at
 * FROM
 *     progress_report_summaries
 *     JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id
 *     JOIN progress_report_info_types ON progress_report_summary_details.progress_report_info_type_id = progress_report_info_types.id
 *     JOIN progress_report_focus_areas ON progress_report_summary_details.progress_report_focus_area_id = progress_report_focus_areas.id
 *     JOIN progress_reports ON progress_report_summaries.progress_report_id = progress_reports.id
 *     JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id
 *     JOIN (
 *         SELECT
 *             progress_report_id,
 *             MAX(sessions.created_at) AS created_at
 *         FROM
 *             progress_report_sessions
 *             JOIN sessions ON progress_report_sessions.session_id = sessions.id
 *         WHERE
 *             progress_report_id = ANY (:reportIds!)
 *         GROUP BY
 *             progress_report_id) AS latest_session_for_summary ON progress_report_summaries.progress_report_id = latest_session_for_summary.progress_report_id
 * WHERE
 *     progress_report_summaries.progress_report_id = ANY (:reportIds!)
 *     AND progress_report_statuses.name = 'complete'
 * ORDER BY
 *     progress_report_summaries.created_at DESC
 * ```
 */
export const getProgressReportSummariesForMany = new PreparedQuery<IGetProgressReportSummariesForManyParams,IGetProgressReportSummariesForManyResult>(getProgressReportSummariesForManyIR);


/** 'GetProgressReportConceptsByReportId' parameters type */
export interface IGetProgressReportConceptsByReportIdParams {
  reportId?: string | null | void;
}

/** 'GetProgressReportConceptsByReportId' return type */
export interface IGetProgressReportConceptsByReportIdResult {
  content: string;
  createdAt: Date;
  description: string;
  detailId: string;
  focusArea: string;
  grade: number;
  id: string;
  infoType: string;
  name: string;
  reportId: string;
  reportReadAt: Date | null;
}

/** 'GetProgressReportConceptsByReportId' query type */
export interface IGetProgressReportConceptsByReportIdQuery {
  params: IGetProgressReportConceptsByReportIdParams;
  result: IGetProgressReportConceptsByReportIdResult;
}

const getProgressReportConceptsByReportIdIR: any = {"usedParamSet":{"reportId":true},"params":[{"name":"reportId","required":false,"transform":{"type":"scalar"},"locs":[{"a":1182,"b":1190}]}],"statement":"SELECT\n    progress_report_concepts.id,\n    progress_report_concepts.name,\n    progress_report_concepts.description,\n    progress_report_concepts.grade,\n    progress_report_concept_details.id AS detail_id,\n    progress_report_concept_details.content,\n    progress_report_focus_areas.name AS focus_area,\n    progress_report_info_types.name AS info_type,\n    progress_report_concepts.progress_report_id AS report_id,\n    progress_reports.read_at AS report_read_at,\n    progress_report_concepts.created_at\nFROM\n    progress_report_concepts\n    JOIN progress_report_concept_details ON progress_report_concepts.id = progress_report_concept_details.progress_report_concept_id\n    JOIN progress_report_focus_areas ON progress_report_concept_details.progress_report_focus_area_id = progress_report_focus_areas.id\n    JOIN progress_report_info_types ON progress_report_concept_details.progress_report_info_type_id = progress_report_info_types.id\n    JOIN progress_reports ON progress_report_concepts.progress_report_id = progress_reports.id\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\nWHERE\n    progress_report_concepts.progress_report_id = :reportId\n    AND progress_report_statuses.name = 'complete'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_report_concepts.id,
 *     progress_report_concepts.name,
 *     progress_report_concepts.description,
 *     progress_report_concepts.grade,
 *     progress_report_concept_details.id AS detail_id,
 *     progress_report_concept_details.content,
 *     progress_report_focus_areas.name AS focus_area,
 *     progress_report_info_types.name AS info_type,
 *     progress_report_concepts.progress_report_id AS report_id,
 *     progress_reports.read_at AS report_read_at,
 *     progress_report_concepts.created_at
 * FROM
 *     progress_report_concepts
 *     JOIN progress_report_concept_details ON progress_report_concepts.id = progress_report_concept_details.progress_report_concept_id
 *     JOIN progress_report_focus_areas ON progress_report_concept_details.progress_report_focus_area_id = progress_report_focus_areas.id
 *     JOIN progress_report_info_types ON progress_report_concept_details.progress_report_info_type_id = progress_report_info_types.id
 *     JOIN progress_reports ON progress_report_concepts.progress_report_id = progress_reports.id
 *     JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id
 * WHERE
 *     progress_report_concepts.progress_report_id = :reportId
 *     AND progress_report_statuses.name = 'complete'
 * ```
 */
export const getProgressReportConceptsByReportId = new PreparedQuery<IGetProgressReportConceptsByReportIdParams,IGetProgressReportConceptsByReportIdResult>(getProgressReportConceptsByReportIdIR);


/** 'GetProgressReportSessionsForSubjectByPagination' parameters type */
export interface IGetProgressReportSessionsForSubjectByPaginationParams {
  analysisType: string;
  limit: number;
  offset: number;
  subject: string;
  userId: string;
}

/** 'GetProgressReportSessionsForSubjectByPagination' return type */
export interface IGetProgressReportSessionsForSubjectByPaginationResult {
  createdAt: Date;
  id: string;
  subject: string;
  topic: string;
  topicIconLink: string | null;
}

/** 'GetProgressReportSessionsForSubjectByPagination' query type */
export interface IGetProgressReportSessionsForSubjectByPaginationQuery {
  params: IGetProgressReportSessionsForSubjectByPaginationParams;
  result: IGetProgressReportSessionsForSubjectByPaginationResult;
}

const getProgressReportSessionsForSubjectByPaginationIR: any = {"usedParamSet":{"userId":true,"subject":true,"analysisType":true,"limit":true,"offset":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":739,"b":746}]},{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":772,"b":780}]},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"locs":[{"a":828,"b":841}]},{"name":"limit","required":true,"transform":{"type":"scalar"},"locs":[{"a":1108,"b":1114}]},{"name":"offset","required":true,"transform":{"type":"scalar"},"locs":[{"a":1130,"b":1137}]}],"statement":"SELECT\n    sessions.id,\n    sessions.created_at AS created_at,\n    subjects.display_name AS subject,\n    topics.name AS topic,\n    topics.icon_link AS topic_icon_link\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN sessions ON progress_report_sessions.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\n    JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    progress_reports.user_id = :userId!\n    AND subjects.name = :subject!\n    AND progress_report_analysis_types.name = :analysisType!\n    AND progress_report_statuses.name = 'complete'\n    AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\n    AND NOW()\nGROUP BY\n    sessions.id,\n    subjects.display_name,\n    topics.name,\n    topics.icon_link\nORDER BY\n    sessions.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     sessions.id,
 *     sessions.created_at AS created_at,
 *     subjects.display_name AS subject,
 *     topics.name AS topic,
 *     topics.icon_link AS topic_icon_link
 * FROM
 *     progress_reports
 *     JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id
 *     JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
 *     JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
 *     JOIN sessions ON progress_report_sessions.session_id = sessions.id
 *     JOIN subjects ON sessions.subject_id = subjects.id
 *     JOIN topics ON topics.id = subjects.topic_id
 * WHERE
 *     progress_reports.user_id = :userId!
 *     AND subjects.name = :subject!
 *     AND progress_report_analysis_types.name = :analysisType!
 *     AND progress_report_statuses.name = 'complete'
 *     AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')
 *     AND NOW()
 * GROUP BY
 *     sessions.id,
 *     subjects.display_name,
 *     topics.name,
 *     topics.icon_link
 * ORDER BY
 *     sessions.created_at DESC
 * LIMIT (:limit!)::int OFFSET (:offset!)::int
 * ```
 */
export const getProgressReportSessionsForSubjectByPagination = new PreparedQuery<IGetProgressReportSessionsForSubjectByPaginationParams,IGetProgressReportSessionsForSubjectByPaginationResult>(getProgressReportSessionsForSubjectByPaginationIR);


/** 'GetAllProgressReportIdsByUserIdAndSubject' parameters type */
export interface IGetAllProgressReportIdsByUserIdAndSubjectParams {
  analysisType: string;
  subject: string;
  userId: string;
}

/** 'GetAllProgressReportIdsByUserIdAndSubject' return type */
export interface IGetAllProgressReportIdsByUserIdAndSubjectResult {
  id: string;
}

/** 'GetAllProgressReportIdsByUserIdAndSubject' query type */
export interface IGetAllProgressReportIdsByUserIdAndSubjectQuery {
  params: IGetAllProgressReportIdsByUserIdAndSubjectParams;
  result: IGetAllProgressReportIdsByUserIdAndSubjectResult;
}

const getAllProgressReportIdsByUserIdAndSubjectIR: any = {"usedParamSet":{"userId":true,"subject":true,"analysisType":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1011,"b":1018}]},{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":1048,"b":1056}]},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"locs":[{"a":1108,"b":1121}]}],"statement":"SELECT\n    grouped_reports.id\nFROM (\n    SELECT\n        progress_reports.id,\n        progress_reports.created_at,\n        STRING_AGG(progress_report_sessions.session_id::text, ',' ORDER BY progress_report_sessions.session_id) AS session_group,\n        ROW_NUMBER() OVER (PARTITION BY STRING_AGG(progress_report_sessions.session_id::text, ',' ORDER BY progress_report_sessions.session_id) ORDER BY progress_reports.created_at DESC) AS row_num\n    FROM\n        progress_reports\n        JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n        JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n        JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n        LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id\n        LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    WHERE\n        progress_reports.user_id = :userId!\n        AND subjects.name = :subject!\n        AND progress_report_analysis_types.name = :analysisType!\n        AND progress_report_statuses.name = 'complete'\n    GROUP BY\n        progress_reports.id,\n        progress_reports.created_at) AS grouped_reports\nWHERE\n    grouped_reports.row_num = 1\nORDER BY\n    grouped_reports.created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     grouped_reports.id
 * FROM (
 *     SELECT
 *         progress_reports.id,
 *         progress_reports.created_at,
 *         STRING_AGG(progress_report_sessions.session_id::text, ',' ORDER BY progress_report_sessions.session_id) AS session_group,
 *         ROW_NUMBER() OVER (PARTITION BY STRING_AGG(progress_report_sessions.session_id::text, ',' ORDER BY progress_report_sessions.session_id) ORDER BY progress_reports.created_at DESC) AS row_num
 *     FROM
 *         progress_reports
 *         JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
 *         JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id
 *         JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
 *         LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id
 *         LEFT JOIN subjects ON sessions.subject_id = subjects.id
 *     WHERE
 *         progress_reports.user_id = :userId!
 *         AND subjects.name = :subject!
 *         AND progress_report_analysis_types.name = :analysisType!
 *         AND progress_report_statuses.name = 'complete'
 *     GROUP BY
 *         progress_reports.id,
 *         progress_reports.created_at) AS grouped_reports
 * WHERE
 *     grouped_reports.row_num = 1
 * ORDER BY
 *     grouped_reports.created_at DESC
 * ```
 */
export const getAllProgressReportIdsByUserIdAndSubject = new PreparedQuery<IGetAllProgressReportIdsByUserIdAndSubjectParams,IGetAllProgressReportIdsByUserIdAndSubjectResult>(getAllProgressReportIdsByUserIdAndSubjectIR);


/** 'GetLatestProgressReportIdBySubject' parameters type */
export interface IGetLatestProgressReportIdBySubjectParams {
  analysisType: string;
  subject: string;
  userId: string;
}

/** 'GetLatestProgressReportIdBySubject' return type */
export interface IGetLatestProgressReportIdBySubjectResult {
  createdAt: Date;
  id: string;
  readAt: Date | null;
  status: string;
}

/** 'GetLatestProgressReportIdBySubject' query type */
export interface IGetLatestProgressReportIdBySubjectQuery {
  params: IGetLatestProgressReportIdBySubjectParams;
  result: IGetLatestProgressReportIdBySubjectResult;
}

const getLatestProgressReportIdBySubjectIR: any = {"usedParamSet":{"userId":true,"subject":true,"analysisType":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":662,"b":669}]},{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":695,"b":703}]},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"locs":[{"a":751,"b":764}]}],"statement":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status,\n    progress_reports.created_at,\n    progress_reports.read_at\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN sessions ON progress_report_sessions.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND subjects.name = :subject!\n    AND progress_report_analysis_types.name = :analysisType!\n    AND progress_report_statuses.name = 'complete'\nORDER BY\n    progress_reports.created_at DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_reports.id,
 *     progress_report_statuses.name AS status,
 *     progress_reports.created_at,
 *     progress_reports.read_at
 * FROM
 *     progress_reports
 *     JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id
 *     JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
 *     JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
 *     JOIN sessions ON progress_report_sessions.session_id = sessions.id
 *     JOIN subjects ON sessions.subject_id = subjects.id
 * WHERE
 *     progress_reports.user_id = :userId!
 *     AND subjects.name = :subject!
 *     AND progress_report_analysis_types.name = :analysisType!
 *     AND progress_report_statuses.name = 'complete'
 * ORDER BY
 *     progress_reports.created_at DESC
 * LIMIT 1
 * ```
 */
export const getLatestProgressReportIdBySubject = new PreparedQuery<IGetLatestProgressReportIdBySubjectParams,IGetLatestProgressReportIdBySubjectResult>(getLatestProgressReportIdBySubjectIR);


/** 'UpdateProgressReportsReadAtByReportIds' parameters type */
export interface IUpdateProgressReportsReadAtByReportIdsParams {
  reportIds: stringArray;
}

/** 'UpdateProgressReportsReadAtByReportIds' return type */
export interface IUpdateProgressReportsReadAtByReportIdsResult {
  ok: string;
}

/** 'UpdateProgressReportsReadAtByReportIds' query type */
export interface IUpdateProgressReportsReadAtByReportIdsQuery {
  params: IUpdateProgressReportsReadAtByReportIdsParams;
  result: IUpdateProgressReportsReadAtByReportIdsResult;
}

const updateProgressReportsReadAtByReportIdsIR: any = {"usedParamSet":{"reportIds":true},"params":[{"name":"reportIds","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":123}]}],"statement":"UPDATE\n    progress_reports\nSET\n    read_at = NOW(),\n    updated_at = NOW()\nWHERE\n    progress_reports.id = ANY (:reportIds!)\nRETURNING\n    progress_reports.id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     progress_reports
 * SET
 *     read_at = NOW(),
 *     updated_at = NOW()
 * WHERE
 *     progress_reports.id = ANY (:reportIds!)
 * RETURNING
 *     progress_reports.id AS ok
 * ```
 */
export const updateProgressReportsReadAtByReportIds = new PreparedQuery<IUpdateProgressReportsReadAtByReportIdsParams,IUpdateProgressReportsReadAtByReportIdsResult>(updateProgressReportsReadAtByReportIdsIR);


/** 'GetProgressReportOverviewUnreadStatsByUserId' parameters type */
export interface IGetProgressReportOverviewUnreadStatsByUserIdParams {
  userId: string;
}

/** 'GetProgressReportOverviewUnreadStatsByUserId' return type */
export interface IGetProgressReportOverviewUnreadStatsByUserIdResult {
  subject: string;
  totalUnreadReports: number | null;
}

/** 'GetProgressReportOverviewUnreadStatsByUserId' query type */
export interface IGetProgressReportOverviewUnreadStatsByUserIdQuery {
  params: IGetProgressReportOverviewUnreadStatsByUserIdParams;
  result: IGetProgressReportOverviewUnreadStatsByUserIdResult;
}

const getProgressReportOverviewUnreadStatsByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":701,"b":708}]}],"statement":"SELECT\n    subjects.name AS subject,\n    COUNT(DISTINCT CASE WHEN progress_reports.read_at IS NULL THEN\n            progress_reports.id\n        END)::int AS total_unread_reports\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN sessions ON progress_report_sessions.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND progress_report_analysis_types.name = 'group'\n    AND progress_report_statuses.name = 'complete'\nGROUP BY\n    subjects.name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name AS subject,
 *     COUNT(DISTINCT CASE WHEN progress_reports.read_at IS NULL THEN
 *             progress_reports.id
 *         END)::int AS total_unread_reports
 * FROM
 *     progress_reports
 *     JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id
 *     JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
 *     JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
 *     JOIN sessions ON progress_report_sessions.session_id = sessions.id
 *     JOIN subjects ON sessions.subject_id = subjects.id
 * WHERE
 *     progress_reports.user_id = :userId!
 *     AND progress_report_analysis_types.name = 'group'
 *     AND progress_report_statuses.name = 'complete'
 * GROUP BY
 *     subjects.name
 * ```
 */
export const getProgressReportOverviewUnreadStatsByUserId = new PreparedQuery<IGetProgressReportOverviewUnreadStatsByUserIdParams,IGetProgressReportOverviewUnreadStatsByUserIdResult>(getProgressReportOverviewUnreadStatsByUserIdIR);


/** 'GetLatestProgressReportOverviewSubjectByUserId' parameters type */
export interface IGetLatestProgressReportOverviewSubjectByUserIdParams {
  userId: string;
}

/** 'GetLatestProgressReportOverviewSubjectByUserId' return type */
export interface IGetLatestProgressReportOverviewSubjectByUserIdResult {
  name: string;
}

/** 'GetLatestProgressReportOverviewSubjectByUserId' query type */
export interface IGetLatestProgressReportOverviewSubjectByUserIdQuery {
  params: IGetLatestProgressReportOverviewSubjectByUserIdParams;
  result: IGetLatestProgressReportOverviewSubjectByUserIdResult;
}

const getLatestProgressReportOverviewSubjectByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":533,"b":540},{"a":969,"b":976}]}],"statement":"SELECT\n    subjects.name\nFROM\n    progress_reports\n    JOIN (\n        SELECT\n            progress_report_sessions.progress_report_id,\n            progress_report_sessions.session_id\n        FROM\n            progress_report_sessions\n            JOIN progress_reports ON progress_report_sessions.progress_report_id = progress_reports.id\n            JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n        WHERE\n            progress_reports.user_id = :userId!\n            AND progress_report_analysis_types.name = 'group'\n        ORDER BY\n            progress_report_sessions.created_at DESC\n        LIMIT 1) AS latest_progress_report_session ON progress_reports.id = latest_progress_report_session.progress_report_id\n    JOIN sessions ON latest_progress_report_session.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    progress_reports.user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name
 * FROM
 *     progress_reports
 *     JOIN (
 *         SELECT
 *             progress_report_sessions.progress_report_id,
 *             progress_report_sessions.session_id
 *         FROM
 *             progress_report_sessions
 *             JOIN progress_reports ON progress_report_sessions.progress_report_id = progress_reports.id
 *             JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
 *         WHERE
 *             progress_reports.user_id = :userId!
 *             AND progress_report_analysis_types.name = 'group'
 *         ORDER BY
 *             progress_report_sessions.created_at DESC
 *         LIMIT 1) AS latest_progress_report_session ON progress_reports.id = latest_progress_report_session.progress_report_id
 *     JOIN sessions ON latest_progress_report_session.session_id = sessions.id
 *     JOIN subjects ON sessions.subject_id = subjects.id
 * WHERE
 *     progress_reports.user_id = :userId!
 * ```
 */
export const getLatestProgressReportOverviewSubjectByUserId = new PreparedQuery<IGetLatestProgressReportOverviewSubjectByUserIdParams,IGetLatestProgressReportOverviewSubjectByUserIdResult>(getLatestProgressReportOverviewSubjectByUserIdIR);


/** 'GetActiveSubjectPromptBySubjectName' parameters type */
export interface IGetActiveSubjectPromptBySubjectNameParams {
  subject: string;
}

/** 'GetActiveSubjectPromptBySubjectName' return type */
export interface IGetActiveSubjectPromptBySubjectNameResult {
  id: number;
  prompt: string;
}

/** 'GetActiveSubjectPromptBySubjectName' query type */
export interface IGetActiveSubjectPromptBySubjectNameQuery {
  params: IGetActiveSubjectPromptBySubjectNameParams;
  result: IGetActiveSubjectPromptBySubjectNameResult;
}

const getActiveSubjectPromptBySubjectNameIR: any = {"usedParamSet":{"subject":true},"params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"locs":[{"a":179,"b":187}]}],"statement":"SELECT\n    progress_report_prompts.id,\n    prompt\nFROM\n    progress_report_prompts\n    JOIN subjects ON progress_report_prompts.subject_id = subjects.id\nWHERE\n    subjects.name = :subject!\n    AND progress_report_prompts.active IS TRUE"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_report_prompts.id,
 *     prompt
 * FROM
 *     progress_report_prompts
 *     JOIN subjects ON progress_report_prompts.subject_id = subjects.id
 * WHERE
 *     subjects.name = :subject!
 *     AND progress_report_prompts.active IS TRUE
 * ```
 */
export const getActiveSubjectPromptBySubjectName = new PreparedQuery<IGetActiveSubjectPromptBySubjectNameParams,IGetActiveSubjectPromptBySubjectNameResult>(getActiveSubjectPromptBySubjectNameIR);


