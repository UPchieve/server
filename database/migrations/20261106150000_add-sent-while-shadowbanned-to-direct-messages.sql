-- migrate:up
ALTER TABLE upchieve.direct_messages
    ADD COLUMN sent_while_shadowbanned boolean DEFAULT FALSE;

COMMENT ON COLUMN upchieve.direct_messages.sent_while_shadowbanned IS 'not_pii: true when the sender was shadow banned at send time';

-- migrate:down
ALTER TABLE upchieve.direct_messages
    DROP COLUMN sent_while_shadowbanned;

