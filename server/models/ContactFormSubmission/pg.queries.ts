/** Types generated for queries found in "server/models/ContactFormSubmission/contact_form_submission.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertContactFormSubmissionByUser' parameters type */
export interface IInsertContactFormSubmissionByUserParams {
  id: string;
  message: string;
  topic: string;
  userId: string;
}

/** 'InsertContactFormSubmissionByUser' return type */
export interface IInsertContactFormSubmissionByUserResult {
  createdAt: Date;
  id: string;
  message: string;
  topic: string;
  updatedAt: Date;
  userEmail: string | null;
  userId: string | null;
}

/** 'InsertContactFormSubmissionByUser' query type */
export interface IInsertContactFormSubmissionByUserQuery {
  params: IInsertContactFormSubmissionByUserParams;
  result: IInsertContactFormSubmissionByUserResult;
}

const insertContactFormSubmissionByUserIR: any = {"usedParamSet":{"id":true,"userId":true,"message":true,"topic":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":117}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":142},{"a":224,"b":231}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":149,"b":157}]},{"name":"topic","required":true,"transform":{"type":"scalar"},"locs":[{"a":164,"b":170}]}],"statement":"INSERT INTO contact_form_submissions (id, user_email, user_id, message, topic, created_at, updated_at)\nSELECT\n    :id!,\n    email,\n    :userId!,\n    :message!,\n    :topic!,\n    NOW(),\n    NOW()\nFROM\n    users\nWHERE\n    id = :userId!\nRETURNING\n    id,\n    user_email,\n    user_id,\n    message,\n    topic,\n    created_at,\n    updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO contact_form_submissions (id, user_email, user_id, message, topic, created_at, updated_at)
 * SELECT
 *     :id!,
 *     email,
 *     :userId!,
 *     :message!,
 *     :topic!,
 *     NOW(),
 *     NOW()
 * FROM
 *     users
 * WHERE
 *     id = :userId!
 * RETURNING
 *     id,
 *     user_email,
 *     user_id,
 *     message,
 *     topic,
 *     created_at,
 *     updated_at
 * ```
 */
export const insertContactFormSubmissionByUser = new PreparedQuery<IInsertContactFormSubmissionByUserParams,IInsertContactFormSubmissionByUserResult>(insertContactFormSubmissionByUserIR);


/** 'InsertContactFormSubmissionByEmail' parameters type */
export interface IInsertContactFormSubmissionByEmailParams {
  id: string;
  message: string;
  topic: string;
  userEmail: string;
}

/** 'InsertContactFormSubmissionByEmail' return type */
export interface IInsertContactFormSubmissionByEmailResult {
  createdAt: Date;
  id: string;
  message: string;
  topic: string;
  updatedAt: Date;
  userEmail: string | null;
  userId: string | null;
}

/** 'InsertContactFormSubmissionByEmail' query type */
export interface IInsertContactFormSubmissionByEmailQuery {
  params: IInsertContactFormSubmissionByEmailParams;
  result: IInsertContactFormSubmissionByEmailResult;
}

const insertContactFormSubmissionByEmailIR: any = {"usedParamSet":{"id":true,"userEmail":true,"message":true,"topic":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":109}]},{"name":"userEmail","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":122}]},{"name":"message","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":133}]},{"name":"topic","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":142}]}],"statement":"INSERT INTO contact_form_submissions (id, user_email, message, topic, created_at, updated_at)\n    VALUES (:id!, :userEmail!, :message!, :topic!, NOW(), NOW())\nRETURNING\n    id, user_email, user_id, message, topic, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO contact_form_submissions (id, user_email, message, topic, created_at, updated_at)
 *     VALUES (:id!, :userEmail!, :message!, :topic!, NOW(), NOW())
 * RETURNING
 *     id, user_email, user_id, message, topic, created_at, updated_at
 * ```
 */
export const insertContactFormSubmissionByEmail = new PreparedQuery<IInsertContactFormSubmissionByEmailParams,IInsertContactFormSubmissionByEmailResult>(insertContactFormSubmissionByEmailIR);


