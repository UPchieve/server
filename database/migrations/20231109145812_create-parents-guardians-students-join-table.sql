-- migrate:up
CREATE TABLE IF NOT EXISTS upchieve.parents_guardians_students (
    parents_guardians_id uuid NOT NULL,
    students_id uuid NOT NULL,
    PRIMARY KEY (parents_guardians_id, students_id),
    FOREIGN KEY (parents_guardians_id) REFERENCES upchieve.parents_guardians (id),
    FOREIGN KEY (students_id) REFERENCES upchieve.student_profiles (user_id)
);

-- migrate:down
DROP TABLE IF EXISTS upchieve.parents_guardians_students;

