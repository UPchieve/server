DROP SCHEMA IF EXISTS import_upchieve CASCADE;
DROP SCHEMA IF EXISTS backup_upchieve CASCADE;

CREATE SCHEMA import_upchieve;
CREATE SCHEMA backup_upchieve;

CREATE TABLE import_upchieve.cities (LIKE upchieve.cities INCLUDING ALL);
CREATE TABLE import_upchieve.schools (LIKE upchieve.schools INCLUDING ALL);
CREATE TABLE import_upchieve.subjects (LIKE upchieve.subjects INCLUDING ALL);
CREATE TABLE import_upchieve.certifications (LIKE upchieve.certifications INCLUDING ALL);
CREATE TABLE import_upchieve.certification_subject_unlocks (LIKE upchieve.certification_subject_unlocks INCLUDING ALL);
CREATE TABLE import_upchieve.computed_subject_unlocks (LIKE upchieve.computed_subject_unlocks INCLUDING ALL);
CREATE TABLE import_upchieve.quizzes (LIKE upchieve.quizzes INCLUDING ALL);
CREATE TABLE import_upchieve.quiz_subcategories (LIKE upchieve.quiz_subcategories INCLUDING ALL);
CREATE TABLE import_upchieve.quiz_questions (LIKE upchieve.quiz_questions INCLUDING ALL);
CREATE TABLE import_upchieve.quiz_review_materials (LIKE upchieve.quiz_review_materials INCLUDING ALL);
CREATE TABLE import_upchieve.quiz_certification_grants (LIKE upchieve.quiz_certification_grants INCLUDING ALL);

ALTER TABLE import_upchieve.certifications ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE import_upchieve.quizzes ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE import_upchieve.quiz_subcategories ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE import_upchieve.quiz_questions ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE import_upchieve.quiz_review_materials ALTER COLUMN id DROP IDENTITY IF EXISTS;