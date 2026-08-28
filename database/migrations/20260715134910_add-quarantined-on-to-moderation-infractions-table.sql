--If a photo fails PhotoDNACheck, we want to populate the quarantied_on column
--with a date so we know that it failed PhotoDNA and not just regular moderation.
-- migrate:up
ALTER TABLE upchieve.moderation_infractions
    ADD COLUMN quarantined_on timestamptz;

-- migrate:down
ALTER TABLE upchieve.moderation_infractions
    DROP COLUMN quarantined_on;

