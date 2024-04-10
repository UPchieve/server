/** Types generated for queries found in "server/models/ProgressReports/progress_reports.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'InsertProgressReport' parameters type */
export interface IInsertProgressReportParams {
  id: string;
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

const insertProgressReportIR: any = {"name":"insertProgressReport","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":99,"b":101,"line":4,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":109,"b":115,"line":5,"col":5}]}},{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":231,"b":237,"line":13,"col":16}]}}],"usedParamSet":{"id":true,"userId":true,"status":true},"statement":{"body":"INSERT INTO progress_reports (id, user_id, status_id)\nSELECT\n    :id!,\n    :userId!,\n    subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nRETURNING\n    id","loc":{"a":33,"b":267,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_reports (id, user_id, status_id)
 * SELECT
 *     :id!,
 *     :userId!,
 *     subquery.id
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

const insertProgressReportSessionIR: any = {"name":"insertProgressReportSession","params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":428,"b":436,"line":21,"col":5}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":444,"b":453,"line":22,"col":5}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":575,"b":587,"line":30,"col":16}]}}],"usedParamSet":{"reportId":true,"sessionId":true,"analysisType":true},"statement":{"body":"INSERT INTO progress_report_sessions (progress_report_id, session_id, progress_report_analysis_type_id)\nSELECT\n    :reportId!,\n    :sessionId!,\n    subquery.id\nFROM (\n    SELECT\n        id\n    FROM\n        progress_report_analysis_types\n    WHERE\n        name = :analysisType!) AS subquery\nRETURNING\n    progress_report_id AS ok","loc":{"a":312,"b":639,"line":19,"col":0}}};

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

const insertProgressReportSummaryIR: any = {"name":"insertProgressReportSummary","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":784,"b":786,"line":37,"col":13}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":790,"b":798,"line":37,"col":19}]}},{"name":"summary","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":802,"b":809,"line":37,"col":31}]}},{"name":"overallGrade","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":813,"b":825,"line":37,"col":42}]}}],"usedParamSet":{"id":true,"reportId":true,"summary":true,"overallGrade":true},"statement":{"body":"INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)\n    VALUES (:id!, :reportId!, :summary!, :overallGrade!)\nRETURNING\n    id","loc":{"a":684,"b":843,"line":36,"col":0}}};

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

