/** Types generated for queries found in "server/models/TrainingCourses/training_courses.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type training_course_material_type = 'document' | 'link' | 'resources' | 'video';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetRequiredMaterialKeysByTrainingCourseName' parameters type */
export interface IGetRequiredMaterialKeysByTrainingCourseNameParams {
  trainingCourseName: string;
}

/** 'GetRequiredMaterialKeysByTrainingCourseName' return type */
export interface IGetRequiredMaterialKeysByTrainingCourseNameResult {
  key: string;
}

/** 'GetRequiredMaterialKeysByTrainingCourseName' query type */
export interface IGetRequiredMaterialKeysByTrainingCourseNameQuery {
  params: IGetRequiredMaterialKeysByTrainingCourseNameParams;
  result: IGetRequiredMaterialKeysByTrainingCourseNameResult;
}

const getRequiredMaterialKeysByTrainingCourseNameIR: any = {"usedParamSet":{"trainingCourseName":true},"params":[{"name":"trainingCourseName","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":263}]}],"statement":"SELECT\n    tcmm.key\nFROM\n    training_course_module_materials tcmm\n    JOIN training_course_modules tcm ON tcm.id = tcmm.module_id\n    JOIN training_courses tc ON tc.id = tcm.training_course_id\nWHERE\n    tcmm.required IS TRUE\n    AND tc.name = :trainingCourseName!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     tcmm.key
 * FROM
 *     training_course_module_materials tcmm
 *     JOIN training_course_modules tcm ON tcm.id = tcmm.module_id
 *     JOIN training_courses tc ON tc.id = tcm.training_course_id
 * WHERE
 *     tcmm.required IS TRUE
 *     AND tc.name = :trainingCourseName!
 * ```
 */
export const getRequiredMaterialKeysByTrainingCourseName = new PreparedQuery<IGetRequiredMaterialKeysByTrainingCourseNameParams,IGetRequiredMaterialKeysByTrainingCourseNameResult>(getRequiredMaterialKeysByTrainingCourseNameIR);


/** 'GetTrainingCourseByName' parameters type */
export interface IGetTrainingCourseByNameParams {
  trainingCourseName: string;
}

/** 'GetTrainingCourseByName' return type */
export interface IGetTrainingCourseByNameResult {
  createdAt: Date;
  description: string | null;
  id: number;
  name: string;
  quizId: number;
  quizName: string;
  updatedAt: Date;
}

/** 'GetTrainingCourseByName' query type */
export interface IGetTrainingCourseByNameQuery {
  params: IGetTrainingCourseByNameParams;
  result: IGetTrainingCourseByNameResult;
}

const getTrainingCourseByNameIR: any = {"usedParamSet":{"trainingCourseName":true},"params":[{"name":"trainingCourseName","required":true,"transform":{"type":"scalar"},"locs":[{"a":228,"b":247}]}],"statement":"SELECT\n    tc.id,\n    tc.name,\n    tc.description,\n    q.name AS quiz_name,\n    q.id AS quiz_id,\n    tc.created_at,\n    tc.updated_at\nFROM\n    training_courses tc\n    LEFT JOIN quizzes q ON q.id = tc.quiz_id\nWHERE\n    tc.name = :trainingCourseName!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     tc.id,
 *     tc.name,
 *     tc.description,
 *     q.name AS quiz_name,
 *     q.id AS quiz_id,
 *     tc.created_at,
 *     tc.updated_at
 * FROM
 *     training_courses tc
 *     LEFT JOIN quizzes q ON q.id = tc.quiz_id
 * WHERE
 *     tc.name = :trainingCourseName!
 * ```
 */
export const getTrainingCourseByName = new PreparedQuery<IGetTrainingCourseByNameParams,IGetTrainingCourseByNameResult>(getTrainingCourseByNameIR);


/** 'GetTrainingCourseModulesByTrainingCourseName' parameters type */
export interface IGetTrainingCourseModulesByTrainingCourseNameParams {
  trainingCourseName: string;
}

/** 'GetTrainingCourseModulesByTrainingCourseName' return type */
export interface IGetTrainingCourseModulesByTrainingCourseNameResult {
  id: number;
  name: string;
  trainingCourseId: number;
}

/** 'GetTrainingCourseModulesByTrainingCourseName' query type */
export interface IGetTrainingCourseModulesByTrainingCourseNameQuery {
  params: IGetTrainingCourseModulesByTrainingCourseNameParams;
  result: IGetTrainingCourseModulesByTrainingCourseNameResult;
}

const getTrainingCourseModulesByTrainingCourseNameIR: any = {"usedParamSet":{"trainingCourseName":true},"params":[{"name":"trainingCourseName","required":true,"transform":{"type":"scalar"},"locs":[{"a":137,"b":156}]}],"statement":"SELECT\n    tcm.*\nFROM\n    training_course_modules tcm\n    JOIN training_courses tc ON tc.id = tcm.training_course_id\nWHERE\n    tc.name = :trainingCourseName!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     tcm.*
 * FROM
 *     training_course_modules tcm
 *     JOIN training_courses tc ON tc.id = tcm.training_course_id
 * WHERE
 *     tc.name = :trainingCourseName!
 * ```
 */
export const getTrainingCourseModulesByTrainingCourseName = new PreparedQuery<IGetTrainingCourseModulesByTrainingCourseNameParams,IGetTrainingCourseModulesByTrainingCourseNameResult>(getTrainingCourseModulesByTrainingCourseNameIR);


/** 'GetTrainingCourseMaterialsByTrainingCourseName' parameters type */
export interface IGetTrainingCourseMaterialsByTrainingCourseNameParams {
  trainingCourseName: string;
}

/** 'GetTrainingCourseMaterialsByTrainingCourseName' return type */
export interface IGetTrainingCourseMaterialsByTrainingCourseNameResult {
  id: number;
  key: string;
  links: Json | null;
  moduleId: number;
  name: string;
  required: boolean;
  resourceId: string | null;
  resourceUrl: string;
  type: training_course_material_type;
}

/** 'GetTrainingCourseMaterialsByTrainingCourseName' query type */
export interface IGetTrainingCourseMaterialsByTrainingCourseNameQuery {
  params: IGetTrainingCourseMaterialsByTrainingCourseNameParams;
  result: IGetTrainingCourseMaterialsByTrainingCourseNameResult;
}

const getTrainingCourseMaterialsByTrainingCourseNameIR: any = {"usedParamSet":{"trainingCourseName":true},"params":[{"name":"trainingCourseName","required":true,"transform":{"type":"scalar"},"locs":[{"a":212,"b":231}]}],"statement":"SELECT\n    tcmm.*\nFROM\n    training_course_module_materials tcmm\n    JOIN training_course_modules tcm ON tcm.id = tcmm.module_id\n    JOIN training_courses tc ON tc.id = tcm.training_course_id\nWHERE\n    tc.name = :trainingCourseName!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     tcmm.*
 * FROM
 *     training_course_module_materials tcmm
 *     JOIN training_course_modules tcm ON tcm.id = tcmm.module_id
 *     JOIN training_courses tc ON tc.id = tcm.training_course_id
 * WHERE
 *     tc.name = :trainingCourseName!
 * ```
 */
export const getTrainingCourseMaterialsByTrainingCourseName = new PreparedQuery<IGetTrainingCourseMaterialsByTrainingCourseNameParams,IGetTrainingCourseMaterialsByTrainingCourseNameResult>(getTrainingCourseMaterialsByTrainingCourseNameIR);


