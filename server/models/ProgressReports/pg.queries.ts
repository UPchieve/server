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
  id: string;
  reportEvaluationDetailType: string;
  reportEvaluationType: string;
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

const insertProgressReportSummaryDetailIR: any = {"name":"insertProgressReportSummaryDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1396,"b":1398,"line":55,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1406,"b":1413,"line":56,"col":5}]}},{"name":"reportSummaryId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1421,"b":1436,"line":57,"col":5}]}},{"name":"reportEvaluationType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1576,"b":1596,"line":64,"col":20}]}},{"name":"reportEvaluationDetailType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1740,"b":1766,"line":70,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportSummaryId":true,"reportEvaluationType":true,"reportEvaluationDetailType":true},"statement":{"body":"INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportSummaryId!,\n    (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_types\n        WHERE\n            name = :reportEvaluationType!), (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_detail_types\n        WHERE\n            name = :reportEvaluationDetailType!)\nRETURNING\n    id","loc":{"a":1219,"b":1784,"line":53,"col":0}}};

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
 *             name = :reportEvaluationType!), (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_evaluation_detail_types
 *         WHERE
 *             name = :reportEvaluationDetailType!)
 * RETURNING
 *     id
 * ```
 */
export const insertProgressReportSummaryDetail = new PreparedQuery<IInsertProgressReportSummaryDetailParams,IInsertProgressReportSummaryDetailResult>(insertProgressReportSummaryDetailIR);


/** 'InsertProgressReportTopicDetail' parameters type */
export interface IInsertProgressReportTopicDetailParams {
  content: string;
  id: string;
  reportEvaluationDetailType: string;
  reportEvaluationType: string;
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

const insertProgressReportTopicDetailIR: any = {"name":"insertProgressReportTopicDetail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2006,"b":2008,"line":78,"col":5}]}},{"name":"content","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2016,"b":2023,"line":79,"col":5}]}},{"name":"reportTopicId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2031,"b":2044,"line":80,"col":5}]}},{"name":"reportEvaluationType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2184,"b":2204,"line":87,"col":20}]}},{"name":"reportEvaluationDetailType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2348,"b":2374,"line":93,"col":20}]}}],"usedParamSet":{"id":true,"content":true,"reportTopicId":true,"reportEvaluationType":true,"reportEvaluationDetailType":true},"statement":{"body":"INSERT INTO progress_report_topic_details (id, content, progress_report_topic_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)\nSELECT\n    :id!,\n    :content!,\n    :reportTopicId!,\n    (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_types\n        WHERE\n            name = :reportEvaluationType!), (\n        SELECT\n            id\n        FROM\n            upchieve.progress_report_evaluation_detail_types\n        WHERE\n            name = :reportEvaluationDetailType!)\nRETURNING\n    id","loc":{"a":1833,"b":2392,"line":76,"col":0}}};

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
 *             name = :reportEvaluationType!), (
 *         SELECT
 *             id
 *         FROM
 *             upchieve.progress_report_evaluation_detail_types
 *         WHERE
 *             name = :reportEvaluationDetailType!)
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

const updateProgressReportStatusIR: any = {"name":"updateProgressReportStatus","params":[{"name":"status","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2635,"b":2641,"line":110,"col":16}]}},{"name":"reportId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2689,"b":2697,"line":112,"col":27}]}}],"usedParamSet":{"status":true,"reportId":true},"statement":{"body":"UPDATE\n    upchieve.progress_reports\nSET\n    status_id = subquery.id,\n    updated_at = NOW()\nFROM (\n    SELECT\n        id\n    FROM\n        upchieve.progress_report_statuses\n    WHERE\n        name = :status!) AS subquery\nWHERE\n    progress_reports.id = :reportId!\nRETURNING\n    progress_reports.id AS ok","loc":{"a":2436,"b":2737,"line":99,"col":0}}};

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


