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


/** 'InsertProgressReportTopic' parameters type */
export interface IInsertProgressReportTopicParams {
  description: string;
  grade: number;
  id: string;
  name: string;
  reportId: string;
}

/** 'InsertProgressReportTopic' return type */
export interface IInsertProgressReportTopicResult {
  id: string;
}

/** 'InsertProgressReportTopic' query type */
export interface IInsertProgressReportTopicQuery {
  params: IInsertProgressReportTopicParams;
  result: IInsertProgressReportTopicResult;
}

const insertProgressReportTopicIR: any = {"name":"insertProgressReportTopic","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1104,"b":1106,"line":47,"col":13}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1110,"b":1114,"line":47,"col":19}]}},{"name":"description","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1118,"b":1129,"line":47,"col":27}]}},{"name":"grade","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1133,"b":1138,"line":47,"col":42}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1142,"b":1150,"line":47,"col":51}]}}],"usedParamSet":{"id":true,"name":true,"description":true,"grade":true,"reportId":true},"statement":{"body":"INSERT INTO progress_report_topics (id, name, description, grade, progress_report_id)\n    VALUES (:id!, :name!, :description!, :grade!, :reportId!)\nRETURNING\n    id","loc":{"a":1005,"b":1168,"line":46,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_topics (id, name, description, grade, progress_report_id)
 *     VALUES (:id!, :name!, :description!, :grade!, :reportId!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportTopic = new PreparedQuery<IInsertProgressReportTopicParams,IInsertProgressReportTopicResult>(insertProgressReportTopicIR);


/** 'InsertProgressReportSummaryDetail' parameters type */
export interface IInsertProgressReportSummaryDetailParams {
  content: string;
  evaluationDetailType: string;
  evaluationType: string;
  id: string;
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

const insertProgressReportSummaryDetailIR: any = {"name":"insertProgressReportSummaryDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1396,"b":1398,"line":55,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1406,"b":1413,"line":56,"col":5}]}},{"name":"reportSummaryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1421,"b":1436,"line":57,"col":5}]}},{"name":"evaluationType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1576,"b":1590,"line":64,"col":20}]}},{"name":"evaluationDetailType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1734,"b":1754,"line":70,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportSummaryId":true,"evaluationType":true,"evaluationDetailType":true},"statement":{"body":"INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportSummaryId!,\n    (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_types\n        WHERE\n            name = :evaluationType!), (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_detail_types\n        WHERE\n            name = :evaluationDetailType!)\nRETURNING\n    id","loc":{"a":1219,"b":1772,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)
 * SELECT
 *     :id!,
 *     :content!,
 *     :reportSummaryId!,
 *     (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_evaluation_types
 *         WHERE
 *             name = :evaluationType!), (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_evaluation_detail_types
 *         WHERE
 *             name = :evaluationDetailType!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportSummaryDetail = new PreparedQuery<IInsertProgressReportSummaryDetailParams,IInsertProgressReportSummaryDetailResult>(insertProgressReportSummaryDetailIR);


/** 'InsertProgressReportTopicDetail' parameters type */
export interface IInsertProgressReportTopicDetailParams {
  content: string;
  evaluationDetailType: string;
  evaluationType: string;
  id: string;
  reportTopicId: string;
}

/** 'InsertProgressReportTopicDetail' return type */
export interface IInsertProgressReportTopicDetailResult {
  id: string;
}

/** 'InsertProgressReportTopicDetail' query type */
export interface IInsertProgressReportTopicDetailQuery {
  params: IInsertProgressReportTopicDetailParams;
  result: IInsertProgressReportTopicDetailResult;
}

const insertProgressReportTopicDetailIR: any = {"name":"insertProgressReportTopicDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1994,"b":1996,"line":78,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2004,"b":2011,"line":79,"col":5}]}},{"name":"reportTopicId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2019,"b":2032,"line":80,"col":5}]}},{"name":"evaluationType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2172,"b":2186,"line":87,"col":20}]}},{"name":"evaluationDetailType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2330,"b":2350,"line":93,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportTopicId":true,"evaluationType":true,"evaluationDetailType":true},"statement":{"body":"INSERT INTO progress_report_topic_details (id, content, progress_report_topic_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportTopicId!,\n    (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_types\n        WHERE\n            name = :evaluationType!), (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_detail_types\n        WHERE\n            name = :evaluationDetailType!)\nRETURNING\n    id","loc":{"a":1821,"b":2368,"line":76,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO progress_report_topic_details (id, content, progress_report_topic_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)
 * SELECT
 *     :id!,
 *     :content!,
 *     :reportTopicId!,
 *     (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_evaluation_types
 *         WHERE
 *             name = :evaluationType!), (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_evaluation_detail_types
 *         WHERE
 *             name = :evaluationDetailType!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportTopicDetail = new PreparedQuery<IInsertProgressReportTopicDetailParams,IInsertProgressReportTopicDetailResult>(insertProgressReportTopicDetailIR);


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

const updateProgressReportStatusIR: any = {"name":"updateProgressReportStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2611,"b":2617,"line":110,"col":16}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2665,"b":2673,"line":112,"col":27}]}}],"usedParamSet":{"status":true,"reportId":true},"statement":{"body":"UPDATE\n    upchieve.progress_reports\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        upchieve.progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    progress_reports.id = :reportId!\nRETURNING\n    progress_reports.id AS ok","loc":{"a":2412,"b":2713,"line":99,"col":0}}};

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

const getProgressReportInfoBySessionIdIR: any = {"name":"getProgressReportInfoBySessionId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3313,"b":3319,"line":128,"col":32}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3344,"b":3353,"line":129,"col":23}]}},{"name":"analysisType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3402,"b":3414,"line":130,"col":47}]}}],"usedParamSet":{"userId":true,"sessionId":true,"analysisType":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status\nFROM\n    progress_reports\n    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id\n    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\n    LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id\nWHERE\n    progress_reports.user_id = :userId!\n    AND sessions.id = :sessionId!\n    AND progress_report_analysis_types.name = :analysisType!\nORDER BY\n    progress_reports.created_at DESC","loc":{"a":2763,"b":3460,"line":118,"col":0}}};

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

const getProgressReportByReportIdIR: any = {"name":"getProgressReportByReportId","params":[{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3734,"b":3742,"line":143,"col":27}]}}],"usedParamSet":{"reportId":true},"statement":{"body":"SELECT\n    progress_reports.id,\n    progress_report_statuses.name AS status\nFROM\n    progress_reports\n    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id\nWHERE\n    progress_reports.id = :reportId!","loc":{"a":3505,"b":3742,"line":136,"col":0}}};

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


