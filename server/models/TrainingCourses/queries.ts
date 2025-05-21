import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import {
  FullTrainingCourse,
  TrainingCourse,
  TrainingCourseModule,
  TrainingCourseModuleMaterial,
} from './types'
export async function getRequiredMaterialKeysByTrainingCourseName(
  trainingCourseName: string,
  client: TransactionClient = getClient()
): Promise<string[]> {
  try {
    const results =
      await pgQueries.getRequiredMaterialKeysByTrainingCourseName.run(
        {
          trainingCourseName,
        },
        client
      )
    return results.map((row) => makeRequired(row))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFullTrainingCourseByName(
  trainingCourseName: string,
  client: TransactionClient = getClient()
): Promise<{
  trainingCourse: TrainingCourse
  modules: TrainingCourseModule[]
  materials: TrainingCourseModuleMaterial[]
}> {
  try {
    const trainingCourseResult = await pgQueries.getTrainingCourseByName.run(
      {
        trainingCourseName,
      },
      client
    )
    const trainingCourse = makeRequired(
      trainingCourseResult[0]
    ) as TrainingCourse
    if (!trainingCourse)
      throw new Error(
        `Did not find training course with name ${trainingCourse}`
      )

    const modulesResult =
      await pgQueries.getTrainingCourseModulesByTrainingCourseName.run(
        {
          trainingCourseName,
        },
        client
      )
    const modules = modulesResult.map(
      (row) => makeRequired(row) as TrainingCourseModule
    )
    if (!modules.length)
      throw new Error(
        `Did not find training modules for course with name ${trainingCourseName}`
      )

    const materialsResult =
      await pgQueries.getTrainingCourseMaterialsByTrainingCourseName.run(
        {
          trainingCourseName,
        },
        client
      )
    const materials = materialsResult.map(
      (row) =>
        makeSomeRequired(row, [
          'id',
          'moduleId',
          'name',
          'key',
          'type',
          'required',
          'resourceUrl',
        ]) as TrainingCourseModuleMaterial
    )
    if (!materials.length)
      throw new Error(
        `Did not find training materials for course with name ${trainingCourseName}`
      )

    return {
      trainingCourse,
      modules,
      materials,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
