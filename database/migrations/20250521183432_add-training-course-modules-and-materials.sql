-- migrate:up
CREATE TABLE upchieve.training_course_modules (
    id serial PRIMARY KEY,
    training_course_id integer NOT NULL REFERENCES upchieve.training_courses (id),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE upchieve.training_course_modules
    ADD CONSTRAINT tc_modules_unique_training_course_id_name UNIQUE (training_course_id, name);

CREATE TYPE upchieve.training_course_material_type AS ENUM (
    'video',
    'document',
    'link',
    'resources'
);

CREATE TABLE upchieve.training_course_module_materials (
    id serial PRIMARY KEY,
    module_id integer NOT NULL REFERENCES upchieve.training_course_modules (id),
    name text NOT NULL,
    key text NOT NULL,
    TYPE upchieve.training_course_material_type NOT NULL,
    required boolean NOT NULL,
    resource_id text,
    resource_url text NOT NULL,
    links json DEFAULT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE upchieve.training_course_module_materials
    ADD CONSTRAINT tc_materials_unique_module_id_name UNIQUE (module_id, name);

-- Insert modules
INSERT INTO upchieve.training_course_modules (training_course_id, name)
SELECT
    id,
    'Coaching on UPchieve'
FROM
    upchieve.training_courses
WHERE
    name = 'upchieve101';

INSERT INTO upchieve.training_course_modules (training_course_id, name)
SELECT
    id,
    'Community Safety & Success'
FROM
    upchieve.training_courses
WHERE
    name = 'upchieve101';

-- Insert materials
INSERT INTO upchieve.training_course_module_materials (name, module_id, KEY, TYPE, required, resource_id, resource_url, links)
SELECT
    'Implementing Effective Coaching Strategies',
    id,
    '7b6a76',
    'video'::upchieve.training_course_material_type,
    TRUE,
    '760386859',
    'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/implementing-effective-coaching-strategies-deck.pdf',
    '[{ "displayName": "Summary", "url": "https://cdn.upchieve.org/training-courses/upchieve101/upchieve-coaching-strategies-v2.pdf"}]'
FROM
    upchieve.training_course_modules
WHERE
    name = 'Coaching on UPchieve';

INSERT INTO upchieve.training_course_module_materials (name, module_id, KEY, TYPE, required, resource_id, resource_url, links)
SELECT
    'Community Safety & Success',
    id,
    'jsn832',
    'video'::upchieve.training_course_material_type,
    TRUE,
    '773599358',
    'https://cdn.upchieve.org/training-courses/upchieve101/video-decks/community-safety-&-success-deck.pdf',
    NULL
FROM
    upchieve.training_course_modules
WHERE
    name = 'Community Safety & Success';

INSERT INTO upchieve.training_course_module_materials (name, module_id, KEY, TYPE, required, resource_id, resource_url, links)
SELECT
    'Review Safety Policy',
    id,
    'ps87f9',
    'document'::upchieve.training_course_material_type,
    TRUE,
    NULL,
    'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-student-safety-policy.pdf',
    NULL
FROM
    upchieve.training_course_modules
WHERE
    name = 'Community Safety & Success';

INSERT INTO upchieve.training_course_module_materials (name, module_id, KEY, TYPE, required, resource_id, resource_url, links)
SELECT
    'Review Academic Integrity Policy',
    id,
    'jgu55k',
    'document'::upchieve.training_course_material_type,
    TRUE,
    NULL,
    'https://cdn.upchieve.org/training-courses/upchieve101/upchieve-academic-integrity-policy.pdf',
    NULL
FROM
    upchieve.training_course_modules
WHERE
    name = 'Community Safety & Success';

INSERT INTO upchieve.training_course_module_materials (name, module_id, KEY, TYPE, required, resource_id, resource_url, links)
SELECT
    'Review Diversity, Equity, and Inclusion Policy',
    id,
    'fj8tzq',
    'document'::upchieve.training_course_material_type,
    TRUE,
    NULL,
    'https://cdn.upchieve.org/training-courses/upchieve101/volunteer-dei-policy-v2.pdf',
    NULL
FROM
    upchieve.training_course_modules
WHERE
    name = 'Community Safety & Success';

-- migrate:down
DROP TABLE IF EXISTS upchieve.training_course_module_materials;

DROP TYPE IF EXISTS upchieve.training_course_material_type;

DROP TABLE IF EXISTS upchieve.training_course_modules;

