import fs from 'fs'
import parse from 'csv-parse/lib/sync'
import * as SchoolRepo from '../models/School'
import { Job } from 'bull'

export interface UpsertSchoolsData {
  schoolYear: string
}

export interface SchoolNcesMetadataRecord {
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
  county: string
  sy_status: string
  updated_status: string
  effective_date: string
  sch_type: string
  nogrades?: string
  g_pk_offered?: string
  g_kg_offered?: string
  g_1_offered?: string
  g_2_offered?: string
  g_3_offered?: string
  g_4_offered?: string
  g_5_offered?: string
  g_6_offered?: string
  g_7_offered?: string
  g_8_offered?: string
  g_9_offered?: string
  g_10_offered?: string
  g_11_offered?: string
  g_12_offered?: string
  g_13_offered?: string
  g_ug_offered?: string
  g_ae_offered?: string
  gslo?: string
  gshi?: string
  level: string
  is_school_wide_title1: string
  title1_school_status: string
  is_title1_eligible: string
  national_school_lunch_program?: string
  total_students?: number
  nslp_direct_certification?: number
  frl_eligible?: number
  rl_eligible?: number
  fl_eligible?: number
}

export const SCHOOL_RECORD_TRUE_VALUE = '1-Yes'

export default async function upsertSchools(
  job: Job<UpsertSchoolsData>
): Promise<void> {
  try {
    const schoolRecordFile = fs.readFileSync(
      `${__dirname}/../../database/seeds/static/schools/schools.csv`
    )
    const schoolRecords: SchoolNcesMetadataRecord[] = await parse(
      schoolRecordFile,
      {
        delimiter: ',',
        columns: true,
      }
    )
    await SchoolRepo.upsertSchools(job.data.schoolYear, schoolRecords)
  } catch (err) {
    throw new Error(`Error upserting school record: ${err}`)
  }
}
