/* @name createParentGuardian */
INSERT INTO parents_guardians (id, email)
    VALUES (:id!, :email!)
ON CONFLICT (email)
    DO NOTHING;


/* @name linkParentGuardianToStudent */
INSERT INTO parents_guardians_students (parents_guardians_id, students_id)
    VALUES (:parent_guardian_id!, :student_id!)
ON CONFLICT (parents_guardians_id, students_id)
    DO NOTHING;

