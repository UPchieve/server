/** Types generated for queries found in "server/models/Teacher/teacher.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateTeacherProfile' parameters type */
export interface ICreateTeacherProfileParams {
  schoolId?: string | null | void;
  userId: string;
}

/** 'CreateTeacherProfile' return type */
export type ICreateTeacherProfileResult = void;

/** 'CreateTeacherProfile' query type */
export interface ICreateTeacherProfileQuery {
  params: ICreateTeacherProfileParams;
  result: ICreateTeacherProfileResult;
}

const createTeacherProfileIR: any = {"usedParamSet":{"userId":true,"schoolId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":93}]},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":104}]}],"statement":"INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)\n    VALUES (:userId!, :schoolId, NOW(), NOW())"};

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
  cleverId?: string | null | void;
  code: string;
  id: string;
  name: string;
  topicId?: number | null | void;
  userId: string;
}

/** 'CreateTeacherClass' return type */
export interface ICreateTeacherClassResult {
  cleverId: string | null;
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

const createTeacherClassIR: any = {"usedParamSet":{"id":true,"userId":true,"name":true,"code":true,"topicId":true,"cleverId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":114}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":124}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":132}]},{"name":"code","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":140}]},{"name":"topicId","required":false,"transform":{"type":"scalar"},"locs":[{"a":143,"b":150}]},{"name":"cleverId","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":161}]}],"statement":"INSERT INTO teacher_classes (id, user_id, name, code, topic_id, clever_id, created_at, updated_at)\n    VALUES (:id!, :userId!, :name!, :code!, :topicId, :cleverId, NOW(), NOW())\nRETURNING\n    id, user_id, name, code, topic_id, clever_id, created_at, updated_at"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO teacher_classes (id, user_id, name, code, topic_id, clever_id, created_at, updated_at)
 *     VALUES (:id!, :userId!, :name!, :code!, :topicId, :cleverId, NOW(), NOW())
 * RETURNING
 *     id, user_id, name, code, topic_id, clever_id, created_at, updated_at
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

const getTeacherByIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":119}]}],"statement":"SELECT\n    user_id,\n    school_id,\n    created_at,\n    updated_at\nFROM\n    teacher_profiles\nWHERE\n    user_id = :userId!"};

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
  cleverId: string | null;
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

const getTeacherClassesByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":403,"b":410}]}],"statement":"SELECT\n    id,\n    clever_id,\n    teacher_classes.user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    COUNT(student_classes.user_id)::int AS total_students,\n    teacher_classes.created_at,\n    teacher_classes.updated_at,\n    teacher_classes.deactivated_on\nFROM\n    teacher_classes\n    LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id\nWHERE\n    teacher_classes.user_id = :userId!\nGROUP BY\n    id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     clever_id,
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
  cleverId: string | null;
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

const getTeacherClassByClassCodeIR: any = {"usedParamSet":{"code":true},"params":[{"name":"code","required":true,"transform":{"type":"scalar"},"locs":[{"a":182,"b":187}]}],"statement":"SELECT\n    id,\n    clever_id,\n    user_id,\n    name,\n    code,\n    active,\n    topic_id,\n    created_at,\n    updated_at,\n    deactivated_on\nFROM\n    teacher_classes\nWHERE\n    code = :code!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     clever_id,
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
  cleverId: string | null;
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

const getTeacherClassByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":308,"b":311}]}],"statement":"SELECT\n    id,\n    clever_id,\n    user_id,\n    name,\n    code,\n    active,\n    topic_id,\n    created_at,\n    updated_at,\n    (\n        SELECT\n            COUNT(*)\n        FROM\n            student_classes\n        WHERE\n            class_id = id)::int AS total_students\nFROM\n    teacher_classes\nWHERE\n    id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     clever_id,
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

const getStudentIdsInTeacherClassIR: any = {"usedParamSet":{"classId":true},"params":[{"name":"classId","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":73}]}],"statement":"SELECT\n    user_id\nFROM\n    student_classes\nWHERE\n    class_id = :classId!"};

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

const updateTeacherClassIR: any = {"usedParamSet":{"name":true,"topicId":true,"id":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":47}]},{"name":"topicId","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":73}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":117}]}],"statement":"UPDATE\n    teacher_classes\nSET\n    name = :name!,\n    topic_id = :topicId!,\n    updated_at = NOW()\nWHERE\n    id = :id!\nRETURNING\n    id,\n    user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    created_at,\n    updated_at"};

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

const deactivateTeacherClassIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":76}]}],"statement":"UPDATE\n    teacher_classes\nSET\n    deactivated_on = NOW()\nWHERE\n    id = :id!\nRETURNING\n    id,\n    user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    created_at,\n    updated_at"};

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


/** 'UpdateTeacherSchool' parameters type */
export interface IUpdateTeacherSchoolParams {
  schoolId?: string | null | void;
  userId: string;
}

/** 'UpdateTeacherSchool' return type */
export type IUpdateTeacherSchoolResult = void;

/** 'UpdateTeacherSchool' query type */
export interface IUpdateTeacherSchoolQuery {
  params: IUpdateTeacherSchoolParams;
  result: IUpdateTeacherSchoolResult;
}

const updateTeacherSchoolIR: any = {"usedParamSet":{"schoolId":true,"userId":true},"params":[{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":48,"b":56}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":78,"b":85}]}],"statement":"UPDATE\n    teacher_profiles\nSET\n    school_id = :schoolId\nWHERE\n    user_id = :userId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     teacher_profiles
 * SET
 *     school_id = :schoolId
 * WHERE
 *     user_id = :userId!
 * ```
 */
export const updateTeacherSchool = new PreparedQuery<IUpdateTeacherSchoolParams,IUpdateTeacherSchoolResult>(updateTeacherSchoolIR);


/** 'UpdateLastSuccessfulCleverSync' parameters type */
export interface IUpdateLastSuccessfulCleverSyncParams {
  teacherId: string;
}

/** 'UpdateLastSuccessfulCleverSync' return type */
export type IUpdateLastSuccessfulCleverSyncResult = void;

/** 'UpdateLastSuccessfulCleverSync' query type */
export interface IUpdateLastSuccessfulCleverSyncQuery {
  params: IUpdateLastSuccessfulCleverSyncParams;
  result: IUpdateLastSuccessfulCleverSyncResult;
}

const updateLastSuccessfulCleverSyncIR: any = {"usedParamSet":{"teacherId":true},"params":[{"name":"teacherId","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":102}]}],"statement":"UPDATE\n    teacher_profiles\nSET\n    last_successful_clever_sync = NOW()\nWHERE\n    user_id = :teacherId!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     teacher_profiles
 * SET
 *     last_successful_clever_sync = NOW()
 * WHERE
 *     user_id = :teacherId!
 * ```
 */
export const updateLastSuccessfulCleverSync = new PreparedQuery<IUpdateLastSuccessfulCleverSyncParams,IUpdateLastSuccessfulCleverSyncResult>(updateLastSuccessfulCleverSyncIR);


