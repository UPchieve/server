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


/** 'CreateTeacherClass' parameters type */
export interface ICreateTeacherClassParams {
  code: string;
  id: string;
  name: string;
  userId: string;
}

/** 'CreateTeacherClass' return type */
export interface ICreateTeacherClassResult {
  active: boolean;
  code: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;
  userId: string | null;
}

/** 'CreateTeacherClass' query type */
export interface ICreateTeacherClassQuery {
  params: ICreateTeacherClassParams;
  result: ICreateTeacherClassResult;
}

const createTeacherClassIR: any = {"name":"createTeacherClass","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":287,"b":289,"line":8,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":293,"b":299,"line":8,"col":19}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":303,"b":307,"line":8,"col":29}]}},{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":311,"b":315,"line":8,"col":37}]}}],"usedParamSet":{"id":true,"userId":true,"name":true,"code":true},"statement":{"body":"INSERT INTO teacher_classes (id, user_id, name, code, active, created_at, updated_at)\n    VALUES (:id!, :userId!, :name!, :code!, TRUE, NOW(), NOW())\nRETURNING\n    user_id, name, code, active, created_at, updated_at","loc":{"a":188,"b":402,"line":7,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO teacher_classes (id, user_id, name, code, active, created_at, updated_at)
 *     VALUES (:id!, :userId!, :name!, :code!, TRUE, NOW(), NOW())
 * RETURNING
 *     user_id, name, code, active, created_at, updated_at
 * ```
 */
export const createTeacherClass = new PreparedQuery<ICreateTeacherClassParams,ICreateTeacherClassResult>(createTeacherClassIR);


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

const getTeacherClassesByUserIdIR: any = {"name":"getTeacherClassesByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":574,"b":580,"line":24,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    name,\n    code,\n    active,\n    created_at,\n    updated_at\nFROM\n    teacher_classes\nWHERE\n    user_id = :userId!","loc":{"a":445,"b":580,"line":14,"col":0}}};

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


