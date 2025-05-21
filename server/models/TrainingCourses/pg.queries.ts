/** Types generated for queries found in "server/models/TrainingCourses/training_courses.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

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


