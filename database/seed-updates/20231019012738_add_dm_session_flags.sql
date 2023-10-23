-- migrate:up
INSERT INTO upchieve.session_flags (name)
    VALUES ('Coach reported student DM'), ('Student reported coach DM');

INSERT INTO upchieve.report_reasons (reason)
    VALUES ('Coach asked me to connect off of UPchieve'), ('Coach made me feel uncomfortable or unsafe'), ('Coach used inappropriate language'), ('Coach talked about inappropriate and offensive topics');

-- migrate:down
DELETE FROM upchieve.session_flags
WHERE name = 'Coach reported student DM'
    OR name = 'Student reported coach DM';

DELETE FROM upchieve.report_reasons
WHERE reason = 'Coach asked me to connect off of UPchieve'
    OR reason = 'Coach made me feel uncomfortable or unsafe'
    OR reason = 'Coach used inappropriate language'
    OR reason = 'Coach talked about inappropriate and offensive topics';

