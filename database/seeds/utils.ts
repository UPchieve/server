import { Ulid } from 'id128'
import pgClient from './pgClient'

export function getDbUlid() {
  return Ulid.generate().toRaw() // as UUID
}

export type NameToId = {
  [k: string]: number | string
}

// Insert queries should return an id (or other field if id does not exist) as ok to verify they succeeded
export const ExpectedErrors: string[] = []

type InsertParams = {
  [k: string]: any
}
type InsertResult = {
  ok: any
}
export async function wrapInsert<
  T extends InsertResult[],
  K extends InsertParams
>(
  tableName: string,
  fn: (arg: K, client: typeof pgClient) => Promise<T>,
  params: K
): Promise<any> {
  try {
    const result = await fn(params, pgClient)
    if (!result.length) {
      ExpectedErrors.push(
        `${tableName} with param(s) ${JSON.stringify(
          params
        )} already exists in db`
      )
      return params.id
    }
    if (!result[0].ok)
      throw new Error(
        `Insert of ${tableName} with param(s)${JSON.stringify(
          params
        )} did not return ok`
      )
    return result[0].ok
  } catch (err) {
    console.log(`Unexpected error: ${(err as Error).message}`)
  }
}
