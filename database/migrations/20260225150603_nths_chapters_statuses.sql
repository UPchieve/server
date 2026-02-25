-- migrate:up
CREATE TABLE upchieve.nths_chapters_statuses (
    nths_group_id uuid NOT NULL REFERENCES upchieve.nths_groups (id),
    nths_chapter_status_id int NOT NULL REFERENCES upchieve.nths_chapter_statuses (id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE upchieve.nths_chapters_statuses
    ADD CONSTRAINT nths_chapters_statuses_pk PRIMARY KEY (nths_group_id, nths_chapter_status_id, created_at);

CREATE INDEX IF NOT EXISTS nths_chapters_statuses_group_id_index ON upchieve.nths_chapters_statuses (nths_group_id);

CREATE INDEX IF NOT EXISTS nths_chapters_statuses_created_at_index ON upchieve.nths_chapter_statuses (created_at);

-- migrate:down
DROP TABLE upchieve.nths_chapters_statuses;

