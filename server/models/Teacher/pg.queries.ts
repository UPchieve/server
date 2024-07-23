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
  topicId: number | null | void;
  userId: string;
}

/** 'CreateTeacherClass' return type */
export interface ICreateTeacherClassResult {
  active: boolean;
  code: string;
  createdAt: Date;
  id: string;
  name: string;
  topicId: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'CreateTeacherClass' query type */
export interface ICreateTeacherClassQuery {
  params: ICreateTeacherClassParams;
  result: ICreateTeacherClassResult;
}

const createTeacherClassIR: any = {"name":"createTeacherClass","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":297,"b":299,"line":8,"col":13}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":303,"b":309,"line":8,"col":19}]}},{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":313,"b":317,"line":8,"col":29}]}},{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":321,"b":325,"line":8,"col":37}]}},{"name":"topicId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":329,"b":335,"line":8,"col":45}]}}],"usedParamSet":{"id":true,"userId":true,"name":true,"code":true,"topicId":true},"statement":{"body":"INSERT INTO teacher_classes (id, user_id, name, code, topic_id, active, created_at, updated_at)\n    VALUES (:id!, :userId!, :name!, :code!, :topicId, TRUE, NOW(), NOW())\nRETURNING\n    id, user_id, name, code, topic_id, active, created_at, updated_at","loc":{"a":188,"b":436,"line":7,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO teacher_classes (id, user_id, name, code, topic_id, active, created_at, updated_at)
 *     VALUES (:id!, :userId!, :name!, :code!, :topicId, TRUE, NOW(), NOW())
 * RETURNING
 *     id, user_id, name, code, topic_id, active, created_at, updated_at
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
  id: string;
  name: string;
  totalStudents: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'GetTeacherClassesByUserId' query type */
export interface IGetTeacherClassesByUserIdQuery {
  params: IGetTeacherClassesByUserIdParams;
  result: IGetTeacherClassesByUserIdResult;
}

const getTeacherClassesByUserIdIR: any = {"name":"getTeacherClassesByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":818,"b":824,"line":27,"col":31}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    id,\n    teacher_classes.user_id,\n    name,\n    code,\n    active,\n    COUNT(student_classes.user_id)::int AS total_students,\n    teacher_classes.created_at,\n    teacher_classes.updated_at\nFROM\n    teacher_classes\n    LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id\nWHERE\n    teacher_classes.user_id = :userId!\nGROUP BY\n    id","loc":{"a":479,"b":840,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     teacher_classes.user_id,
 *     name,
 *     code,
 *     active,
 *     COUNT(student_classes.user_id)::int AS total_students,
 *     teacher_classes.created_at,
 *     teacher_classes.updated_at
 * FROM
 *     teacher_classes
 *     LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id
 * WHERE
 *     teacher_classes.user_id = :userId!
 * GROUP BY
 *     id
 * ```
 */
export const getTeacherClassesByUserId = new PreparedQuery<IGetTeacherClassesByUserIdParams,IGetTeacherClassesByUserIdResult>(getTeacherClassesByUserIdIR);


/** 'GetTeacherClassByClassCode' parameters type */
export interface IGetTeacherClassByClassCodeParams {
  code: string;
}

/** 'GetTeacherClassByClassCode' return type */
export interface IGetTeacherClassByClassCodeResult {
  active: boolean;
  code: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;
  userId: string | null;
}

/** 'GetTeacherClassByClassCode' query type */
export interface IGetTeacherClassByClassCodeQuery {
  params: IGetTeacherClassByClassCodeParams;
  result: IGetTeacherClassByClassCodeResult;
}

const getTeacherClassByClassCodeIR: any = {"name":"getTeacherClassByClassCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1010,"b":1014,"line":43,"col":12}]}}],"usedParamSet":{"code":true},"statement":{"body":"SELECT\n    user_id,\n    name,\n    code,\n    active,\n    created_at,\n    updated_at\nFROM\n    teacher_classes\nWHERE\n    code = :code!","loc":{"a":884,"b":1014,"line":33,"col":0}}};

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
 *     code = :code!
 * ```
 */
export const getTeacherClassByClassCode = new PreparedQuery<IGetTeacherClassByClassCodeParams,IGetTeacherClassByClassCodeResult>(getTeacherClassByClassCodeIR);


/** 'GetStudentIdsInTeacherClass' parameters type */
export interface IGetStudentIdsInTeacherClassParams {
  classId: string;
}

/** 'GetStudentIdsInTeacherClass' return type */
export interface IGetStudentIdsInTeacherClassResult {
  userId: string;
}

/** 'GetStudentIdsInTeacherClass' query type */
export interface IGetStudentIdsInTeacherClassQuery {
  params: IGetStudentIdsInTeacherClassParams;
  result: IGetStudentIdsInTeacherClassResult;
}

const getStudentIdsInTeacherClassIR: any = {"name":"getStudentIdsInTeacherClass","params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1125,"b":1132,"line":52,"col":16}]}}],"usedParamSet":{"classId":true},"statement":{"body":"SELECT\n    user_id\nFROM\n    student_classes\nWHERE\n    class_id = :classId!","loc":{"a":1059,"b":1132,"line":47,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id
 * FROM
 *     student_classes
 * WHERE
 *     class_id = :classId!
 * ```
 */
export const getStudentIdsInTeacherClass = new PreparedQuery<IGetStudentIdsInTeacherClassParams,IGetStudentIdsInTeacherClassResult>(getStudentIdsInTeacherClassIR);


