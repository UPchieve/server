/** Types generated for queries found in "server/models/UsersGradeLevels/users_grade_levels.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpsertUserGradeLevel' parameters type */
export interface IUpsertUserGradeLevelParams {
  gradeLevel: string;
  userId: string;
}

/** 'UpsertUserGradeLevel' return type */
export interface IUpsertUserGradeLevelResult {
  gradeLevelId: number;
  signupGradeLevelId: number | null;
  updatedAt: Date;
  userId: string;
}

/** 'UpsertUserGradeLevel' query type */
export interface IUpsertUserGradeLevelQuery {
  params: IUpsertUserGradeLevelParams;
  result: IUpsertUserGradeLevelResult;
}

const upsertUserGradeLevelIR: any = {"usedParamSet":{"userId":true,"gradeLevel":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":110}]},{"name":"gradeLevel","required":true,"transform":{"type":"scalar"},"locs":[{"a":190,"b":201}]}],"statement":"INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id, updated_at)\nSELECT\n    :userId!,\n    gl.id,\n    gl.id,\n    NOW()\nFROM\n    grade_levels gl\nWHERE\n    gl.name = :gradeLevel!\nON CONFLICT (user_id)\n    DO UPDATE SET\n        grade_level_id = EXCLUDED.grade_level_id,\n        updated_at = NOW()\n    RETURNING\n        *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id, updated_at)
 * SELECT
 *     :userId!,
 *     gl.id,
 *     gl.id,
 *     NOW()
 * FROM
 *     grade_levels gl
 * WHERE
 *     gl.name = :gradeLevel!
 * ON CONFLICT (user_id)
 *     DO UPDATE SET
 *         grade_level_id = EXCLUDED.grade_level_id,
 *         updated_at = NOW()
 *     RETURNING
 *         *
 * ```
 */
export const upsertUserGradeLevel = new PreparedQuery<IUpsertUserGradeLevelParams,IUpsertUserGradeLevelResult>(upsertUserGradeLevelIR);