const insertProgressReportConceptIR: any = {"name":"InsertProgressReportConcept","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":989,"b":991,"line":44,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":995,"b":999,"line":44,"col":19}]}},{"name":"description","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1003,"b":1014,"line":44,"col":27}]}},{"name":"grade","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1018,"b":1023,"line":44,"col":42}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1027,"b":1035,"line":44,"col":51}]}}],"usedParamSet":{"id":true,"name":true,"description":true,"grade":true,"reportId":true},"statement":{"body":"INSERT INTO progress_report_concepts (id, name, description, grade, progress_report_id)\n    VALUES (:id!, :name!, :description!, :grade!, :reportId!)\nRETURNING\n    id","loc":{"a":888,"b":1053,"line":43,"col":0}}};

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

const insertProgressReportSummaryDetailIR: any = {"name":"insertProgressReportSummaryDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1263,"b":1265,"line":52,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1273,"b":1280,"line":53,"col":5}]}},{"name":"reportSummaryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1288,"b":1303,"line":54,"col":5}]}},{"name":"focusArea","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1429,"b":1438,"line":61,"col":20}]}},{"name":"infoType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1560,"b":1568,"line":67,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportSummaryId":true,"focusArea":true,"infoType":true},"statement":{"body":"INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_focus_area_id, progress_report_info_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportSummaryId!,\n    (\n        SELECT\n            id\n        FROM\n            progress_report_focus_areas\n        WHERE\n            name = :focusArea!), (\n        SELECT\n            id\n        FROM\n            progress_report_info_types\n        WHERE\n            name = :infoType!)\nRETURNING\n    id","loc":{"a":1104,"b":1586,"line":50,"col":0}}};

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

const insertProgressReportConceptDetailIR: any = {"name":"insertProgressReportConceptDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1796,"b":1798,"line":75,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1806,"b":1813,"line":76,"col":5}]}},{"name":"reportConceptId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1821,"b":1836,"line":77,"col":5}]}},{"name":"focusArea","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1962,"b":1971,"line":84,"col":20}]}},{"name":"infoType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2093,"b":2101,"line":90,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportConceptId":true,"focusArea":true,"infoType":true},"statement":{"body":"INSERT INTO progress_report_concept_details (id, content, progress_report_concept_id, progress_report_focus_area_id, progress_report_info_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportConceptId!,\n    (\n        SELECT\n            id\n        FROM\n            progress_report_focus_areas\n        WHERE\n            name = :focusArea!), (\n        SELECT\n            id\n        FROM\n            progress_report_info_types\n        WHERE\n            name = :infoType!)\nRETURNING\n    id","loc":{"a":1637,"b":2119,"line":73,"col":0}}};

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

const updateProgressReportStatusIR: any = {"name":"updateProgressReportStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2344,"b":2350,"line":107,"col":16}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2398,"b":2406,"line":109,"col":27}]}}],"usedParamSet":{"status":true,"reportId":true},"statement":{"body":"UPDATE\n    progress_reports\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    progress_reports.id = :reportId!\nRETURNING\n    progress_reports.id AS ok","loc":{"a":2163,"b":2446,"line":96,"col":0}}};

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

const getProgressReportInfoBySessionIdIR: any = {"name":"getProgressReportInfoBySessionId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3109,"b":3115,"line":127,"col":32}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3140,"b":3149,"line":128,"col":23}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3198,"b":3210,"line":129,"col":47}]}}],"usedParamSet":{"userId":true,"sessionId":true,"analysisType":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status,\n    progress_reports.created_at,\n    progress_reports.read_at\nFROM\n    progress_reports\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\n    LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND sessions.id = :sessionId!\n    AND progress_report_analysis_types.name = :analysisType!\nORDER BY\n    progress_reports.created_at DESC","loc":{"a":2496,"b":3256,"line":115,"col":0}}};

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

const getProgressReportByReportIdIR: any = {"name":"getProgressReportByReportId","params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3593,"b":3601,"line":144,"col":27}]}}],"usedParamSet":{"reportId":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status,\n    progress_reports.created_at,\n    progress_reports.read_at\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\nWHERE\n    progress_reports.id = :reportId!","loc":{"a":3301,"b":3601,"line":135,"col":0}}};

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

const getProgressReportSummariesForManyIR: any = {"name":"getProgressReportSummariesForMany","params":[{"name":"reportIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5296,"b":5305,"line":177,"col":57}]}}],"usedParamSet":{"reportIds":true},"statement":{"body":"SELECT\n    progress_report_summaries.id,\n    progress_report_summaries.summary,\n    progress_report_summaries.overall_grade,\n    progress_report_summary_details.id AS detail_id,\n    progress_report_summary_details.content,\n    progress_report_focus_areas.name AS focus_area,\n    progress_report_info_types.name AS info_type,\n    progress_report_summaries.progress_report_id AS report_id,\n    progress_reports.read_at AS report_read_at,\n    progress_report_summaries.created_at,\n    latest_session_for_summary.created_at AS session_created_at\nFROM\n    progress_report_summaries\n    JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id\n    JOIN progress_report_info_types ON progress_report_summary_details.progress_report_info_type_id = progress_report_info_types.id\n    JOIN progress_report_focus_areas ON progress_report_summary_details.progress_report_focus_area_id = progress_report_focus_areas.id\n    JOIN progress_reports ON progress_report_summaries.progress_report_id = progress_reports.id\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN (\n        SELECT\n            progress_report_id,\n            MAX(sessions.created_at) AS created_at\n        FROM\n            progress_report_sessions\n            JOIN sessions ON progress_report_sessions.session_id = sessions.id\n        GROUP BY\n            progress_report_id) AS latest_session_for_summary ON progress_report_summaries.progress_report_id = latest_session_for_summary.progress_report_id\nWHERE\n    progress_report_summaries.progress_report_id = ANY (:reportIds!)\n    AND progress_report_statuses.name = 'complete'\nORDER BY\n    progress_report_summaries.created_at DESC","loc":{"a":3652,"b":5412,"line":148,"col":0}}};

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
  reportId: string | null | void;
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

const getProgressReportConceptsByReportIdIR: any = {"name":"getProgressReportConceptsByReportId","params":[{"name":"reportId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":6648,"b":6655,"line":204,"col":51}]}}],"usedParamSet":{"reportId":true},"statement":{"body":"SELECT\n    progress_report_concepts.id,\n    progress_report_concepts.name,\n    progress_report_concepts.description,\n    progress_report_concepts.grade,\n    progress_report_concept_details.id AS detail_id,\n    progress_report_concept_details.content,\n    progress_report_focus_areas.name AS focus_area,\n    progress_report_info_types.name AS info_type,\n    progress_report_concepts.progress_report_id AS report_id,\n    progress_reports.read_at AS report_read_at,\n    progress_report_concepts.created_at\nFROM\n    progress_report_concepts\n    JOIN progress_report_concept_details ON progress_report_concepts.id = progress_report_concept_details.progress_report_concept_id\n    JOIN progress_report_focus_areas ON progress_report_concept_details.progress_report_focus_area_id = progress_report_focus_areas.id\n    JOIN progress_report_info_types ON progress_report_concept_details.progress_report_info_type_id = progress_report_info_types.id\n    JOIN progress_reports ON progress_report_concepts.progress_report_id = progress_reports.id\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\nWHERE\n    progress_report_concepts.progress_report_id = :reportId\n    AND progress_report_statuses.name = 'complete'","loc":{"a":5465,"b":6706,"line":184,"col":0}}};

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

const getProgressReportSessionsForSubjectByPaginationIR: any = {"name":"getProgressReportSessionsForSubjectByPagination","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7511,"b":7517,"line":224,"col":32}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7544,"b":7551,"line":225,"col":25}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7600,"b":7612,"line":226,"col":47}]}},{"name":"limit","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7880,"b":7885,"line":237,"col":8}]}},{"name":"offset","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":7902,"b":7908,"line":237,"col":30}]}}],"usedParamSet":{"userId":true,"subject":true,"analysisType":true,"limit":true,"offset":true},"statement":{"body":"SELECT\n    sessions.id,\n    sessions.created_at AS created_at,\n    subjects.display_name AS subject,\n    topics.name AS topic,\n    topics.icon_link AS topic_icon_link\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN sessions ON progress_report_sessions.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\n    JOIN topics ON topics.id = subjects.topic_id\nWHERE\n    progress_reports.user_id = :userId!\n    AND subjects.name = :subject!\n    AND progress_report_analysis_types.name = :analysisType!\n    AND progress_report_statuses.name = 'complete'\n    AND sessions.created_at BETWEEN (NOW() - INTERVAL '1 YEAR')\n    AND NOW()\nGROUP BY\n    sessions.id,\n    subjects.display_name,\n    topics.name,\n    topics.icon_link\nORDER BY\n    sessions.created_at DESC\nLIMIT (:limit!)::int OFFSET (:offset!)::int","loc":{"a":6771,"b":7914,"line":209,"col":0}}};

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

