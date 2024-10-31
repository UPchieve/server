import {
  RepoCreateError,
  RepoReadError,
  RepoTransactionError,
  RepoUpdateError,
} from '../Errors'
import { PartnerSchool, School } from './types'
import {
  getDbUlid,
  makeRequired,
  makeSomeRequired,
  makeSomeOptional,
  Ulid,
  Uuid,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import * as geoQueries from '../Geography/pg.queries'
import {
  createSchoolStudentPartnerOrg,
  deactivateStudentPartnerOrg,
} from '../StudentPartnerOrg'
import {
  FormattedSchoolNcesMetadataRecord,
  SCHOOL_RECORD_TRUE_VALUE,
} from '../../scripts/upsert-schools'
import { asNumber } from '../../utils/type-utils'
import { toTitleCase } from '../../utils/string-utils'
import logger from '../../logger'
import { AdminUpdate } from '../../services/SchoolService'
import { isSchoolApproved } from '../../services/EligibilityService'
import { IGetStudentPartnerOrgForRegistrationByKeyParams } from '../StudentPartnerOrg/pg.queries'

export async function getSchoolById(
  schoolId: Ulid
): Promise<School | undefined> {
  try {
    const result = await pgQueries.getSchoolById.run({ schoolId }, getClient())

    if (result.length) {
      return makeSomeRequired(result[0], [
        'id',
        'name',
        'city',
        'state',
        'isAdminApproved',
        'isPartner',
      ])
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
): Promise<School[]> {
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
    return result
      .map(v =>
        makeSomeRequired(v, [
          'id',
          'name',
          'city',
          'state',
          'isAdminApproved',
          'isPartner',
          'isSchoolWideTitle1',
        ])
      )
      .map((s: School) => {
        s.isApproved = isSchoolApproved(s)
        return s
      })
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

    const school = await getSchoolById(schoolId)
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

export async function adminUpdateSchool(data: AdminUpdate): Promise<void> {
  const client = await getClient().connect()
  try {
    const { schoolId, name, city, state, zip, isApproved } = data

    await client.query('BEGIN')
    await pgQueries.adminUpdateSchoolMetaData.run({ schoolId, zip }, client)

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
    return results.map(v => makeSomeOptional(v, ['district']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function titlecaseSchoolNames(): Promise<void> {
  try {
    await pgQueries.titlecaseSchoolNames.run(undefined, getClient())
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function titlecaseMetadataSchoolNames(): Promise<void> {
  try {
    await pgQueries.titlecaseMetadataSchoolNames.run(undefined, getClient())
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getSchoolByNcesId(
  ncesSchoolId: string,
  tc: TransactionClient = getClient()
) {
  try {
    const school = await pgQueries.getSchoolByNcesId.run(
      { ncessch: ncesSchoolId },
      tc
    )
    if (school.length) {
      return makeRequired(school[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createSchool(
  schoolName: string,
  cityId: number,
  tc: TransactionClient
) {
  try {
    const school = await pgQueries.createSchool.run(
      {
        id: getDbUlid(),
        name: schoolName,
        city_id: cityId,
      },
      tc
    )
    if (school.length) {
      return makeRequired(school[0])
    }
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createSchoolMetadata(
  upchieveSchoolId: Uuid,
  schoolMetadata: FormattedSchoolNcesMetadataRecord,
  tc: TransactionClient
) {
  try {
    await pgQueries.createSchoolMetadata.run(
      {
        school_id: upchieveSchoolId,
        ...schoolMetadata,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateSchoolMetadata(
  upchieveSchoolId: Uuid,
  schoolMetadata: FormattedSchoolNcesMetadataRecord,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.updateSchoolMetadata.run(
      {
        school_id: upchieveSchoolId,
        ...schoolMetadata,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getPartnerSchools(
  tc: TransactionClient
): Promise<PartnerSchool[] | undefined> {
  try {
    const schools = await pgQueries.getPartnerSchools.run(undefined, tc)
    return schools.map(s => makeSomeOptional(s, ['partnerKey', 'partnerSites']))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
