-- migrate:up
ALTER TABLE upchieve.topics
    DROP CONSTRAINT IF EXISTS topics_dashboard_order_key;

-- migrate:down
ALTER TABLE upchieve.topics
    ADD CONSTRAINT topics_dashboard_order_key UNIQUE (dashboard_order);

