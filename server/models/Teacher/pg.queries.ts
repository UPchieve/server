/** Types generated for queries found in "server/models/Teacher/teacher.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'CreateTeacherProfile' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateTeacherProfileResult = never;

/** Query 'CreateTeacherProfile' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateTeacherProfileParams = never;

const createTeacherProfileIR: any = {"usedParamSet":{"userId":true,"schoolId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":93}]},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":96,"b":104}]}],"statement":"INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)\n    VALUES (:userId!, :schoolId, NOW(), NOW())"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO teacher_profiles (user_id, school_id, created_at, updated_at)
 *     VALUES (:userId!, :schoolId, NOW(), NOW())
 * ```
 */
export const createTeacherProfile = new PreparedQuery<ICreateTeacherProfileParams,ICreateTeacherProfileResult>(createTeacherProfileIR);


/** Query 'CreateTeacherClass' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateTeacherClassResult = never;

/** Query 'CreateTeacherClass' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateTeacherClassParams = never;

const createTeacherClassIR: any = {"usedParamSet":{"id":true,"userId":true,"name":true,"code":true,"topicId":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":111}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":114,"b":121}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":129}]},{"name":"code","required":true,"transform":{"type":"scalar"},"locs":[{"a":132,"b":137}]},{"name":"topicId","required":false,"transform":{"type":"scalar"},"locs":[{"a":140,"b":147}]}],"statement":"INSERT INTO teacher_classes (id, user_id, name, code, topic_id, active, created_at, updated_at)\n    VALUES (:id!, :userId!, :name!, :code!, :topicId, TRUE, NOW(), NOW())\nRETURNING\n    id, user_id, name, code, topic_id, active, created_at, updated_at"};

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


/** Query 'GetTeacherById' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTeacherByIdResult = never;

/** Query 'GetTeacherById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTeacherByIdParams = never;

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


/** Query 'GetTeacherClassesByUserId' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTeacherClassesByUserIdResult = never;

/** Query 'GetTeacherClassesByUserId' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTeacherClassesByUserIdParams = never;

const getTeacherClassesByUserIdIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":388,"b":395}]}],"statement":"SELECT\n    id,\n    teacher_classes.user_id,\n    name,\n    code,\n    topic_id,\n    active,\n    COUNT(student_classes.user_id)::int AS total_students,\n    teacher_classes.created_at,\n    teacher_classes.updated_at,\n    teacher_classes.deactivated_on\nFROM\n    teacher_classes\n    LEFT JOIN student_classes ON teacher_classes.id = student_classes.class_id\nWHERE\n    teacher_classes.user_id = :userId!\nGROUP BY\n    id"};

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


/** Query 'GetTeacherClassByClassCode' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTeacherClassByClassCodeResult = never;

/** Query 'GetTeacherClassByClassCode' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTeacherClassByClassCodeParams = never;

const getTeacherClassByClassCodeIR: any = {"usedParamSet":{"code":true},"params":[{"name":"code","required":true,"transform":{"type":"scalar"},"locs":[{"a":167,"b":172}]}],"statement":"SELECT\n    id,\n    user_id,\n    name,\n    code,\n    active,\n    topic_id,\n    created_at,\n    updated_at,\n    deactivated_on\nFROM\n    teacher_classes\nWHERE\n    code = :code!"};

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


/** Query 'GetTeacherClassById' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetTeacherClassByIdResult = never;

/** Query 'GetTeacherClassById' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetTeacherClassByIdParams = never;

const getTeacherClassByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":293,"b":296}]}],"statement":"SELECT\n    id,\n    user_id,\n    name,\n    code,\n    active,\n    topic_id,\n    created_at,\n    updated_at,\n    (\n        SELECT\n            COUNT(*)\n        FROM\n            student_classes\n        WHERE\n            class_id = id)::int AS total_students\nFROM\n    teacher_classes\nWHERE\n    id = :id!"};

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


/** Query 'GetStudentIdsInTeacherClass' is invalid, so its result is assigned type 'never'.
 *  */
export type IGetStudentIdsInTeacherClassResult = never;

/** Query 'GetStudentIdsInTeacherClass' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IGetStudentIdsInTeacherClassParams = never;

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


/** Query 'UpdateTeacherClass' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateTeacherClassResult = never;

/** Query 'UpdateTeacherClass' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateTeacherClassParams = never;

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


/** Query 'DeactivateTeacherClass' is invalid, so its result is assigned type 'never'.
 *  */
export type IDeactivateTeacherClassResult = never;

/** Query 'DeactivateTeacherClass' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IDeactivateTeacherClassParams = never;

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


/** Query 'UpdateTeacherSchool' is invalid, so its result is assigned type 'never'.
 *  */
export type IUpdateTeacherSchoolResult = never;

/** Query 'UpdateTeacherSchool' is invalid, so its parameters are assigned type 'never'.
 *  */
export type IUpdateTeacherSchoolParams = never;

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