const getAllProgressReportIdsByUserIdAndSubjectIR: any = {"name":"getAllProgressReportIdsByUserIdAndSubject","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":8985,"b":8991,"line":257,"col":36}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9022,"b":9029,"line":258,"col":29}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":9082,"b":9094,"line":259,"col":51}]}}],"usedParamSet":{"userId":true,"subject":true,"analysisType":true},"statement":{"body":"SELECT\n    grouped_reports.id\nFROM (\n    SELECT\n        progress_reports.id,\n        progress_reports.created_at,\n        STRING_AGG(progress_report_sessions.session_id::text, ',' ORDER BY progress_report_sessions.session_id) AS session_group,\n        ROW_NUMBER() OVER (PARTITION BY STRING_AGG(progress_report_sessions.session_id::text, ',' ORDER BY progress_report_sessions.session_id) ORDER BY progress_reports.created_at DESC) AS row_num\n    FROM\n        progress_reports\n        JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n        JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n        JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n        LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id\n        LEFT JOIN subjects ON sessions.subject_id = subjects.id\n    WHERE\n        progress_reports.user_id = :userId!\n        AND subjects.name = :subject!\n        AND progress_report_analysis_types.name = :analysisType!\n        AND progress_report_statuses.name = 'complete'\n    GROUP BY\n        progress_reports.id,\n        progress_reports.created_at) AS grouped_reports\nWHERE\n    grouped_reports.row_num = 1\nORDER BY\n    grouped_reports.created_at DESC","loc":{"a":7973,"b":9330,"line":241,"col":0}}};

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

