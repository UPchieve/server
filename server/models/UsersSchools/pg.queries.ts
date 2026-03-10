/** Types generated for queries found in "server/models/UsersSchools/users_schools.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_school_association_type = 'student_at_school' | 'teacher_at_school';

/** 'UpsertUsersSchool' parameters type */
export interface IUpsertUsersSchoolParams {
  associationType: user_school_association_type;
  schoolId: string;
  userId: string;
}

/** 'UpsertUsersSchool' return type */
export interface IUpsertUsersSchoolResult {
  associationType: user_school_association_type;
  createdAt: Date;
  schoolId: string;
  updatedAt: Date;
  userId: string;
}

/** 'UpsertUsersSchool' query type */
export interface IUpsertUsersSchoolQuery {
  params: IUpsertUsersSchoolParams;
  result: IUpsertUsersSchoolResult;
}

const upsertUsersSchoolIR: any = {"usedParamSet":{"userId":true,"schoolId":true,"associationType":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":96}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":108},{"a":197,"b":206}]},{"name":"associationType","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":127},{"a":228,"b":244}]}],"statement":"INSERT INTO users_schools (user_id, school_id, association_type, updated_at)\n    VALUES (:userId!, :schoolId!, :associationType!, NOW())\nON CONFLICT (user_id)\n    DO UPDATE SET\n        school_id = :schoolId!, association_type = :associationType!, updated_at = NOW()\n    RETURNING\n        *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_schools (user_id, school_id, association_type, updated_at)
 *     VALUES (:userId!, :schoolId!, :associationType!, NOW())
 * ON CONFLICT (user_id)
 *     DO UPDATE SET
 *         school_id = :schoolId!, association_type = :associationType!, updated_at = NOW()
 *     RETURNING
 *         *
 * ```
 */
export const upsertUsersSchool = new PreparedQuery<IUpsertUsersSchoolParams,IUpsertUsersSchoolResult>(upsertUsersSchoolIR);


/** 'DeleteUsersSchool' parameters type */
export interface IDeleteUsersSchoolParams {
  schoolId: string;
  userId: string;
}

/** 'DeleteUsersSchool' return type */
export type IDeleteUsersSchoolResult = void;

/** 'DeleteUsersSchool' query type */
export interface IDeleteUsersSchoolQuery {
  params: IDeleteUsersSchoolParams;
  result: IDeleteUsersSchoolResult;
}

const deleteUsersSchoolIR: any = {"usedParamSet":{"userId":true,"schoolId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":49}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":71,"b":80}]}],"statement":"DELETE FROM users_schools\nWHERE user_id = :userId!\n    AND school_id = :schoolId!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM users_schools
 * WHERE user_id = :userId!
 *     AND school_id = :schoolId!
 * ```
 */
export const deleteUsersSchool = new PreparedQuery<IDeleteUsersSchoolParams,IDeleteUsersSchoolResult>(deleteUsersSchoolIR);


/** 'BackfillStudentAndTeacherSchools' parameters type */
export type IBackfillStudentAndTeacherSchoolsParams = void;

/** 'BackfillStudentAndTeacherSchools' return type */
export type IBackfillStudentAndTeacherSchoolsResult = void;

/** 'BackfillStudentAndTeacherSchools' query type */
export interface IBackfillStudentAndTeacherSchoolsQuery {
  params: IBackfillStudentAndTeacherSchoolsParams;
  result: IBackfillStudentAndTeacherSchoolsResult;
}

const backfillStudentAndTeacherSchoolsIR: any = {"usedParamSet":{},"params":[],"statement":"WITH students_to_backfill AS (\n    SELECT\n        sp.user_id,\n        sp.school_id\n    FROM\n        student_profiles sp\n        LEFT JOIN users_schools us ON us.user_id = sp.user_id\n    WHERE\n        us.user_id IS NULL\n        AND sp.school_id IS NOT NULL\n),\nteachers_to_backfill AS (\n    SELECT\n        tp.user_id,\n        tp.school_id\n    FROM\n        teacher_profiles tp\n        LEFT JOIN users_schools us ON us.user_id = tp.user_id\n    WHERE\n        us.user_id IS NULL\n        AND tp.school_id IS NOT NULL\n),\nstudent_insert AS (\nINSERT INTO users_schools (user_id, school_id, association_type)\n    SELECT\n        stb.user_id,\n        stb.school_id,\n        'student_at_school'\n    FROM\n        students_to_backfill stb)\n    INSERT INTO users_schools (user_id, school_id, association_type)\n    SELECT\n        ttb.user_id,\n        ttb.school_id,\n        'teacher_at_school'\n    FROM\n        teachers_to_backfill ttb"};

/**
 * Query generated from SQL:
 * ```
 * WITH students_to_backfill AS (
 *     SELECT
 *         sp.user_id,
 *         sp.school_id
 *     FROM
 *         student_profiles sp
 *         LEFT JOIN users_schools us ON us.user_id = sp.user_id
 *     WHERE
 *         us.user_id IS NULL
 *         AND sp.school_id IS NOT NULL
 * ),
 * teachers_to_backfill AS (
 *     SELECT
 *         tp.user_id,
 *         tp.school_id
 *     FROM
 *         teacher_profiles tp
 *         LEFT JOIN users_schools us ON us.user_id = tp.user_id
 *     WHERE
 *         us.user_id IS NULL
 *         AND tp.school_id IS NOT NULL
 * ),
 * student_insert AS (
 * INSERT INTO users_schools (user_id, school_id, association_type)
 *     SELECT
 *         stb.user_id,
 *         stb.school_id,
 *         'student_at_school'
 *     FROM
 *         students_to_backfill stb)
 *     INSERT INTO users_schools (user_id, school_id, association_type)
 *     SELECT
 *         ttb.user_id,
 *         ttb.school_id,
 *         'teacher_at_school'
 *     FROM
 *         teachers_to_backfill ttb
 * ```
 */
export const backfillStudentAndTeacherSchools = new PreparedQuery<IBackfillStudentAndTeacherSchoolsParams,IBackfillStudentAndTeacherSchoolsResult>(backfillStudentAndTeacherSchoolsIR);


