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
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import * as geoQueries from '../Geography/pg.queries'
import {
  createSchoolStudentPartnerOrg,
  deactivateStudentPartnerOrg,
} from '../StudentPartnerOrg'
import {
  SchoolNcesMetadataRecord,
  SCHOOL_RECORD_TRUE_VALUE,
} from '../../scripts/upsert-schools'
import { asNumber } from '../../utils/type-utils'
import { toTitleCase } from '../../utils/string-utils'
import logger from '../../logger'
import { AdminUpdate } from '../../services/SchoolService'
import { isSchoolApproved } from '../../services/EligibilityService'

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

export async function upsertSchools(
  schoolYear: string,
  schoolRecords: SchoolNcesMetadataRecord[]
) {
  const transactionClient = await getClient().connect()
  try {
    await transactionClient.query('BEGIN')

    for (const school of schoolRecords) {
      const formattedSchool = getFormattedSchoolForInsert(school)
      if (
        !formattedSchool.lcity ||
        !formattedSchool.sch_name ||
        !formattedSchool.ncessch
      ) {
        logger.info(
          `Unable to upsert school: SchoolNcesMetadataRecord missing necessary value city (${formattedSchool.lcity}),  sch_name (${formattedSchool.sch_name}),  or ncessch (${formattedSchool.ncessch}).`
        )
        continue
      }

      const existingSchools = await pgQueries.getSchoolByNcesId.run(
        { ncessch: school.ncessch },
        transactionClient
      )
      if (existingSchools.length) {
        const existingSchoolId = existingSchools[0].id
        await pgQueries.updateSchoolMetadata.run(
          {
            school_id: existingSchoolId,
            ...formattedSchool,
          },
          transactionClient
        )
      } else {
        const city = await geoQueries.upsertCity.run(
          { name: formattedSchool.lcity, state: formattedSchool.st },
          transactionClient
        )
        const school = await pgQueries.createSchool.run(
          {
            id: getDbUlid(),
            name: formattedSchool.sch_name,
            city_id: city[0].id,
          },
          transactionClient
        )
        await pgQueries.createSchoolMetadata.run(
          {
            school_id: school[0].id,
            ...formattedSchool,
          },
          transactionClient
        )
      }
    }

    await transactionClient.query('COMMIT')
  } catch (err) {
    await transactionClient.query('ROLLBACK')
    if (err instanceof RepoCreateError) throw err
    throw new RepoTransactionError(err)
  } finally {
    transactionClient.release()
  }

  function getFormattedSchoolForInsert(school: SchoolNcesMetadataRecord) {
    return {
      ncessch: school.ncessch,
      school_year: schoolYear,
      st: school.st,
      sch_name: toTitleCase(school.sch_name),
      lea_name: toTitleCase(school.lea_name),
      lcity: toTitleCase(school.lcity),
      lzip: school.lzip,
      mcity: toTitleCase(school.mcity),
      mstate: school.mstate,
      mzip: school.mzip,
      phone: school.phone,
      website: school.website,
      sy_status_text: toTitleCase(getValueText(school.sy_status)),
      updated_status_text: getValueText(school.updated_status),
      effective_date: school.effective_date,
      sch_type_text: getValueText(school.sch_type),
      nogrades: getValueText(school.nogrades),
      g_pk_offered: getValueText(school.g_pk_offered),
      g_kg_offered: getValueText(school.g_kg_offered),
      g_1_offered: getValueText(school.g_1_offered),
      g_2_offered: getValueText(school.g_2_offered),
      g_3_offered: getValueText(school.g_3_offered),
      g_4_offered: getValueText(school.g_4_offered),
      g_5_offered: getValueText(school.g_5_offered),
      g_6_offered: getValueText(school.g_6_offered),
      g_7_offered: getValueText(school.g_7_offered),
      g_8_offered: getValueText(school.g_8_offered),
      g_9_offered: getValueText(school.g_9_offered),
      g_10_offered: getValueText(school.g_10_offered),
      g_11_offered: getValueText(school.g_11_offered),
      g_12_offered: getValueText(school.g_12_offered),
      g_13_offered: getValueText(school.g_13_offered),
      g_ug_offered: getValueText(school.g_ug_offered),
      g_ae_offered: getValueText(school.g_ae_offered),
      gslo: getGradeCode(school.gslo),
      gshi: getGradeCode(school.gshi),
      level: school.level,
      is_school_wide_title1:
        school.is_school_wide_title1 === SCHOOL_RECORD_TRUE_VALUE,
      is_title1_eligible:
        school.is_title1_eligible === SCHOOL_RECORD_TRUE_VALUE,
      national_school_lunch_program: school.national_school_lunch_program,
      total_students: school.total_students
        ? asNumber(school.total_students)
        : undefined,
      nslp_direct_certification: school.nslp_direct_certification
        ? asNumber(school.nslp_direct_certification)
        : undefined,
      frl_eligible: school.frl_eligible
        ? asNumber(school.frl_eligible)
        : undefined,
    }
  }

  function getValueText(s?: string): string | undefined {
    return s?.split('-')[1]
  }

  function getGradeCode(s?: string): string | undefined {
    if (!s) return

    switch (s.toLowerCase()) {
      case 'kindergarten':
        return 'KG'
      case 'prekindergarten':
        return 'PK'
      default:
        return s.split('th')[0]
    }
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
