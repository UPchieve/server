/** Types generated for queries found in "server/models/Teacher/teacher.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateTeacherProfile' parameters type */
export interface ICreateTeacherProfileParams {
  schoolId: string | null | void;
  userId: string;
}

/** 'CreateTeacherProfile' return type */
export type ICreateTeacherProfileResult = void;

/** 'CreateTeacherProfile' query type */
export interface ICreateTeacherProfileQuery {
  params: ICreateTeacherProfileParams;
  result: ICreateTeacherProfileResult;
}

const createTeacherProfileIR: any = {"name":"createTeacherProfile","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":120,"b":126,"line":3,"col":13}]}},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":130,"b":137,"line":3,"col":23}]}}],"usedParamSet":{"userId":true,"schoolId":true},"statement":{"body":"INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)\n    VALUES (:userId!, :schoolId, NOW(), NOW())","loc":{"a":33,"b":152,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)
 *     VALUES (:userId!, :schoolId, NOW(), NOW())
 * ```
 */
export const createTeacherProfile = new PreparedQuery<ICreateTeacherProfileParams,ICreateTeacherProfileResult>(createTeacherProfileIR);


/** 'GetTeacherClassesByUserId' parameters type */
export interface IGetTeacherClassesByUserIdParams {
  userId: string;
}

/** 'GetTeacherClassesByUserId' return type */
export interface IGetTeacherClassesByUserIdResult {
  active: boolean;
  code: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;
  userId: string | null;
}

/** 'GetTeacherClassesByUserId' query type */
export interface IGetTeacherClassesByUserIdQuery {
  params: IGetTeacherClassesByUserIdParams;
  result: IGetTeacherClassesByUserIdResult;
}

const getTeacherClassesByUserIdIR: any = {"name":"getTeacherClassesByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":324,"b":330,"line":17,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    name,\n    code,\n    active,\n    created_at,\n    updated_at\nFROM\n    teacher_classes\nWHERE\n    user_id = :userId!","loc":{"a":195,"b":330,"line":7,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     name,
 *     code,
 *     active,
 *     created_at,
 *     updated_at
 * FROM
 *     teacher_classes
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getTeacherClassesByUserId = new PreparedQuery<IGetTeacherClassesByUserIdParams,IGetTeacherClassesByUserIdResult>(getTeacherClassesByUserIdIR);


