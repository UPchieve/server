/** Types generated for queries found in "server/models/Certifications/certification.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type stringArray = (string)[];

/** 'AddCertificationsForPassedQuiz' parameters type */
export interface IAddCertificationsForPassedQuizParams {
  quizzes: stringArray;
  userId: string;
}

/** 'AddCertificationsForPassedQuiz' return type */
export interface IAddCertificationsForPassedQuizResult {
  name: string | null;
}

/** 'AddCertificationsForPassedQuiz' query type */
export interface IAddCertificationsForPassedQuizQuery {
  params: IAddCertificationsForPassedQuizParams;
  result: IAddCertificationsForPassedQuizResult;
}

const addCertificationsForPassedQuizIR: any = {"name":"addCertificationsForPassedQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":140,"b":146,"line":4,"col":5}]}},{"name":"quizzes","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":390,"b":397,"line":15,"col":25}]}}],"usedParamSet":{"userId":true,"quizzes":true},"statement":{"body":"INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)\nSELECT\n    :userId!,\n    subquery.certification_id,\n    NOW(),\n    NOW()\nFROM (\n    SELECT\n        certification_id\n    FROM\n        quiz_certification_grants\n    LEFT JOIN quizzes ON quizzes.id = quiz_certification_grants.quiz_id\nWHERE\n    quizzes.name = ANY (:quizzes!)) AS subquery\nON CONFLICT\n    DO NOTHING\nRETURNING (\n    SELECT\n        name\n    FROM\n        certifications\n    WHERE\n        id = certification_id)","loc":{"a":43,"b":547,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
 * SELECT
 *     :userId!,
 *     subquery.certification_id,
 *     NOW(),
 *     NOW()
 * FROM (
 *     SELECT
 *         certification_id
 *     FROM
 *         quiz_certification_grants
 *     LEFT JOIN quizzes ON quizzes.id = quiz_certification_grants.quiz_id
 * WHERE
 *     quizzes.name = ANY (:quizzes!)) AS subquery
 * ON CONFLICT
 *     DO NOTHING
 * RETURNING (
 *     SELECT
 *         name
 *     FROM
 *         certifications
 *     WHERE
 *         id = certification_id)
 * ```
 */
export const addCertificationsForPassedQuiz = new PreparedQuery<IAddCertificationsForPassedQuizParams,IAddCertificationsForPassedQuizResult>(addCertificationsForPassedQuizIR);


/** 'GetVolunteersWithCerts' parameters type */
export type IGetVolunteersWithCertsParams = void;

/** 'GetVolunteersWithCerts' return type */
export interface IGetVolunteersWithCertsResult {
  lastAttemptedAt: Date;
  name: string;
  passed: boolean;
  tries: number;
  userId: string;
}

/** 'GetVolunteersWithCerts' query type */
export interface IGetVolunteersWithCertsQuery {
  params: IGetVolunteersWithCertsParams;
  result: IGetVolunteersWithCertsResult;
}

const getVolunteersWithCertsIR: any = {"name":"getVolunteersWithCerts","params":[],"usedParamSet":{},"statement":{"body":"SELECT\n    user_id,\n    attempts AS tries,\n    users_quizzes.updated_at AS last_attempted_at,\n    passed,\n    quizzes.name\nFROM\n    users_quizzes\n    JOIN quizzes ON users_quizzes.quiz_id = quizzes.id","loc":{"a":587,"b":786,"line":28,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     attempts AS tries,
 *     users_quizzes.updated_at AS last_attempted_at,
 *     passed,
 *     quizzes.name
 * FROM
 *     users_quizzes
 *     JOIN quizzes ON users_quizzes.quiz_id = quizzes.id
 * ```
 */
export const getVolunteersWithCerts = new PreparedQuery<IGetVolunteersWithCertsParams,IGetVolunteersWithCertsResult>(getVolunteersWithCertsIR);


