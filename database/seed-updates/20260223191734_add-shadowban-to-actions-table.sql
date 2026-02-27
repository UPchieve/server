-- migrate:up
INSERT INTO upchieve.moderation_actions (action_name, description)
    VALUES ('shadow_ban', 'Shadow bans student so they are not aware they have been banned from the platform. Volunteers will not see their requests.');

-- migrate:down
DELETE FROM upchieve.moderation_actions
WHERE action_name = 'shadow_ban';

