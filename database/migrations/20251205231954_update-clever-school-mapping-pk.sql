-- migrate:up
ALTER TABLE upchieve.clever_school_mapping
    DROP CONSTRAINT clever_school_mapping_pkey;

ALTER TABLE upchieve.clever_school_mapping
    ADD PRIMARY KEY (upchieve_school_id, clever_school_id);

-- migrate:down
ALTER TABLE upchieve.clever_school_mapping
    DROP CONSTRAINT clever_school_mapping_pkey;

ALTER TABLE upchieve.clever_school_mapping
    ADD PRIMARY KEY (upchieve_school_id);

