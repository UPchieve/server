/** Types generated for queries found in "database/seeds/scripts/users/users.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'InsertBanReason' parameters type */
export interface IInsertBanReasonParams {
  name: string;
}

/** 'InsertBanReason' return type */
export interface IInsertBanReasonResult {
  ok: number | null;
}

/** 'InsertBanReason' query type */
export interface IInsertBanReasonQuery {
  params: IInsertBanReasonParams;
  result: IInsertBanReasonResult;
}

const insertBanReasonIR: any = {"name":"insertBanReason","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":117,"b":121,"line":4,"col":17},{"a":279,"b":283,"line":12,"col":49}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO ban_reasons (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM ban_reasons WHERE name=:name!","loc":{"a":28,"b":283,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO ban_reasons (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM ban_reasons WHERE name=:name!
 * ```
 */
export const insertBanReason = new PreparedQuery<IInsertBanReasonParams,IInsertBanReasonResult>(insertBanReasonIR);


/** 'InsertGradeLevel' parameters type */
export interface IInsertGradeLevelParams {
  name: string;
}

/** 'InsertGradeLevel' return type */
export interface IInsertGradeLevelResult {
  ok: number | null;
}

/** 'InsertGradeLevel' query type */
export interface IInsertGradeLevelQuery {
  params: IInsertGradeLevelParams;
  result: IInsertGradeLevelResult;
}

const insertGradeLevelIR: any = {"name":"insertGradeLevel","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":407,"b":411,"line":18,"col":17},{"a":570,"b":574,"line":26,"col":50}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO grade_levels (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM grade_levels WHERE name=:name!","loc":{"a":317,"b":574,"line":16,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO grade_levels (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM grade_levels WHERE name=:name!
 * ```
 */
export const insertGradeLevel = new PreparedQuery<IInsertGradeLevelParams,IInsertGradeLevelResult>(insertGradeLevelIR);


/** 'InsertPhotoIdStatus' parameters type */
export interface IInsertPhotoIdStatusParams {
  name: string;
}

/** 'InsertPhotoIdStatus' return type */
export interface IInsertPhotoIdStatusResult {
  ok: number | null;
}

/** 'InsertPhotoIdStatus' query type */
export interface IInsertPhotoIdStatusQuery {
  params: IInsertPhotoIdStatusParams;
  result: IInsertPhotoIdStatusResult;
}

const insertPhotoIdStatusIR: any = {"name":"insertPhotoIdStatus","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":706,"b":710,"line":32,"col":17},{"a":874,"b":878,"line":40,"col":55}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO photo_id_statuses (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM photo_id_statuses WHERE name=:name!","loc":{"a":611,"b":878,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO photo_id_statuses (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM photo_id_statuses WHERE name=:name!
 * ```
 */
export const insertPhotoIdStatus = new PreparedQuery<IInsertPhotoIdStatusParams,IInsertPhotoIdStatusResult>(insertPhotoIdStatusIR);


/** 'InsertSignupSource' parameters type */
export interface IInsertSignupSourceParams {
  name: string;
}

/** 'InsertSignupSource' return type */
export interface IInsertSignupSourceResult {
  ok: number | null;
}

/** 'InsertSignupSource' query type */
export interface IInsertSignupSourceQuery {
  params: IInsertSignupSourceParams;
  result: IInsertSignupSourceResult;
}

const insertSignupSourceIR: any = {"name":"insertSignupSource","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1006,"b":1010,"line":46,"col":17},{"a":1171,"b":1175,"line":54,"col":52}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO signup_sources (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM signup_sources WHERE name=:name!","loc":{"a":914,"b":1175,"line":44,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO signup_sources (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM signup_sources WHERE name=:name!
 * ```
 */
export const insertSignupSource = new PreparedQuery<IInsertSignupSourceParams,IInsertSignupSourceResult>(insertSignupSourceIR);


/** 'InsertUserRole' parameters type */
export interface IInsertUserRoleParams {
  name: string;
}

/** 'InsertUserRole' return type */
export interface IInsertUserRoleResult {
  ok: number | null;
}

/** 'InsertUserRole' query type */
export interface IInsertUserRoleQuery {
  params: IInsertUserRoleParams;
  result: IInsertUserRoleResult;
}

const insertUserRoleIR: any = {"name":"insertUserRole","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1295,"b":1299,"line":60,"col":17},{"a":1456,"b":1460,"line":68,"col":48}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO user_roles (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM user_roles WHERE name=:name!","loc":{"a":1207,"b":1460,"line":58,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO user_roles (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM user_roles WHERE name=:name!
 * ```
 */
export const insertUserRole = new PreparedQuery<IInsertUserRoleParams,IInsertUserRoleResult>(insertUserRoleIR);


/** 'InsertVolunteerReferenceStatus' parameters type */
export interface IInsertVolunteerReferenceStatusParams {
  name: string;
}

/** 'InsertVolunteerReferenceStatus' return type */
export interface IInsertVolunteerReferenceStatusResult {
  ok: number | null;
}

/** 'InsertVolunteerReferenceStatus' query type */
export interface IInsertVolunteerReferenceStatusQuery {
  params: IInsertVolunteerReferenceStatusParams;
  result: IInsertVolunteerReferenceStatusResult;
}

const insertVolunteerReferenceStatusIR: any = {"name":"insertVolunteerReferenceStatus","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1614,"b":1618,"line":74,"col":17},{"a":1793,"b":1797,"line":82,"col":66}]}}],"usedParamSet":{"name":true},"statement":{"body":"WITH ins AS(\n    INSERT INTO volunteer_reference_statuses (name, created_at, updated_at)\n        VALUES (:name!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id AS ok\n)\nSELECT * FROM ins\nUNION\n    SELECT id AS ok FROM volunteer_reference_statuses WHERE name=:name!","loc":{"a":1508,"b":1797,"line":72,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS(
 *     INSERT INTO volunteer_reference_statuses (name, created_at, updated_at)
 *         VALUES (:name!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id AS ok
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id AS ok FROM volunteer_reference_statuses WHERE name=:name!
 * ```
 */
export const insertVolunteerReferenceStatus = new PreparedQuery<IInsertVolunteerReferenceStatusParams,IInsertVolunteerReferenceStatusResult>(insertVolunteerReferenceStatusIR);


