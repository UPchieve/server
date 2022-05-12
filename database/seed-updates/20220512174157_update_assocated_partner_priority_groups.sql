-- migrate:up
UPDATE
    upchieve.notification_priority_groups
SET
    name = 'Associated partner volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"',
    updated_at = NOW()
WHERE
    name = 'Verizon volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    name = 'Associated partner volunteers - not notified in the last 3 days AND they don''t have "high level subjects"',
    updated_at = NOW()
WHERE
    name = 'Verizon volunteers - not notified in the last 3 days AND they don''t have "high level subjects"';


-- migrate:down

UPDATE
    upchieve.notification_priority_groups
SET
    name = 'Verizon volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"',
    updated_at = NOW()
WHERE
    name = 'Associated partner volunteers - not notified in the last 24 hours AND they don''t have "high level subjects"';

UPDATE
    upchieve.notification_priority_groups
SET
    name = 'Verizon volunteers - not notified in the last 3 days AND they don''t have "high level subjects"',
    updated_at = NOW()
WHERE
    name = 'Associated partner volunteers - not notified in the last 3 days AND they don''t have "high level subjects"';

