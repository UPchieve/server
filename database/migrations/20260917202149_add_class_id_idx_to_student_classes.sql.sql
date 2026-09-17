-- migrate:up
CREATE INDEX student_classes_class_id_idx ON upchieve.student_classes (class_id);

-- migrate:down
DROP INDEX upchieve.student_classes_class_id_idx;

