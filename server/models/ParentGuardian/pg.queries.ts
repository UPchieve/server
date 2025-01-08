/** Types generated for queries found in "server/models/ParentGuardian/parentGuardian.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** Query 'CreateParentGuardian' is invalid, so its result is assigned type 'never'.
 *  */
export type ICreateParentGuardianResult = never;

/** Query 'CreateParentGuardian' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ICreateParentGuardianParams = never;

const createParentGuardianIR: any = {"usedParamSet":{"id":true,"email":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":57}]},{"name":"email","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":66},{"a":123,"b":129}]}],"statement":"INSERT INTO parents_guardians (id, email)\n    VALUES (:id!, :email!)\nON CONFLICT (email)\n    DO UPDATE SET\n        email = :email!\n    RETURNING\n        id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO parents_guardians (id, email)
 *     VALUES (:id!, :email!)
 * ON CONFLICT (email)
 *     DO UPDATE SET
 *         email = :email!
 *     RETURNING
 *         id
 * ```
 */
export const createParentGuardian = new PreparedQuery<ICreateParentGuardianParams,ICreateParentGuardianResult>(createParentGuardianIR);


/** Query 'LinkParentGuardianToStudent' is invalid, so its result is assigned type 'never'.
 *  */
export type ILinkParentGuardianToStudentResult = never;

/** Query 'LinkParentGuardianToStudent' is invalid, so its parameters are assigned type 'never'.
 *  */
export type ILinkParentGuardianToStudentParams = never;

const linkParentGuardianToStudentIR: any = {"usedParamSet":{"parent_guardian_id":true,"student_id":true},"params":[{"name":"parent_guardian_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":106}]},{"name":"student_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":109,"b":120}]}],"statement":"INSERT INTO parents_guardians_students (parents_guardians_id, students_id)\n    VALUES (:parent_guardian_id!, :student_id!)\nON CONFLICT (parents_guardians_id, students_id)\n    DO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO parents_guardians_students (parents_guardians_id, students_id)
 *     VALUES (:parent_guardian_id!, :student_id!)
 * ON CONFLICT (parents_guardians_id, students_id)
 *     DO NOTHING
 * ```
 */
export const linkParentGuardianToStudent = new PreparedQuery<ILinkParentGuardianToStudentParams,ILinkParentGuardianToStudentResult>(linkParentGuardianToStudentIR);


