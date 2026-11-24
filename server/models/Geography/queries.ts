import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { RepoUpdateError } from '../Errors'
import { makeSomeRequired } from '../pgUtils'

export async function upsertCity(
  cityName: string,
  stateCode: string,
  tc: TransactionClient
) {
  try {
    const city = await pgQueries.upsertCity.run(
      { name: cityName, state: stateCode },
      tc
    )
    if (city.length) {
      return makeSomeRequired(city[0], ['id'])
    }
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
