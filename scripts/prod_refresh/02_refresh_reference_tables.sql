BEGIN;

-- =========================================
-- 1) Snapshot old id -> business key maps
-- =========================================

CREATE TEMP TABLE old_subject_map AS
SELECT id, name
FROM upchieve.subjects;

CREATE TEMP TABLE old_cert_map AS
SELECT id, name
FROM upchieve.certifications;

CREATE TEMP TABLE old_quiz_map AS
SELECT id, name
FROM upchieve.quizzes;

CREATE TEMP TABLE old_school_map AS
SELECT id, name, mongo_id
FROM upchieve.schools;

-- =========================================
-- 2) Clear nullable school links
-- =========================================

UPDATE upchieve.student_profiles
SET school_id = NULL
WHERE school_id IS NOT NULL;

-- =========================================
-- 3) Upsert parent/reference tables
-- =========================================

-- subjects
INSERT INTO upchieve.subjects (
  id,
  name,
  display_name,
  topic_id,
  tool_type_id,
  display_order,
  created_at,
  updated_at
)
OVERRIDING SYSTEM VALUE
SELECT
  id,
  name,
  display_name,
  topic_id,
  tool_type_id,
  display_order,
  created_at,
  updated_at
FROM import_upchieve.subjects
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    display_name = EXCLUDED.display_name,
    topic_id = EXCLUDED.topic_id,
    tool_type_id = EXCLUDED.tool_type_id,
    display_order = EXCLUDED.display_order,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

-- certifications
INSERT INTO upchieve.certifications (
  id,
  name,
  created_at,
  updated_at,
  active
)
OVERRIDING SYSTEM VALUE
SELECT
  id,
  name,
  created_at,
  updated_at,
  active
FROM import_upchieve.certifications
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    active = EXCLUDED.active;

-- cities
INSERT INTO upchieve.cities (
  id,
  name,
  us_state_code,
  created_at,
  updated_at
)
SELECT
  id,
  name,
  us_state_code,
  created_at,
  updated_at
FROM import_upchieve.cities
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    us_state_code = EXCLUDED.us_state_code,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

-- schools
INSERT INTO upchieve.schools (
  id,
  name,
  approved,
  partner,
  city_id,
  created_at,
  updated_at,
  mongo_id,
  legacy_city_name
)
OVERRIDING SYSTEM VALUE
SELECT
  id,
  name,
  approved,
  partner,
  city_id,
  created_at,
  updated_at,
  mongo_id,
  legacy_city_name
FROM import_upchieve.schools
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    approved = EXCLUDED.approved,
    partner = EXCLUDED.partner,
    city_id = EXCLUDED.city_id,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    mongo_id = EXCLUDED.mongo_id,
    legacy_city_name = EXCLUDED.legacy_city_name;

-- =========================================
-- 4) Replace certification unlock tables
-- =========================================

DELETE FROM upchieve.certification_subject_unlocks;
DELETE FROM upchieve.computed_subject_unlocks;

INSERT INTO upchieve.certification_subject_unlocks
SELECT *
FROM import_upchieve.certification_subject_unlocks;

INSERT INTO upchieve.computed_subject_unlocks
SELECT *
FROM import_upchieve.computed_subject_unlocks;

-- =========================================
-- 5) Remap sessions by subject name
-- =========================================

UPDATE upchieve.sessions s
SET subject_id = new_subj.id
FROM old_subject_map old_subj
JOIN upchieve.subjects new_subj
  ON new_subj.name = old_subj.name
WHERE s.subject_id = old_subj.id;

-- =========================================
-- 6) Preserve user certifications
-- =========================================

DELETE FROM upchieve.users_certifications;

INSERT INTO upchieve.users_certifications (
  user_id,
  certification_id,
  created_at,
  updated_at
)
SELECT
  buc.user_id,
  newc.id,
  buc.created_at,
  buc.updated_at
FROM backup_upchieve.users_certifications buc
JOIN old_cert_map oldc
  ON buc.certification_id = oldc.id
JOIN upchieve.certifications newc
  ON newc.name = oldc.name;

-- =========================================
-- 7) Replace quiz graph safely
-- =========================================

-- clear dependent tables first
DELETE FROM upchieve.users_quizzes;
DELETE FROM upchieve.quiz_questions;
DELETE FROM upchieve.quiz_subcategories;
DELETE FROM upchieve.quiz_review_materials;
DELETE FROM upchieve.quiz_certification_grants;

-- delete quizzes by name to avoid unique constraint conflicts
DELETE FROM upchieve.quizzes q
USING import_upchieve.quizzes iq
WHERE q.name = iq.name;

-- insert quizzes
INSERT INTO upchieve.quizzes (
  id,
  name,
  created_at,
  updated_at,
  active,
  questions_per_subcategory
)
OVERRIDING SYSTEM VALUE
SELECT
  id,
  name,
  created_at,
  updated_at,
  active,
  questions_per_subcategory
FROM import_upchieve.quizzes;

-- insert quiz children (with identity override)
INSERT INTO upchieve.quiz_subcategories (
  id,
  name,
  quiz_id,
  created_at,
  updated_at
)
OVERRIDING SYSTEM VALUE
SELECT *
FROM import_upchieve.quiz_subcategories;

INSERT INTO upchieve.quiz_questions (
  id,
  question_text,
  possible_answers,
  correct_answer,
  quiz_subcategory_id,
  image_source,
  created_at,
  updated_at,
  mongo_id
)
OVERRIDING SYSTEM VALUE
SELECT *
FROM import_upchieve.quiz_questions;

INSERT INTO upchieve.quiz_review_materials (
  id,
  quiz_id,
  title,
  pdf,
  image,
  created_at,
  updated_at
)
OVERRIDING SYSTEM VALUE
SELECT *
FROM import_upchieve.quiz_review_materials;

INSERT INTO upchieve.quiz_certification_grants
SELECT *
FROM import_upchieve.quiz_certification_grants;

-- restore user quiz state
INSERT INTO upchieve.users_quizzes (
  user_id,
  quiz_id,
  attempts,
  passed,
  created_at,
  updated_at
)
SELECT
  buq.user_id,
  newq.id,
  buq.attempts,
  buq.passed,
  buq.created_at,
  buq.updated_at
FROM backup_upchieve.users_quizzes buq
JOIN old_quiz_map oldq
  ON buq.quiz_id = oldq.id
JOIN upchieve.quizzes newq
  ON newq.name = oldq.name;

-- =========================================
-- 8) Remap schools
-- =========================================

UPDATE upchieve.student_profiles sp
SET school_id = news.id
FROM backup_upchieve.student_profiles bsp
JOIN old_school_map olds
  ON bsp.school_id = olds.id
JOIN upchieve.schools news
  ON olds.mongo_id IS NOT NULL
 AND news.mongo_id = olds.mongo_id
WHERE sp.user_id = bsp.user_id;

UPDATE upchieve.student_profiles sp
SET school_id = news.id
FROM backup_upchieve.student_profiles bsp
JOIN old_school_map olds
  ON bsp.school_id = olds.id
JOIN upchieve.schools news
  ON olds.mongo_id IS NULL
 AND news.name = olds.name
WHERE sp.user_id = bsp.user_id
  AND sp.school_id IS NULL;

COMMIT;