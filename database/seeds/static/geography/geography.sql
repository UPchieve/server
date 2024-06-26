/* @name insertUsState */
INSERT INTO us_states (name, code, created_at, updated_at) VALUES (:name!, :code!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING name AS ok;

/* @name insertZipCode */
INSERT INTO postal_codes (code, us_state_code, income, location, created_at, updated_at) VALUES (:code!, :usStateCode!, :income!, POINT(:latitude!, :longitude!), NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING code AS ok;

/* @name insertWeekday */
INSERT INTO weekdays (id, day, created_at, updated_at) VALUES (:id!, :day!, NOW(), NOW()) ON CONFLICT DO NOTHING RETURNING id AS ok;
