import fs from 'fs'
import path from 'path'
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
  fileNames: string[]
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
  gslo: string | null | undefined
  gshi: string | null | undefined
  total_students: number | null | undefined
  national_school_lunch_program: string | null | undefined
  nslp_direct_certification: number | null | undefined
  frl_eligible: number | null | undefined
}

export type FormattedSchoolNcesMetadataRecord = SchoolNcesMetadataCsvRecord & {
  school_year: string
}

export default async function upsertSchools(
  job: Job<UpsertSchoolsData>
): Promise<void> {
  const baseDir = `${__dirname}/../../database/seeds/static/schools/`

  if (!job.data.fileNames.length) {
    logger.info('UpsertSchools Job: No file names provided for schools data.')
    return
  }

  let totalCreatedCount = 0
  let totalUpdatedCount = 0
  let totalErrorCount = 0
  const allErrors: string[] = []

  for (const fileName of job.data.fileNames) {
    const filePath = path.join(baseDir, fileName)

    if (!fs.existsSync(filePath)) {
      logger.error('UpsertSchools Job cannot find file `${filePath}`,')
      continue
    }

    const { createdCount, updatedCount, errorCount, errors } =
      await processSchoolsFile(filePath, job.data.schoolYear)

    totalCreatedCount += createdCount
    totalUpdatedCount += updatedCount
    totalErrorCount += errorCount
    allErrors.push(...errors)

    logger.info(
      `UpsertSchools Job processed file ${fileName}: Created ${createdCount}; Updated ${updatedCount}; Failed: ${errorCount}`
    )
  }

  logger.info(
    `UpsertSchools Job complete. Total Created ${totalCreatedCount}; Total Updated ${totalUpdatedCount}; Total Failed: ${totalErrorCount}; Errors: ${allErrors}`
  )
}

async function processSchoolsFile(
  filePath: string,
  schoolYear: string
): Promise<{
  createdCount: number
  updatedCount: number
  errorCount: number
  errors: string[]
}> {
  const parser = fs.createReadStream(filePath).pipe(
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
    const formattedSchool = getFormattedSchoolForInsert(schoolYear, school)

    if (
      !formattedSchool.lcity ||
      !formattedSchool.sch_name ||
      !formattedSchool.ncessch
    ) {
      errorCount++
      errors.push(
        `Unable to upsert school: SchoolNcesMetadataRecord missing necessary value city (${formattedSchool.lcity}), sch_name (${formattedSchool.sch_name}), or ncessch (${formattedSchool.ncessch}).`
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

  return { createdCount, updatedCount, errorCount, errors }
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
        `Failed to create school: ${schoolMetadata.sch_name} with NCES ID ${schoolMetadata.ncessch}`
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
    mzip: school.mzip,
    gslo: school.gslo,
    gshi: school.gshi,
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