/** 'GetProgressReportSummariesForMany' parameters type */
export interface IGetProgressReportSummariesForManyParams {
  reportIds: stringArray;
}

/** 'GetProgressReportSummariesForMany' return type */
export interface IGetProgressReportSummariesForManyResult {
  content: string;
  createdAt: Date;
  detailId: string;
  evaluationDetailType: string;
  evaluationType: string;
  id: string;
  overallGrade: number;
  summary: string;
}

/** 'GetProgressReportSummariesForMany' query type */
export interface IGetProgressReportSummariesForManyQuery {
  params: IGetProgressReportSummariesForManyParams;
  result: IGetProgressReportSummariesForManyResult;
}

const getProgressReportSummariesForManyIR: any = {"name":"getProgressReportSummariesForMany","params":[{"name":"reportIds","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":4748,"b":4757,"line":162,"col":57}]}}],"usedParamSet":{"reportIds":true},"statement":{"body":"SELECT\n    progress_report_summaries.id,\n    progress_report_summaries.summary,\n    progress_report_summaries.overall_grade,\n    progress_report_summary_details.id AS detail_id,\n    progress_report_summary_details.content,\n    progress_report_evaluation_types.name AS evaluation_type,\n    progress_report_evaluation_detail_types.name AS evaluation_detail_type,\n    progress_report_summaries.created_at\nFROM\n    progress_report_summaries\n    JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id\n    JOIN progress_report_evaluation_detail_types ON progress_report_summary_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id\n    JOIN progress_report_evaluation_types ON progress_report_summary_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id\nWHERE\n    progress_report_summaries.progress_report_id = ANY (:reportIds!)\nORDER BY\n    progress_report_summaries.created_at DESC","loc":{"a":3793,"b":4813,"line":147,"col":0}}};

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


/** 'GetProgressReportTopicsByReportId' parameters type */
export interface IGetProgressReportTopicsByReportIdParams {
  reportId: string | null | void;
}

/** 'GetProgressReportTopicsByReportId' return type */
export interface IGetProgressReportTopicsByReportIdResult {
  content: string;
  createdAt: Date;
  description: string;
  detailId: string;
  evaluationDetailType: string;
  evaluationType: string;
  grade: number;
  id: string;
  name: string;
}

/** 'GetProgressReportTopicsByReportId' query type */
export interface IGetProgressReportTopicsByReportIdQuery {
  params: IGetProgressReportTopicsByReportIdParams;
  result: IGetProgressReportTopicsByReportIdResult;
}

const getProgressReportTopicsByReportIdIR: any = {"name":"getProgressReportTopicsByReportId","params":[{"name":"reportId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":5808,"b":5815,"line":184,"col":49}]}}],"usedParamSet":{"reportId":true},"statement":{"body":"SELECT\n    progress_report_topics.id,\n    progress_report_topics.name,\n    progress_report_topics.description,\n    progress_report_topics.grade,\n    progress_report_topic_details.id AS detail_id,\n    progress_report_topic_details.content,\n    progress_report_evaluation_types.name AS evaluation_type,\n    progress_report_evaluation_detail_types.name AS evaluation_detail_type,\n    progress_report_topics.created_at\nFROM\n    progress_report_topics\n    JOIN progress_report_topic_details ON progress_report_topics.id = progress_report_topic_details.progress_report_topic_id\n    JOIN progress_report_evaluation_types ON progress_report_topic_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id\n    JOIN progress_report_evaluation_detail_types ON progress_report_topic_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id\nWHERE\n    progress_report_topics.progress_report_id = :reportId","loc":{"a":4864,"b":5815,"line":168,"col":0}}};

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


