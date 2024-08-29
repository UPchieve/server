/* @name createAssignment */
INSERT INTO assignments (id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_at, subject_id, created_at, updated_at)
    VALUES (:id!, :classId!, :description, :title, :numberOfSessions, :minDurationInMinutes, :dueDate, :startAt, :subjectId, NOW(), NOW())
RETURNING
    id, class_id, description, title, number_of_sessions, min_duration_in_minutes, due_date, start_at, subject_id, created_at, updated_at;

