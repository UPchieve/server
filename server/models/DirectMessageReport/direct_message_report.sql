/* @name createReport */
INSERT INTO direct_message_reports (id, conversation_id, report_reason_id, report_message, reporting_user_id, reported_user_id)
SELECT
    :id!,
    :conversationId!,
    report_reasons.id,
    :reportMessage,
    :reportingUserId!,
    :reportedUserId!
FROM
    report_reasons
WHERE
    reason = :reportReason!
RETURNING
    id;


/* @name createReportFlag */
INSERT INTO direct_message_flags (id, conversation_id, session_flag_id, report_id)
SELECT
    :id!,
    reports.conversation_id,
    flags.id,
    reports.id
FROM
    direct_message_reports reports
    JOIN session_flags flags ON flags.name = :flagName!
WHERE
    reports.id = :reportId!
    AND reports.conversation_id = :conversationId!
RETURNING
    id;


/* @name getReportById */
SELECT
    reports.id,
    reports.conversation_id,
    reports.reporting_user_id,
    reports.reported_user_id,
    reports.report_message,
    reasons.reason AS report_reason,
    conversations.student_id,
    conversations.volunteer_id
FROM
    direct_message_reports reports
    JOIN report_reasons reasons ON reasons.id = reports.report_reason_id
    JOIN direct_message_conversations conversations ON conversations.id = reports.conversation_id
WHERE
    reports.id = :reportId!;

