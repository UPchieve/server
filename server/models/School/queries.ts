import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { AdminSchool, School } from './types'
import { getDbUlid, makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import * as geoQueries from '../Geography/pg.queries'
import {
  createSchoolStudentPartnerOrg,
  deactivateStudentPartnerOrg,
} from '../StudentPartnerOrg'

export async function findSchoolByUpchieveId(
  schoolId: Ulid
): Promise<School | undefined> {
  try {
    const result = await pgQueries.findSchoolByUpchieveId.run(
      { schoolId },
      getClient()
    )

    if (result.length) {
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
    return result.map(v => makeSomeRequired(v, ['zipCode']))
  } catch (err) {
    throw new RepoReadError(err)
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
  const transactionClient = await getClient().connect()
  try {
    await transactionClient.query('BEGIN')
    const result = await pgQueries.updateIsPartner.run(
      { schoolId, isPartner },
      getClient()
    )

    const school = await getSchool(schoolId)
    if (school) {
      if (isPartner)
        await createSchoolStudentPartnerOrg(school.name, transactionClient)
      else await deactivateStudentPartnerOrg(school.name, transactionClient)
    }

    await transactionClient.query('COMMIT')
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    await transactionClient.query('ROLLBACK')
    throw new RepoUpdateError(err)
  } finally {
    transactionClient.release()
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

export async function schoolSearch(query: string): Promise<School[]> {
  try {
    const results = await pgQueries.schoolSearch.run({ query }, getClient())
    return results.map(v => makeSomeRequired(v, ['districtNameStored']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
