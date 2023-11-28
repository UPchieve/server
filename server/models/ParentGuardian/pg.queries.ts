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

const createParentGuardianIR: any = {"name":"createParentGuardian","params":[{"name":"id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":88,"b":90,"line":3,"col":13}]}},{"name":"email","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":94,"b":99,"line":3,"col":19}]}}],"usedParamSet":{"id":true,"email":true},"statement":{"body":"INSERT INTO parents_guardians (id, email)\n    VALUES (:id!, :email!)\nON CONFLICT (email)\n    DO NOTHING\nRETURNING\n    id","loc":{"a":33,"b":152,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO parents_guardians (id, email)
 *     VALUES (:id!, :email!)
 * ON CONFLICT (email)
 *     DO NOTHING
 * RETURNING
 *     id
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

const linkParentGuardianToStudentIR: any = {"name":"linkParentGuardianToStudent","params":[{"name":"parent_guardian_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":285,"b":303,"line":12,"col":13}]}},{"name":"student_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":307,"b":317,"line":12,"col":35}]}}],"usedParamSet":{"parent_guardian_id":true,"student_id":true},"statement":{"body":"INSERT INTO parents_guardians_students (parents_guardians_id, students_id)\n    VALUES (:parent_guardian_id!, :student_id!)\nON CONFLICT (parents_guardians_id, students_id)\n    DO NOTHING","loc":{"a":197,"b":381,"line":11,"col":0}}};

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


