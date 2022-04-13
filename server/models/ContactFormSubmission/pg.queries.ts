/** Types generated for queries found in "server/models/ContactFormSubmission/contact_form_submission.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const insertContactFormSubmissionByUserIR: any = {"name":"insertContactFormSubmissionByUser","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":161,"b":163,"line":4,"col":5}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":182,"b":188,"line":6,"col":5},{"a":271,"b":277,"line":14,"col":10}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":196,"b":203,"line":7,"col":5}]}},{"name":"topic","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":211,"b":216,"line":8,"col":5}]}}],"usedParamSet":{"id":true,"userId":true,"message":true,"topic":true},"statement":{"body":"INSERT INTO contact_form_submissions (id, user_email, user_id, message, topic, created_at, updated_at)\nSELECT\n    :id!,\n    email,\n    :userId!,\n    :message!,\n    :topic!,\n    NOW(),\n    NOW()\nFROM\n    users\nWHERE\n    id = :userId!\nRETURNING\n    id,\n    user_email,\n    user_id,\n    message,\n    topic,\n    created_at,\n    updated_at","loc":{"a":46,"b":379,"line":2,"col":0}}};

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

const insertContactFormSubmissionByEmailIR: any = {"name":"insertContactFormSubmissionByEmail","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":538,"b":540,"line":27,"col":13}]}},{"name":"userEmail","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":544,"b":553,"line":27,"col":19}]}},{"name":"message","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":557,"b":564,"line":27,"col":32}]}},{"name":"topic","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":568,"b":573,"line":27,"col":43}]}}],"usedParamSet":{"id":true,"userEmail":true,"message":true,"topic":true},"statement":{"body":"INSERT INTO contact_form_submissions (id, user_email, message, topic, created_at, updated_at)\n    VALUES (:id!, :userEmail!, :message!, :topic!, NOW(), NOW())\nRETURNING\n    id, user_email, user_id, message, topic, created_at, updated_at","loc":{"a":431,"b":666,"line":26,"col":0}}};

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


