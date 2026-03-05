/** Types generated for queries found in "server/models/UsersSchools/users_schools.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type user_school_association_type = 'student_at_school' | 'teacher_at_school';

/** 'InsertUsersSchool' parameters type */
export interface IInsertUsersSchoolParams {
  associationType: user_school_association_type;
  schoolId: string;
  userId: string;
}

/** 'InsertUsersSchool' return type */
export interface IInsertUsersSchoolResult {
  associationType: user_school_association_type;
  createdAt: Date;
  schoolId: string;
  updatedAt: Date;
  userId: string;
}

/** 'InsertUsersSchool' query type */
export interface IInsertUsersSchoolQuery {
  params: IInsertUsersSchoolParams;
  result: IInsertUsersSchoolResult;
}

const insertUsersSchoolIR: any = {"usedParamSet":{"userId":true,"schoolId":true,"associationType":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":96}]},{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":99,"b":108}]},{"name":"associationType","required":true,"transform":{"type":"scalar"},"locs":[{"a":111,"b":127}]}],"statement":"INSERT INTO users_schools (user_id, school_id, association_type, updated_at)\n    VALUES (:userId!, :schoolId!, :associationType!, NOW())\nRETURNING\n    *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_schools (user_id, school_id, association_type, updated_at)
 *     VALUES (:userId!, :schoolId!, :associationType!, NOW())
 * RETURNING
 *     *
 * ```
 */
export const insertUsersSchool = new PreparedQuery<IInsertUsersSchoolParams,IInsertUsersSchoolResult>(insertUsersSchoolIR);


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


