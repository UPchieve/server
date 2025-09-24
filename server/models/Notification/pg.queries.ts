/** Types generated for queries found in "server/models/Notification/notification.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'GetTextNotificationsByVolunteerId' parameters type */
export interface IGetTextNotificationsByVolunteerIdParams {
  userId: string;
}

/** 'GetTextNotificationsByVolunteerId' return type */
export interface IGetTextNotificationsByVolunteerIdResult {
  id: string;
  messageId: string | null;
  method: string;
  priorityGroup: string;
  sentAt: Date | null;
  sessionId: string | null;
  type: string;
  volunteer: string;
  wasSuccessful: boolean | null;
}

/** 'GetTextNotificationsByVolunteerId' query type */
export interface IGetTextNotificationsByVolunteerIdQuery {
  params: IGetTextNotificationsByVolunteerIdParams;
  result: IGetTextNotificationsByVolunteerIdResult;
}

const getTextNotificationsByVolunteerIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":631,"b":638}]}],"statement":"SELECT\n    notifications.id,\n    user_id AS volunteer,\n    sent_at,\n    successful AS was_successful,\n    message_carrier_id AS message_id,\n    session_id,\n    notification_types.type AS TYPE,\n    notification_priority_groups.name AS priority_group,\n    notification_methods.method AS method\nFROM\n    notifications\n    LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id\n    LEFT JOIN notification_types ON notifications.type_id = notification_types.id\n    LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id\nWHERE\n    notifications.user_id = :userId!\n    AND notifications.method_id = 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.id,
 *     user_id AS volunteer,
 *     sent_at,
 *     successful AS was_successful,
 *     message_carrier_id AS message_id,
 *     session_id,
 *     notification_types.type AS TYPE,
 *     notification_priority_groups.name AS priority_group,
 *     notification_methods.method AS method
 * FROM
 *     notifications
 *     LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id
 *     LEFT JOIN notification_types ON notifications.type_id = notification_types.id
 *     LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id
 * WHERE
 *     notifications.user_id = :userId!
 *     AND notifications.method_id = 1
 * ```
 */
export const getTextNotificationsByVolunteerId = new PreparedQuery<IGetTextNotificationsByVolunteerIdParams,IGetTextNotificationsByVolunteerIdResult>(getTextNotificationsByVolunteerIdIR);


/** 'GetSessionNotificationsWithSessionId' parameters type */
export interface IGetSessionNotificationsWithSessionIdParams {
  sessionId: string;
}

/** 'GetSessionNotificationsWithSessionId' return type */
export interface IGetSessionNotificationsWithSessionIdResult {
  firstName: string;
  id: string;
  messageId: string | null;
  method: string;
  priorityGroup: string;
  sentAt: Date | null;
  sessionId: string | null;
  type: string;
  volunteerPartnerOrg: string;
  wasSuccessful: boolean | null;
}

/** 'GetSessionNotificationsWithSessionId' query type */
export interface IGetSessionNotificationsWithSessionIdQuery {
  params: IGetSessionNotificationsWithSessionIdParams;
  result: IGetSessionNotificationsWithSessionIdResult;
}

const getSessionNotificationsWithSessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":956,"b":966}]}],"statement":"SELECT\n    notifications.id,\n    sent_at,\n    successful AS was_successful,\n    message_carrier_id AS message_id,\n    session_id,\n    notification_types.type AS TYPE,\n    notification_priority_groups.name AS priority_group,\n    notification_methods.method AS method,\n    volunteer_partner_orgs.key AS volunteer_partner_org,\n    users.first_name AS first_name\nFROM\n    notifications\n    LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id\n    LEFT JOIN notification_types ON notifications.type_id = notification_types.id\n    LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id\n    LEFT JOIN users ON notifications.user_id = users.id\n    LEFT JOIN volunteer_profiles ON notifications.user_id = volunteer_profiles.user_id\n    LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id\nWHERE\n    notifications.session_id = :sessionId!\n    AND notification_types.type IS NOT NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     notifications.id,
 *     sent_at,
 *     successful AS was_successful,
 *     message_carrier_id AS message_id,
 *     session_id,
 *     notification_types.type AS TYPE,
 *     notification_priority_groups.name AS priority_group,
 *     notification_methods.method AS method,
 *     volunteer_partner_orgs.key AS volunteer_partner_org,
 *     users.first_name AS first_name
 * FROM
 *     notifications
 *     LEFT JOIN notification_methods ON notifications.method_id = notification_methods.id
 *     LEFT JOIN notification_types ON notifications.type_id = notification_types.id
 *     LEFT JOIN notification_priority_groups ON notifications.priority_group_id = notification_priority_groups.id
 *     LEFT JOIN users ON notifications.user_id = users.id
 *     LEFT JOIN volunteer_profiles ON notifications.user_id = volunteer_profiles.user_id
 *     LEFT JOIN volunteer_partner_orgs ON volunteer_profiles.volunteer_partner_org_id = volunteer_partner_orgs.id
 * WHERE
 *     notifications.session_id = :sessionId!
 *     AND notification_types.type IS NOT NULL
 * ```
 */