const getLatestProgressReportIdBySubjectIR: any = {"name":"getLatestProgressReportIdBySubject","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10045,"b":10051,"line":284,"col":32}]}},{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10078,"b":10085,"line":285,"col":25}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10134,"b":10146,"line":286,"col":47}]}}],"usedParamSet":{"userId":true,"subject":true,"analysisType":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status,\n    progress_reports.created_at,\n    progress_reports.read_at\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN sessions ON progress_report_sessions.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND subjects.name = :subject!\n    AND progress_report_analysis_types.name = :analysisType!\n    AND progress_report_statuses.name = 'complete'\nORDER BY\n    progress_reports.created_at DESC\nLIMIT 1","loc":{"a":9382,"b":10251,"line":271,"col":0}}};

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

const updateProgressReportsReadAtByReportIdsIR: any = {"name":"updateProgressReportsReadAtByReportIds","params":[{"name":"reportIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":10421,"b":10430,"line":300,"col":32}]}}],"usedParamSet":{"reportIds":true},"statement":{"body":"UPDATE\n    progress_reports\nSET\n    read_at = NOW(),\n    updated_at = NOW()\nWHERE\n    progress_reports.id = ANY (:reportIds!)\nRETURNING\n    progress_reports.id AS ok","loc":{"a":10307,"b":10471,"line":294,"col":0}}};

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

const getProgressReportOverviewUnreadStatsByUserIdIR: any = {"name":"getProgressReportOverviewUnreadStatsByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11235,"b":11241,"line":319,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    subjects.name AS subject,\n    COUNT(DISTINCT CASE WHEN progress_reports.read_at IS NULL THEN\n            progress_reports.id\n        END)::int AS total_unread_reports\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN sessions ON progress_report_sessions.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND progress_report_analysis_types.name = 'group'\n    AND progress_report_statuses.name = 'complete'\nGROUP BY\n    subjects.name","loc":{"a":10533,"b":11373,"line":306,"col":0}}};

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

const getLatestProgressReportOverviewSubjectByUserIdIR: any = {"name":"getLatestProgressReportOverviewSubjectByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":11971,"b":11977,"line":340,"col":40},{"a":12407,"b":12413,"line":348,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    subjects.name\nFROM\n    progress_reports\n    JOIN (\n        SELECT\n            progress_report_sessions.progress_report_id,\n            progress_report_sessions.session_id\n        FROM\n            progress_report_sessions\n            JOIN progress_reports ON progress_report_sessions.progress_report_id = progress_reports.id\n            JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n        WHERE\n            progress_reports.user_id = :userId!\n            AND progress_report_analysis_types.name = 'group'\n        ORDER BY\n            progress_report_sessions.created_at DESC\n        LIMIT 1) AS latest_progress_report_session ON progress_reports.id = latest_progress_report_session.progress_report_id\n    JOIN sessions ON latest_progress_report_session.session_id = sessions.id\n    JOIN subjects ON sessions.subject_id = subjects.id\nWHERE\n    progress_reports.user_id = :userId!","loc":{"a":11437,"b":12413,"line":327,"col":0}}};

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


