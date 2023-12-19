/** Types generated for queries found in "server/models/ProgressReports/progress_reports.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const insertProgressReportSummaryIR: any = {"name":"insertProgressReportSummary","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":784,"b":786,"line":37,"col":13}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":790,"b":798,"line":37,"col":19}]}},{"name":"summary","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":802,"b":809,"line":37,"col":31},{"a":898,"b":905,"line":40,"col":19}]}},{"name":"overallGrade","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":813,"b":825,"line":37,"col":42},{"a":925,"b":937,"line":40,"col":46}]}}],"usedParamSet":{"id":true,"reportId":true,"summary":true,"overallGrade":true},"statement":{"body":"INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)\n    VALUES (:id!, :reportId!, :summary!, :overallGrade!)\nON CONFLICT (progress_report_id)\n    DO UPDATE SET\n        summary = :summary!, overall_grade = :overallGrade!\n    RETURNING\n        id","loc":{"a":684,"b":962,"line":36,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)
 *     VALUES (:id!, :reportId!, :summary!, :overallGrade!)
 * ON CONFLICT (progress_report_id)
 *     DO UPDATE SET
 *         summary = :summary!, overall_grade = :overallGrade!
 *     RETURNING
 *         id
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

const insertProgressReportConceptIR: any = {"name":"InsertProgressReportConcept","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1108,"b":1110,"line":47,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1114,"b":1118,"line":47,"col":19}]}},{"name":"description","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1122,"b":1133,"line":47,"col":27}]}},{"name":"grade","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1137,"b":1142,"line":47,"col":42}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1146,"b":1154,"line":47,"col":51}]}}],"usedParamSet":{"id":true,"name":true,"description":true,"grade":true,"reportId":true},"statement":{"body":"INSERT INTO progress_report_concepts (id, name, description, grade, progress_report_id)\n    VALUES (:id!, :name!, :description!, :grade!, :reportId!)\nRETURNING\n    id","loc":{"a":1007,"b":1172,"line":46,"col":0}}};

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

const insertProgressReportSummaryDetailIR: any = {"name":"insertProgressReportSummaryDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1382,"b":1384,"line":55,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1392,"b":1399,"line":56,"col":5}]}},{"name":"reportSummaryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1407,"b":1422,"line":57,"col":5}]}},{"name":"focusArea","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1557,"b":1566,"line":64,"col":20}]}},{"name":"infoType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1697,"b":1705,"line":70,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportSummaryId":true,"focusArea":true,"infoType":true},"statement":{"body":"INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_focus_area_id, progress_report_info_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportSummaryId!,\n    (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_focus_areas\n        WHERE\n            name = :focusArea!), (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_info_types\n        WHERE\n            name = :infoType!)\nRETURNING\n    id","loc":{"a":1223,"b":1723,"line":53,"col":0}}};

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
 *             upchieve.progress_report_focus_areas
 *         WHERE
 *             name = :focusArea!), (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_info_types
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

const insertProgressReportConceptDetailIR: any = {"name":"insertProgressReportConceptDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1933,"b":1935,"line":78,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1943,"b":1950,"line":79,"col":5}]}},{"name":"reportConceptId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1958,"b":1973,"line":80,"col":5}]}},{"name":"focusArea","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2108,"b":2117,"line":87,"col":20}]}},{"name":"infoType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2248,"b":2256,"line":93,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportConceptId":true,"focusArea":true,"infoType":true},"statement":{"body":"INSERT INTO progress_report_concept_details (id, content, progress_report_concept_id, progress_report_focus_area_id, progress_report_info_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportConceptId!,\n    (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_focus_areas\n        WHERE\n            name = :focusArea!), (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_info_types\n        WHERE\n            name = :infoType!)\nRETURNING\n    id","loc":{"a":1774,"b":2274,"line":76,"col":0}}};

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
 *             upchieve.progress_report_focus_areas
 *         WHERE
 *             name = :focusArea!), (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_info_types
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

const updateProgressReportStatusIR: any = {"name":"updateProgressReportStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2517,"b":2523,"line":110,"col":16}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2571,"b":2579,"line":112,"col":27}]}}],"usedParamSet":{"status":true,"reportId":true},"statement":{"body":"UPDATE\n    upchieve.progress_reports\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        upchieve.progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    progress_reports.id = :reportId!\nRETURNING\n    progress_reports.id AS ok","loc":{"a":2318,"b":2619,"line":99,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     upchieve.progress_reports
 * SET
 *     status_id = subquery.id,
 *     updated_at = NOW()
 * FROM (
 *     SELECT
 *         id
 *     FROM
 *         upchieve.progress_report_statuses
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
  id: string;
  status: string;
}

/** 'GetProgressReportInfoBySessionId' query type */
export interface IGetProgressReportInfoBySessionIdQuery {
  params: IGetProgressReportInfoBySessionIdParams;
  result: IGetProgressReportInfoBySessionIdResult;
}

