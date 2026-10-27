/* @name insertSessionOffer */
INSERT INTO session_offers (id, session_id, volunteer_id, offered_at, outcome, closed_at, scorecard_version, input, output)
    VALUES (:id!, :sessionId!, :volunteerId!, :offeredAt!, :outcome!, :closedAt!, :scorecardVersion!, :input!, :output!)
RETURNING
    id;

