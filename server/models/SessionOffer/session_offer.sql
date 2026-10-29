/* @name insertSessionOffer */
INSERT INTO session_offers (id, session_id, volunteer_id, offered_at, outcome, closed_at, scorecard_version, output)
    VALUES (:id!, :sessionId!, :volunteerId!, :offeredAt!, :outcome!, :closedAt!, :scorecardVersion!, :output!)
RETURNING
    id;

