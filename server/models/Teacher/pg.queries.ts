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


/** 'GetTeacherById' parameters type */
export interface IGetTeacherByIdParams {
  userId: string;
}

/** 'GetTeacherById' return type */
export interface IGetTeacherByIdResult {
  createdAt: Date;
  schoolId: string | null;
  updatedAt: Date;
  userId: string;
}

/** 'GetTeacherById' query type */
export interface IGetTeacherByIdQuery {
  params: IGetTeacherByIdParams;
  result: IGetTeacherByIdResult;
}

const getTeacherByIdIR: any = {"name":"getTeacherById","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":581,"b":587,"line":22,"col":15}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    user_id,\n    school_id,\n    created_at,\n    updated_at\nFROM\n    teacher_profiles\nWHERE\n    user_id = :userId!","loc":{"a":468,"b":587,"line":14,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     user_id,
 *     school_id,
 *     created_at,
 *     updated_at
 * FROM
 *     teacher_profiles
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const getTeacherById = new PreparedQuery<IGetTeacherByIdParams,IGetTeacherByIdResult>(getTeacherByIdIR);


/** 'GetTeacherClassesByUserId' parameters type */
export interface IGetTeacherClassesByUserIdParams {
  userId: string;
}

/** 'GetTeacherClassesByUserId' return type */
export interface IGetTeacherClassesByUserIdResult {
  active: boolean;
  code: string;
  createdAt: Date;
  deactivatedOn: Date | null;
  id: string;
  name: string;
  topicId: number | null;
  totalStudents: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'GetTeacherClassesByUserId' query type */
export interface IGetTeacherClassesByUserIdQuery {
  params: IGetTeacherClassesByUserIdParams;
  result: IGetTeacherClassesByUserIdResult;
}

const getTeacherClassesByUserIdIR: any = {"name":"getTeacherClassesByUserId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1019,"b":1025,"line":41,"col":31}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    id,\n    teacher_classes.user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    COUNT(student_classes.user_id)::int AS total_students,\n    teacher_classes.created_at,\n    teacher_classes.updated_at,\n    teacher_classes.deactivated_on\nFROM\n    teacher_classes\n    LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id\nWHERE\n    teacher_classes.user_id = :userId!\nGROUP BY\n    id","loc":{"a":630,"b":1041,"line":26,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     teacher_classes.user_id,
 *     name,
 *     code,
 *     topic_id,
 *     active,
 *     COUNT(student_classes.user_id)::int AS total_students,
 *     teacher_classes.created_at,
 *     teacher_classes.updated_at,
 *     teacher_classes.deactivated_on
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
  deactivatedOn: Date | null;
  id: string;
  name: string;
  topicId: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'GetTeacherClassByClassCode' query type */
export interface IGetTeacherClassByClassCodeQuery {
  params: IGetTeacherClassByClassCodeParams;
  result: IGetTeacherClassByClassCodeResult;
}

const getTeacherClassByClassCodeIR: any = {"name":"getTeacherClassByClassCode","params":[{"name":"code","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1253,"b":1257,"line":60,"col":12}]}}],"usedParamSet":{"code":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    name,\n    code,\n    active,\n    topic_id,\n    created_at,\n    updated_at,\n    deactivated_on\nFROM\n    teacher_classes\nWHERE\n    code = :code!","loc":{"a":1085,"b":1257,"line":47,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     name,
 *     code,
 *     active,
 *     topic_id,
 *     created_at,
 *     updated_at,
 *     deactivated_on
 * FROM
 *     teacher_classes
 * WHERE
 *     code = :code!
 * ```
 */
export const getTeacherClassByClassCode = new PreparedQuery<IGetTeacherClassByClassCodeParams,IGetTeacherClassByClassCodeResult>(getTeacherClassByClassCodeIR);


/** 'GetTeacherClassById' parameters type */
export interface IGetTeacherClassByIdParams {
  id: string;
}

/** 'GetTeacherClassById' return type */
export interface IGetTeacherClassByIdResult {
  active: boolean;
  code: string;
  createdAt: Date;
  id: string;
  name: string;
  topicId: number | null;
  totalStudents: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'GetTeacherClassById' query type */
export interface IGetTeacherClassByIdQuery {
  params: IGetTeacherClassByIdParams;
  result: IGetTeacherClassByIdResult;
}

const getTeacherClassByIdIR: any = {"name":"getTeacherClassById","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1588,"b":1590,"line":83,"col":10}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT\n    id,\n    user_id,\n    name,\n    code,\n    active,\n    topic_id,\n    created_at,\n    updated_at,\n    (\n        SELECT\n            COUNT(*)\n        FROM\n            student_classes\n        WHERE\n            class_id = id)::int AS total_students\nFROM\n    teacher_classes\nWHERE\n    id = :id!","loc":{"a":1294,"b":1590,"line":64,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     name,
 *     code,
 *     active,
 *     topic_id,
 *     created_at,
 *     updated_at,
 *     (
 *         SELECT
 *             COUNT(*)
 *         FROM
 *             student_classes
 *         WHERE
 *             class_id = id)::int AS total_students
 * FROM
 *     teacher_classes
 * WHERE
 *     id = :id!
 * ```
 */
export const getTeacherClassById = new PreparedQuery<IGetTeacherClassByIdParams,IGetTeacherClassByIdResult>(getTeacherClassByIdIR);


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

const getStudentIdsInTeacherClassIR: any = {"name":"getStudentIdsInTeacherClass","params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1701,"b":1708,"line":92,"col":16}]}}],"usedParamSet":{"classId":true},"statement":{"body":"SELECT\n    user_id\nFROM\n    student_classes\nWHERE\n    class_id = :classId!","loc":{"a":1635,"b":1708,"line":87,"col":0}}};

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


/** 'UpdateTeacherClass' parameters type */
export interface IUpdateTeacherClassParams {
  id: string;
  name: string;
  topicId: number;
}

/** 'UpdateTeacherClass' return type */
export interface IUpdateTeacherClassResult {
  active: boolean;
  code: string;
  createdAt: Date;
  id: string;
  name: string;
  topicId: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'UpdateTeacherClass' query type */
export interface IUpdateTeacherClassQuery {
  params: IUpdateTeacherClassParams;
  result: IUpdateTeacherClassResult;
}

const updateTeacherClassIR: any = {"name":"updateTeacherClass","params":[{"name":"name","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1787,"b":1791,"line":99,"col":12}]}},{"name":"topicId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1810,"b":1817,"line":100,"col":16}]}},{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1859,"b":1861,"line":103,"col":10}]}}],"usedParamSet":{"name":true,"topicId":true,"id":true},"statement":{"body":"UPDATE\n    teacher_classes\nSET\n    name = :name!,\n    topic_id = :topicId!,\n    updated_at = NOW()\nWHERE\n    id = :id!\nRETURNING\n    id,\n    user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    created_at,\n    updated_at","loc":{"a":1744,"b":1969,"line":96,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     teacher_classes
 * SET
 *     name = :name!,
 *     topic_id = :topicId!,
 *     updated_at = NOW()
 * WHERE
 *     id = :id!
 * RETURNING
 *     id,
 *     user_id,
 *     name,
 *     code,
 *     topic_id,
 *     active,
 *     created_at,
 *     updated_at
 * ```
 */
export const updateTeacherClass = new PreparedQuery<IUpdateTeacherClassParams,IUpdateTeacherClassResult>(updateTeacherClassIR);


/** 'DeactivateTeacherClass' parameters type */
export interface IDeactivateTeacherClassParams {
  id: string;
}

/** 'DeactivateTeacherClass' return type */
export interface IDeactivateTeacherClassResult {
  active: boolean;
  code: string;
  createdAt: Date;
  id: string;
  name: string;
  topicId: number | null;
  updatedAt: Date;
  userId: string | null;
}

/** 'DeactivateTeacherClass' query type */
export interface IDeactivateTeacherClassQuery {
  params: IDeactivateTeacherClassParams;
  result: IDeactivateTeacherClassResult;
}

const deactivateTeacherClassIR: any = {"name":"deactivateTeacherClass","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2083,"b":2085,"line":121,"col":10}]}}],"usedParamSet":{"id":true},"statement":{"body":"UPDATE\n    teacher_classes\nSET\n    deactivated_on = NOW()\nWHERE\n    id = :id!\nRETURNING\n    id,\n    user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    created_at,\n    updated_at","loc":{"a":2009,"b":2193,"line":116,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     teacher_classes
 * SET
 *     deactivated_on = NOW()
 * WHERE
 *     id = :id!
 * RETURNING
 *     id,
 *     user_id,
 *     name,
 *     code,
 *     topic_id,
 *     active,
 *     created_at,
 *     updated_at
 * ```
 */
export const deactivateTeacherClass = new PreparedQuery<IDeactivateTeacherClassParams,IDeactivateTeacherClassResult>(deactivateTeacherClassIR);


