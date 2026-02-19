/* @name getRulesActionsFromFlagId */

SELECT 
    mrf.rule_id,
    mra.action_id,
    ma.action_name,
    mr.name
FROM 
    moderation_rules_flags mrf
JOIN 
    moderation_rule_actions mra
    ON mrf.rule_id = mra.rule_id
JOIN 
    moderation_actions ma
    ON mra.action_id = ma.id
JOIN
    moderation_rules mr
    ON mrf.rule_id = mr.id
WHERE
    mrf.flag_id = :flagId!;


