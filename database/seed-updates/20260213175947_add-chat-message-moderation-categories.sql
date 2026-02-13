-- migrate:up
INSERT INTO upchieve.moderation_categories (name)
    VALUES ('RUDE'), ('OTHER_CONTACT_INFO'), ('OTHER');

-- migrate:down
DELETE FROM upchieve.moderation_categories
WHERE name IN ('RUDE', 'OTHER_CONTACT_INFO', 'OTHER');

