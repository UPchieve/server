SELECT COUNT(*) FROM upchieve.sessions s
LEFT JOIN upchieve.subjects sub ON sub.id = s.subject_id
WHERE sub.id IS NULL;

SELECT COUNT(*) FROM upchieve.users_certifications uc
LEFT JOIN upchieve.certifications c ON c.id = uc.certification_id
WHERE c.id IS NULL;

SELECT COUNT(*) FROM upchieve.users_quizzes uq
LEFT JOIN upchieve.quizzes q ON q.id = uq.quiz_id
WHERE q.id IS NULL;

SELECT COUNT(*) FROM upchieve.student_profiles sp
LEFT JOIN upchieve.schools sch ON sch.id = sp.school_id
WHERE sp.school_id IS NOT NULL AND sch.id IS NULL;