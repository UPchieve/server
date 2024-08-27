-- migrate:up
INSERT INTO upchieve.grade_level_sequence (grade_name, next_grade_name)
    VALUES ('6th', '7th'), ('7th', '8th'), ('8th', '9th'), ('9th', '10th'), ('10th', '11th'), ('11th', '12th'), ('12th', 'College'), ('College', 'College'), ('Other', 'Other');

-- migrate:down
DELETE FROM upchieve.grade_level_sequence;