const getProgressReportInfoBySessionIdIR: any = {"name":"getProgressReportInfoBySessionId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3219,"b":3225,"line":128,"col":32}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3250,"b":3259,"line":129,"col":23}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3308,"b":3320,"line":130,"col":47}]}}],"usedParamSet":{"userId":true,"sessionId":true,"analysisType":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status\nFROM\n    progress_reports\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\n    LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND sessions.id = :sessionId!\n    AND progress_report_analysis_types.name = :analysisType!\nORDER BY\n    progress_reports.created_at DESC","loc":{"a":2669,"b":3366,"line":118,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_reports.id,
 *     progress_report_statuses.name AS status
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
  id: string;
  status: string;
}

/** 'GetProgressReportByReportId' query type */
export interface IGetProgressReportByReportIdQuery {
  params: IGetProgressReportByReportIdParams;
  result: IGetProgressReportByReportIdResult;
}

const getProgressReportByReportIdIR: any = {"name":"getProgressReportByReportId","params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3640,"b":3648,"line":143,"col":27}]}}],"usedParamSet":{"reportId":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\nWHERE\n    progress_reports.id = :reportId!","loc":{"a":3411,"b":3648,"line":136,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_reports.id,
 *     progress_report_statuses.name AS status
 * FROM
 *     progress_reports
 *     JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
 * WHERE
 *     progress_reports.id = :reportId!
 * ```
 */
export const getProgressReportByReportId = new PreparedQuery<IGetProgressReportByReportIdParams,IGetProgressReportByReportIdResult>(getProgressReportByReportIdIR);


/** Query 'GetProgressReportSummariesForMany' is invalid, so its result is assigned type 'never' */
export type IGetProgressReportSummariesForManyResult = never;

/** Query 'GetProgressReportSummariesForMany' is invalid, so its parameters are assigned type 'never' */
export type IGetProgressReportSummariesForManyParams = never;

const getProgressReportSummariesForManyIR: any = {"name":"getProgressReportSummariesForMany","params":[{"name":"reportIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4654,"b":4663,"line":162,"col":57}]}}],"usedParamSet":{"reportIds":true},"statement":{"body":"SELECT\n    progress_report_summaries.id,\n    progress_report_summaries.summary,\n    progress_report_summaries.overall_grade,\n    progress_report_summary_details.id AS detail_id,\n    progress_report_summary_details.content,\n    progress_report_evaluation_types.name AS evaluation_type,\n    progress_report_evaluation_detail_types.name AS evaluation_detail_type,\n    progress_report_summaries.created_at\nFROM\n    progress_report_summaries\n    JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id\n    JOIN progress_report_evaluation_detail_types ON progress_report_summary_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id\n    JOIN progress_report_evaluation_types ON progress_report_summary_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id\nWHERE\n    progress_report_summaries.progress_report_id = ANY (:reportIds!)\nORDER BY\n    progress_report_summaries.created_at DESC","loc":{"a":3699,"b":4719,"line":147,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_report_summaries.id,
 *     progress_report_summaries.summary,
 *     progress_report_summaries.overall_grade,
 *     progress_report_summary_details.id AS detail_id,
 *     progress_report_summary_details.content,
 *     progress_report_evaluation_types.name AS evaluation_type,
 *     progress_report_evaluation_detail_types.name AS evaluation_detail_type,
 *     progress_report_summaries.created_at
 * FROM
 *     progress_report_summaries
 *     JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id
 *     JOIN progress_report_evaluation_detail_types ON progress_report_summary_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id
 *     JOIN progress_report_evaluation_types ON progress_report_summary_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id
 * WHERE
 *     progress_report_summaries.progress_report_id = ANY (:reportIds!)
 * ORDER BY
 *     progress_report_summaries.created_at DESC
 * ```
 */
export const getProgressReportSummariesForMany = new PreparedQuery<IGetProgressReportSummariesForManyParams,IGetProgressReportSummariesForManyResult>(getProgressReportSummariesForManyIR);


/** Query 'GetProgressReportTopicsByReportId' is invalid, so its result is assigned type 'never' */
export type IGetProgressReportTopicsByReportIdResult = never;

/** Query 'GetProgressReportTopicsByReportId' is invalid, so its parameters are assigned type 'never' */
export type IGetProgressReportTopicsByReportIdParams = never;

const getProgressReportTopicsByReportIdIR: any = {"name":"getProgressReportTopicsByReportId","params":[{"name":"reportId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5714,"b":5721,"line":184,"col":49}]}}],"usedParamSet":{"reportId":true},"statement":{"body":"SELECT\n    progress_report_topics.id,\n    progress_report_topics.name,\n    progress_report_topics.description,\n    progress_report_topics.grade,\n    progress_report_topic_details.id AS detail_id,\n    progress_report_topic_details.content,\n    progress_report_evaluation_types.name AS evaluation_type,\n    progress_report_evaluation_detail_types.name AS evaluation_detail_type,\n    progress_report_topics.created_at\nFROM\n    progress_report_topics\n    JOIN progress_report_topic_details ON progress_report_topics.id = progress_report_topic_details.progress_report_topic_id\n    JOIN progress_report_evaluation_types ON progress_report_topic_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id\n    JOIN progress_report_evaluation_detail_types ON progress_report_topic_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id\nWHERE\n    progress_report_topics.progress_report_id = :reportId","loc":{"a":4770,"b":5721,"line":168,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     progress_report_topics.id,
 *     progress_report_topics.name,
 *     progress_report_topics.description,
 *     progress_report_topics.grade,
 *     progress_report_topic_details.id AS detail_id,
 *     progress_report_topic_details.content,
 *     progress_report_evaluation_types.name AS evaluation_type,
 *     progress_report_evaluation_detail_types.name AS evaluation_detail_type,
 *     progress_report_topics.created_at
 * FROM
 *     progress_report_topics
 *     JOIN progress_report_topic_details ON progress_report_topics.id = progress_report_topic_details.progress_report_topic_id
 *     JOIN progress_report_evaluation_types ON progress_report_topic_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id
 *     JOIN progress_report_evaluation_detail_types ON progress_report_topic_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id
 * WHERE
 *     progress_report_topics.progress_report_id = :reportId
 * ```
 */
export const getProgressReportTopicsByReportId = new PreparedQuery<IGetProgressReportTopicsByReportIdParams,IGetProgressReportTopicsByReportIdResult>(getProgressReportTopicsByReportIdIR);


