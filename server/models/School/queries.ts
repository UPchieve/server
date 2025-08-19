import {
  RepoCreateError,
  RepoReadError,
  RepoTransactionError,
  RepoUpdateError,
  RepoUpsertError,
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
  createStudentPartnerOrgUpchieveInstance,
  deactivateSchoolStudentPartnerOrgs,
  StudentPartnerOrg,
} from '../StudentPartnerOrg'
import { FormattedSchoolNcesMetadataRecord } from '../../scripts/upsert-schools'
import { asNumber } from '../../utils/type-utils'
import { toTitleCase } from '../../utils/string-utils'
import logger from '../../logger'
import { AdminUpdate } from '../../services/SchoolService'
import { isSchoolApproved } from '../../services/EligibilityService'
import { IGetStudentPartnerOrgForRegistrationByKeyParams } from '../StudentPartnerOrg/pg.queries'
import { PoolClient } from 'pg'

export async function getSchoolById(
  schoolId: Ulid,
  client?: PoolClient
): Promise<School | undefined> {
  try {
    const result = await pgQueries.getSchoolById.run(
      { schoolId },
      client ?? getClient()
    )

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

type GetSchoolsInput = {
  name?: string
  state?: string
  city?: string
  ncesId?: string
  isPartner?: boolean
}
export async function getFilteredSchools(
  data: GetSchoolsInput,
  limit: number,
  offset: number,
  tc: TransactionClient
): Promise<School[]> {
  try {
    const result = await pgQueries.getFilteredSchools.run(
      {
        name: data.name || null,
        state: data.state || null,
        city: data.city || null,
        ncesId: data.ncesId || null,
        isPartner: data.isPartner ?? null,
        limit,
        offset,
      },
      tc
    )
    return result.map((v) => {
      const formatted = makeSomeRequired(v, [
        'id',
        'name',
        'city',
        'state',
        'isAdminApproved',
        'isPartner',
      ])
      ;(formatted as School).isApproved = isSchoolApproved(formatted)
      return formatted
    })
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFilteredSchoolsTotalCount(
  data: GetSchoolsInput,
  tc: TransactionClient
): Promise<number> {
  try {
    const result = await pgQueries.getFilteredSchoolsTotalCount.run(
      {
        name: data.name || null,
        state: data.state || null,
        city: data.city || null,
        ncesId: data.ncesId || null,
        isPartner: data.isPartner ?? null,
      },
      tc
    )
    return parseInt(result[0].count ?? '0')
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
  isPartner: boolean,
  existingStudentPartnerOrgId: string | undefined
): Promise<void> {
  if (!existingStudentPartnerOrgId && !isPartner)
    throw new Error(
      `Cannot deactivate student partner org for school ${schoolId}: SPO does not exist`
    )

  const transactionClient = await getClient().connect()
  try {
    await transactionClient.query('BEGIN')
    // Set schools.partner.
    // @TODO Drop this column and let student_partner_orgs_upchieve_instances be the source of truth
    const result = await pgQueries.updateIsPartner.run(
      { schoolId, isPartner },
      transactionClient
    )

    const school = await getSchoolById(schoolId, transactionClient)
    if (!school)
      throw new Error(
        `Cannot update partner status: School with id ${schoolId} does not exist`
      )
    if (isPartner) {
      if (!existingStudentPartnerOrgId) {
        await createSchoolStudentPartnerOrg(school.id, transactionClient)
      }
      await createStudentPartnerOrgUpchieveInstance(schoolId, transactionClient)
    } else {
      await deactivateSchoolStudentPartnerOrgs(schoolId, transactionClient)
    }

    // @TODO switch to runInTransaction style and move this logic into the service layer.
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
    return results.map((v) => makeSomeOptional(v, ['district']))
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
    return schools.map((s) =>
      makeSomeOptional(s, ['partnerKey', 'partnerSites'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function addCleverSchoolMapping(
  cleverSchoolId: string,
  upchieveSchoolId: Uuid,
  tc = getClient()
): Promise<void> {
  try {
    await pgQueries.addCleverSchoolMapping.run(
      {
        cleverSchoolId,
        upchieveSchoolId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export async function getUpchieveSchoolIdFromCleverId(
  cleverSchoolId: string,
  tc = getClient()
): Promise<Uuid | undefined> {
  try {
    const result = await pgQueries.getUpchieveSchoolIdFromCleverId.run(
      {
        cleverSchoolId,
      },
      tc
    )
    if (result.length) {
      return makeRequired(result[0]).upchieveSchoolId
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
