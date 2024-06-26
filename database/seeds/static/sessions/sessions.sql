/* @name insertReportReason */
INSERT INTO report_reasons (reason, created_at, updated_at) VALUES (:reason!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;

/* @name insertSessionFlag */
INSERT INTO session_flags (name, created_at, updated_at) VALUES (:name!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;
