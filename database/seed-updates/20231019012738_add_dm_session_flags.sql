-- migrate:up
INSERT INTO upchieve.session_flags (name)
    VALUES ('Coach reported student DM'), ('Student reported coach DM');

INSERT INTO upchieve.report_reasons (reason)
    VALUES ('Coach asked me to connect off of UPchieve (examples: they shared social media, or asked to zoom)'), ('Coach made me feel uncomfortable or unsafe'), ('Coach used inappropriate language'), ('Coach talked about inappropriate and offensive topics');

-- migrate:down
DELETE FROM upchieve.session_flags
WHERE name = 'Coach reported student DM'
    OR name = 'Student reported coach DM';

DELETE FROM upchieve.report_reasons (reason)
WHERE name = 'Coach asked me to connect off of UPchieve (examples: they shared social media, or asked to zoom)'
    OR name = 'Coach made me feel uncomfortable or unsafe'
    OR name = 'Coach used inappropriate language'
    OR name = 'Coach talked about inappropriate and offensive topics';

