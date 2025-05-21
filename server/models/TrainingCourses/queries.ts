import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { makeRequired } from '../pgUtils'
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