export const getSessionNotificationsWithSessionId = new PreparedQuery<IGetSessionNotificationsWithSessionIdParams,IGetSessionNotificationsWithSessionIdResult>(getSessionNotificationsWithSessionIdIR);


/** 'CreateEmailNotification' parameters type */
export interface ICreateEmailNotificationParams {
  emailTemplateId: string;
  sessionId?: string | null | void;
  userId: string;
}

/** 'CreateEmailNotification' return type */
export interface ICreateEmailNotificationResult {
  ok: string;
}

/** 'CreateEmailNotification' query type */
export interface ICreateEmailNotificationQuery {
  params: ICreateEmailNotificationParams;
  result: ICreateEmailNotificationResult;
}

const createEmailNotificationIR: any = {"usedParamSet":{"userId":true,"sessionId":true,"emailTemplateId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":138,"b":147}]},{"name":"emailTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":170}]}],"statement":"INSERT INTO notifications (id, user_id, session_id, email_template_id, method_id, sent_at)\nSELECT\n    generate_ulid (),\n    :userId!,\n    :sessionId,\n    :emailTemplateId!,\n    (\n        SELECT\n            id\n        FROM\n            notification_methods\n        WHERE\n            method = 'email'), NOW()\nRETURNING\n    id AS ok"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notifications (id, user_id, session_id, email_template_id, method_id, sent_at)
 * SELECT
 *     generate_ulid (),
 *     :userId!,
 *     :sessionId,
 *     :emailTemplateId!,
 *     (
 *         SELECT
 *             id
 *         FROM
 *             notification_methods
 *         WHERE
 *             method = 'email'), NOW()
 * RETURNING
 *     id AS ok
 * ```
 */
export const createEmailNotification = new PreparedQuery<ICreateEmailNotificationParams,ICreateEmailNotificationResult>(createEmailNotificationIR);


/** 'GetEmailNotificationsByTemplateId' parameters type */
export interface IGetEmailNotificationsByTemplateIdParams {
  emailTemplateId: string;
  end?: DateOrString | null | void;
  start?: DateOrString | null | void;
  userId?: string | null | void;
}

/** 'GetEmailNotificationsByTemplateId' return type */
export interface IGetEmailNotificationsByTemplateIdResult {
  emailTemplateId: string | null;
  sentAt: Date | null;
  sessionId: string | null;
  userId: string;
}

/** 'GetEmailNotificationsByTemplateId' query type */
export interface IGetEmailNotificationsByTemplateIdQuery {
  params: IGetEmailNotificationsByTemplateIdParams;
  result: IGetEmailNotificationsByTemplateIdResult;
}

const getEmailNotificationsByTemplateIdIR: any = {"usedParamSet":{"emailTemplateId":true,"userId":true,"start":true,"end":true},"params":[{"name":"emailTemplateId","required":true,"transform":{"type":"scalar"},"locs":[{"a":253,"b":269}]},{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":280,"b":286},{"a":323,"b":329}]},{"name":"start","required":false,"transform":{"type":"scalar"},"locs":[{"a":348,"b":353},{"a":400,"b":405}]},{"name":"end","required":false,"transform":{"type":"scalar"},"locs":[{"a":435,"b":438},{"a":489,"b":492}]}],"statement":"SELECT\n    user_id,\n    session_id,\n    email_template_id,\n    sent_at\nFROM\n    notifications\n    JOIN notification_methods ON notifications.method_id = notification_methods.id\nWHERE\n    notification_methods.method = 'email'\n    AND email_template_id = :emailTemplateId!\n    AND (:userId::uuid IS NULL\n        OR user_id = :userId::uuid)\n    AND ((:start)::timestamptz IS NULL\n        OR sent_at >= (:start)::timestamptz\n        AND ((:end)::timestamptz IS NULL\n            OR sent_at <= (:end)::timestamptz))"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     session_id,
 *     email_template_id,
 *     sent_at
 * FROM
 *     notifications
 *     JOIN notification_methods ON notifications.method_id = notification_methods.id
 * WHERE
 *     notification_methods.method = 'email'
 *     AND email_template_id = :emailTemplateId!
 *     AND (:userId::uuid IS NULL
 *         OR user_id = :userId::uuid)
 *     AND ((:start)::timestamptz IS NULL
 *         OR sent_at >= (:start)::timestamptz
 *         AND ((:end)::timestamptz IS NULL
 *             OR sent_at <= (:end)::timestamptz))
 * ```
 */
export const getEmailNotificationsByTemplateId = new PreparedQuery<IGetEmailNotificationsByTemplateIdParams,IGetEmailNotificationsByTemplateIdResult>(getEmailNotificationsByTemplateIdIR);


