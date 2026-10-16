/* @name getNTHSChecklistProgressByGroupId */
SELECT
    id,
    nths_group_id,
    item_key,
    status,
    updated_by_user_id,
    created_at,
    updated_at
FROM
    nths_group_checklist_item_progress
WHERE
    nths_group_id = :nthsGroupId!
ORDER BY
    item_key;


/* @name insertNTHSChecklistItemProgressIfMissing */
INSERT INTO nths_group_checklist_item_progress (nths_group_id, item_key, status, updated_by_user_id)
    VALUES (:nthsGroupId!, :itemKey!, :status!, :updatedByUserId!)
ON CONFLICT (nths_group_id, item_key)
    DO NOTHING
RETURNING
    id, nths_group_id, item_key, status, updated_by_user_id, created_at, updated_at;


/* @name upsertNTHSChecklistItemProgress */
INSERT INTO nths_group_checklist_item_progress (nths_group_id, item_key, status, updated_by_user_id)
    VALUES (:nthsGroupId!, :itemKey!, :status!, :updatedByUserId!)
ON CONFLICT (nths_group_id, item_key)
    DO UPDATE SET
        status = EXCLUDED.status, updated_by_user_id = EXCLUDED.updated_by_user_id, updated_at = NOW()
    RETURNING
        id, nths_group_id, item_key, status, updated_by_user_id, created_at, updated_at;

