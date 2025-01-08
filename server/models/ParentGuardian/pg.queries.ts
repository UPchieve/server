/** Types generated for queries found in "server/models/ParentGuardian/parentGuardian.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'CreateParentGuardian' parameters type */
export interface ICreateParentGuardianParams {
  email: string;
  id: string;
}

/** 'CreateParentGuardian' return type */
export interface ICreateParentGuardianResult {
  id: string;
}

/** 'CreateParentGuardian' query type */
export interface ICreateParentGuardianQuery {
  params: ICreateParentGuardianParams;
  result: ICreateParentGuardianResult;
}

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


/** 'LinkParentGuardianToStudent' parameters type */
export interface ILinkParentGuardianToStudentParams {
  parent_guardian_id: string;
  student_id: string;
}

/** 'LinkParentGuardianToStudent' return type */
export type ILinkParentGuardianToStudentResult = void;

/** 'LinkParentGuardianToStudent' query type */
export interface ILinkParentGuardianToStudentQuery {
  params: ILinkParentGuardianToStudentParams;
  result: ILinkParentGuardianToStudentResult;
}

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


