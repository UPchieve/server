/** Types generated for queries found in "server/models/ParentGuardian/parentGuardian.sql" */
import { PreparedQuery } from '@pgtyped/query';

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

const createParentGuardianIR: any = {"name":"createParentGuardian","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":88,"b":90,"line":3,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":94,"b":99,"line":3,"col":19},{"a":157,"b":162,"line":6,"col":17}]}}],"usedParamSet":{"id":true,"email":true},"statement":{"body":"INSERT INTO parents_guardians (id, email)\n    VALUES (:id!, :email!)\nON CONFLICT (email)\n    DO UPDATE SET\n        email = :email!\n    RETURNING\n        id","loc":{"a":33,"b":187,"line":2,"col":0}}};

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

const linkParentGuardianToStudentIR: any = {"name":"linkParentGuardianToStudent","params":[{"name":"parent_guardian_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":320,"b":338,"line":13,"col":13}]}},{"name":"student_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":342,"b":352,"line":13,"col":35}]}}],"usedParamSet":{"parent_guardian_id":true,"student_id":true},"statement":{"body":"INSERT INTO parents_guardians_students (parents_guardians_id, students_id)\n    VALUES (:parent_guardian_id!, :student_id!)\nON CONFLICT (parents_guardians_id, students_id)\n    DO NOTHING","loc":{"a":232,"b":416,"line":12,"col":0}}};

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


