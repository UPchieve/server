import fs from 'fs'
import { parse } from 'csv-parse'
import * as GeoRepo from '../models/Geography'
import * as SchoolRepo from '../models/School'
import { Job } from 'bull'
import { asNumber } from '../utils/type-utils'
import { toTitleCase } from '../utils/string-utils'
import { runInTransaction, TransactionClient } from '../db'
import logger from '../logger'
import { createSchoolMetadata } from '../models/School'

export type UpsertSchoolsData = {
  schoolYear: string
}

type SchoolNcesMetadataCsvRecord = {
  ncessch: string
  st: string
  sch_name: string
  lea_name: string
  lcity: string
  lzip: string
  mcity: string
  mzip: string
  mstate: string
  phone: string
  website: string
  sy_status: string
  updated_status: string
  effective_date: string
  sch_type: string
  nogrades: string | null | undefined
  g_pk_offered: string | null | undefined
  g_kg_offered: string | null | undefined
  g_1_offered: string | null | undefined
  g_2_offered: string | null | undefined
  g_3_offered: string | null | undefined
  g_4_offered: string | null | undefined
  g_5_offered: string | null | undefined
  g_6_offered: string | null | undefined
  g_7_offered: string | null | undefined
  g_8_offered: string | null | undefined
  g_9_offered: string | null | undefined
  g_10_offered: string | null | undefined
  g_11_offered: string | null | undefined
  g_12_offered: string | null | undefined
  g_13_offered: string | null | undefined
  g_ug_offered: string | null | undefined
  g_ae_offered: string | null | undefined
  gslo: string | null | undefined
  gshi: string | null | undefined
  level: string
  total_students: number | null | undefined
  is_school_wide_title1: string | null | undefined
  title1_school_status: string | null | undefined
  national_school_lunch_program: string | null | undefined
  nslp_direct_certification: number | null | undefined
  frl_eligible: number | null | undefined
}

export type FormattedSchoolNcesMetadataRecord = Omit<
  SchoolNcesMetadataCsvRecord,
  'sy_status' | 'updated_status' | 'sch_type' | 'is_school_wide_title1'
> & {
  school_year: string
  sy_status_text: string | null | undefined
  updated_status_text: string | null | undefined
  sch_type_text: string | null | undefined
  is_school_wide_title1: boolean
}

export const SCHOOL_RECORD_TRUE_VALUE = '1-Yes'

export default async function upsertSchools(
  job: Job<UpsertSchoolsData>
): Promise<void> {
  const parser = fs
    .createReadStream(
      `${__dirname}/../../database/seeds/static/schools/schools.csv`
    )
    .pipe(
      parse({
        delimiter: ',',
        columns: true,
      })
    )

  let createdCount = 0
  let updatedCount = 0
  let errorCount = 0
  const errors: string[] = []

  for await (const school of parser) {
    const formattedSchool = getFormattedSchoolForInsert(
      job.data.schoolYear,
      school
    )

    if (
      !formattedSchool.lcity ||
      !formattedSchool.sch_name ||
      !formattedSchool.ncessch
    ) {
      errors.push(
        `Unable to upsert school: SchoolNcesMetadataRecord missing necessary value city (${formattedSchool.lcity}),  sch_name (${formattedSchool.sch_name}),  or ncessch (${formattedSchool.ncessch}).`
      )
      continue
    }

    try {
      const existingSchool = await SchoolRepo.getSchoolByNcesId(
        formattedSchool.ncessch
      )

      if (existingSchool) {
        await SchoolRepo.updateSchoolMetadata(
          existingSchool.id,
          formattedSchool
        )
        updatedCount++
      } else {
        await addSchool(formattedSchool)
        createdCount++
      }
    } catch (err) {
      errorCount++
      errors.push(`Failed ${school.ncessch}: ` + err)
    }
  }
  logger.info(
    `upsert-schools job complete. Created ${createdCount}; Updated ${updatedCount}; Failed: ${errorCount}; Errors: ${errors}`
  )
}

async function addSchool(schoolMetadata: FormattedSchoolNcesMetadataRecord) {
  await runInTransaction(async (tc: TransactionClient) => {
    const city = await GeoRepo.upsertCity(
      schoolMetadata.lcity,
      schoolMetadata.st,
      tc
    )
    if (!city) {
      throw new Error(`Failed to upsert city: ${schoolMetadata.lcity}`)
    }
    const newSchool = await SchoolRepo.createSchool(
      schoolMetadata.sch_name,
      city.id,
      tc
    )
    if (!newSchool) {
      throw new Error(
        `Failed to create school: ${schoolMetadata.sch_name} with NCES id ${schoolMetadata.ncessch}`
      )
    }
    await createSchoolMetadata(newSchool.id, schoolMetadata, tc)
  })
}

function getFormattedSchoolForInsert(
  schoolYear: string,
  school: SchoolNcesMetadataCsvRecord
): FormattedSchoolNcesMetadataRecord {
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
    gslo: school.gslo,
    gshi: school.gshi,
    level: school.level,
    is_school_wide_title1:
      school.is_school_wide_title1 === SCHOOL_RECORD_TRUE_VALUE,
    title1_school_status: school.title1_school_status,
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

function getValueText(s?: string | null): string | undefined {
  return s?.split('-')[1]
}
