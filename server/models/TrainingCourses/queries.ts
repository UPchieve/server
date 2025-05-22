import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import {
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
    if (!results.length || !results[0].keys?.length)
      throw new Error('No required material keys returned')
    return results[0].keys!
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
    if (!trainingCourseResult.length)
      throw new Error(
        `Did not find training course with name ${trainingCourseName}`
      )
    const trainingCourse = makeRequired(
      trainingCourseResult[0]
    ) as TrainingCourse

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
