/* @name insertProgressReport */
INSERT INTO progress_reports (id, user_id, status_id)
SELECT
    :id!,
    :userId!,
    subquery.id
FROM (
    SELECT
        id
    FROM
        progress_report_statuses
    WHERE
        name = :status!) AS subquery
RETURNING
    id;


/* @name insertProgressReportSession */
INSERT INTO progress_report_sessions (progress_report_id, session_id, progress_report_analysis_type_id)
SELECT
    :reportId!,
    :sessionId!,
    subquery.id
FROM (
    SELECT
        id
    FROM
        progress_report_analysis_types
    WHERE
        name = :analysisType!) AS subquery
RETURNING
    progress_report_id AS ok;


/* @name insertProgressReportSummary */
INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)
    VALUES (:id!, :reportId!, :summary!, :overallGrade!)
ON CONFLICT (progress_report_id)
    DO UPDATE SET
        summary = :summary!, overall_grade = :overallGrade!
    RETURNING
        id;


/* @name insertProgressReportTopic */
INSERT INTO progress_report_topics (id, name, description, grade, progress_report_id)
    VALUES (:id!, :name!, :description!, :grade!, :reportId!)
RETURNING
    id;


/* @name insertProgressReportSummaryDetail */
INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)
SELECT
    :id!,
    :content!,
    :reportSummaryId!,
    (
        SELECT
            id
        FROM
            upchieve.progress_report_evaluation_types
        WHERE
            name = :reportEvaluationType!), (
        SELECT
            id
        FROM
            upchieve.progress_report_evaluation_detail_types
        WHERE
            name = :reportEvaluationDetailType!)
RETURNING
    id;


/* @name insertProgressReportTopicDetail */
INSERT INTO progress_report_topic_details (id, content, progress_report_topic_id, progress_report_evaluation_type_id, progress_report_evaluation_detail_type_id)
SELECT
    :id!,
    :content!,
    :reportTopicId!,
    (
        SELECT
            id
        FROM
            upchieve.progress_report_evaluation_types
        WHERE
            name = :reportEvaluationType!), (
        SELECT
            id
        FROM
            upchieve.progress_report_evaluation_detail_types
        WHERE
            name = :reportEvaluationDetailType!)
RETURNING
    id;


/* @name updateProgressReportStatus */
UPDATE
    upchieve.progress_reports
SET
    status_id = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.progress_report_statuses
    WHERE
        name = :status!) AS subquery
WHERE
    progress_reports.id = :reportId!
RETURNING
    progress_reports.id AS ok;

