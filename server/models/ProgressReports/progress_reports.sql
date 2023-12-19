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
            name = :evaluationType!), (
        SELECT
            id
        FROM
            upchieve.progress_report_evaluation_detail_types
        WHERE
            name = :evaluationDetailType!)
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
            name = :evaluationType!), (
        SELECT
            id
        FROM
            upchieve.progress_report_evaluation_detail_types
        WHERE
            name = :evaluationDetailType!)
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


/* @name getProgressReportInfoBySessionId */
SELECT
    progress_reports.id,
    progress_report_statuses.name AS status
FROM
    progress_reports
    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
    LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id
WHERE
    progress_reports.user_id = :userId!
    AND sessions.id = :sessionId!
    AND progress_report_analysis_types.name = :analysisType!
ORDER BY
    progress_reports.created_at DESC;


/* @name getProgressReportByReportId */
SELECT
    progress_reports.id,
    progress_report_statuses.name AS status
FROM
    progress_reports
    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
WHERE
    progress_reports.id = :reportId!;


/* @name getProgressReportSummariesForMany */
SELECT
    progress_report_summaries.id,
    progress_report_summaries.summary,
    progress_report_summaries.overall_grade,
    progress_report_summary_details.id AS detail_id,
    progress_report_summary_details.content,
    progress_report_evaluation_types.name AS evaluation_type,
    progress_report_evaluation_detail_types.name AS evaluation_detail_type,
    progress_report_summaries.created_at
FROM
    progress_report_summaries
    JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id
    JOIN progress_report_evaluation_detail_types ON progress_report_summary_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id
    JOIN progress_report_evaluation_types ON progress_report_summary_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id
WHERE
    progress_report_summaries.progress_report_id = ANY (:reportIds!)
ORDER BY
    progress_report_summaries.created_at DESC;


/* @name getProgressReportTopicsByReportId */
SELECT
    progress_report_topics.id,
    progress_report_topics.name,
    progress_report_topics.description,
    progress_report_topics.grade,
    progress_report_topic_details.id AS detail_id,
    progress_report_topic_details.content,
    progress_report_evaluation_types.name AS evaluation_type,
    progress_report_evaluation_detail_types.name AS evaluation_detail_type,
    progress_report_topics.created_at
FROM
    progress_report_topics
    JOIN progress_report_topic_details ON progress_report_topics.id = progress_report_topic_details.progress_report_topic_id
    JOIN progress_report_evaluation_types ON progress_report_topic_details.progress_report_evaluation_type_id = progress_report_evaluation_types.id
    JOIN progress_report_evaluation_detail_types ON progress_report_topic_details.progress_report_evaluation_detail_type_id = progress_report_evaluation_detail_types.id
WHERE
    progress_report_topics.progress_report_id = :reportId;

