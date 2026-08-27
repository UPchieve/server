-- migrate:up
INSERT INTO upchieve.nths_actions (name)
    VALUES ('RECRUITMENT SPRINT');

-- The recruitment sprint is explained during the new orientation, so a president who already
-- sat through the old one would be asked for something they have never heard of. Those
-- chapters get the item checked off instead. Backfilled rows carry the ATTENDED ORIENTATION
-- action's own created_at, which necessarily predates the row inserted above: a completion
-- older than its own action is impossible, so nga.created_at >= a.created_at picks out the
-- genuine completions and excludes every row written here.
INSERT INTO upchieve.nths_group_actions (nths_group_id, nths_action_id, created_at)
SELECT DISTINCT
    nga.nths_group_id,
    sprint.id,
    orientation.created_at
FROM
    upchieve.nths_group_actions nga
    JOIN upchieve.nths_actions orientation ON orientation.id = nga.nths_action_id
        AND orientation.name = 'ATTENDED ORIENTATION'
    CROSS JOIN upchieve.nths_actions sprint
WHERE
    sprint.name = 'RECRUITMENT SPRINT';

-- migrate:down
DELETE FROM upchieve.nths_group_actions nga USING upchieve.nths_actions a
WHERE a.id = nga.nths_action_id
    AND a.name = 'RECRUITMENT SPRINT';

DELETE FROM upchieve.nths_actions
WHERE name = 'RECRUITMENT SPRINT';

