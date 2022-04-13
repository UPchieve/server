import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { AdminSchool, School } from './types'
import { getDbUlid, makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import * as geoQueries from '../Geography/pg.queries'

export async function findSchoolByUpchieveId(
  schoolId: Ulid
): Promise<School | undefined> {
  try {
    const result = await pgQueries.findSchoolByUpchieveId.run(
      { schoolId },
      getClient()
    )

    if (result.length) {
      // pgTyped does not camelCase a letter preceding a number, like g_10Offered
      return makeSomeRequired(result[0], [
        'fipst',
        'schoolYear',
        'schName',
        'leaName',
        'st',
        'stSchid',
        'mcity',
        'mzip',
        'lcity',
        'lzip',
        // @ts-expect-error
        'g9Offered',
        // @ts-expect-error
        'g10Offered',
        // @ts-expect-error
        'g11Offered',
        // @ts-expect-error
        'g12Offered',
      ])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSchool(
  schoolId: Ulid
): Promise<AdminSchool | undefined> {
  try {
    const result = await pgQueries.getSchool.run({ schoolId }, getClient())

    // TODO: fix return type to upper case
    if (result.length) {
      return makeSomeRequired(result[0], ['zipCode'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type GetSchoolsPayload = {
  name?: string
  state?: string
  city?: string
}

export async function getSchools(
  data: GetSchoolsPayload,
  limit: number,
  offset: number
): Promise<AdminSchool[]> {
  try {
    const { name, state, city } = data
    const result = await pgQueries.getSchools.run(
      {
        name: name || null,
        state: state || null,
        city: city || null,
        limit: limit,
        offset: offset,
      },
      getClient()
    )
    const schools = result.map(v => makeRequired(v))

    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type CreateSchoolPayload = {
  name: string
  city: string
  state: string
  zipCode: string
  isApproved: boolean
}

export async function createSchool(data: CreateSchoolPayload): Promise<School> {
  const client = await getClient().connect()
  try {
    await pgQueries.createSchoolMetaData.run({ zipCode: data.zipCode }, client)

    // we need to find the city's id, or if it doesn't exist, create it
    const upsertCityResult = await geoQueries.upsertCity.run(
      { name: data.city, state: data.state },
      client
    )
    const cityId = makeRequired(upsertCityResult[0]).id

    const result = await pgQueries.createSchool.run(
      {
        cityId,
        id: getDbUlid(),
        isApproved: data.isApproved,
        name: data.name,
      },
      client
    )
    if (result.length) {
      const school = makeRequired(result[0])
      await client.query('COMMIT')
      return {
        ...school,
        stateStored: data.state,
      }
    } else {
      throw new Error('inserting new school did not return a result')
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoCreateError(err)
  } finally {
    client.release()
  }
}

export async function updateApproval(
  schoolId: Ulid,
  isApproved: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateApproval.run(
      { schoolId, isApproved },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateIsPartner(
  schoolId: Ulid,
  isPartner: boolean
): Promise<void> {
  try {
    const result = await pgQueries.updateIsPartner.run(
      { schoolId, isPartner },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type AdminUpdate = {
  schoolId: Ulid
  name: string
  city: string
  state: string
  zipCode: string
  isApproved: boolean
}

export async function adminUpdateSchool(data: AdminUpdate): Promise<void> {
  const client = await getClient().connect()
  try {
    const { schoolId, name, city, state, zipCode, isApproved } = data

    await client.query('BEGIN')
    await pgQueries.adminUpdateSchoolMetaData.run({ schoolId, zipCode }, client)

    // we need to find the city's id, or if it doesn't exist, create it
    let cityId: number | undefined
    if (city) {
      const result = await geoQueries.upsertCity.run(
        { name: city, state },
        client
      )
      cityId = makeRequired(result[0]).id
    }

    await pgQueries.adminUpdateSchool.run(
      { schoolId, name, cityId, isApproved },
      client
    )
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoUpdateError(err)
  } finally {
    client.release()
  }
}

export async function schoolSearch(
  query: string
): Promise<School[] | undefined> {
  try {
    const results = await pgQueries.schoolSearch.run({ query }, getClient())
    if (results.length)
      return results.map(v => makeSomeRequired(v, ['districtNameStored']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
