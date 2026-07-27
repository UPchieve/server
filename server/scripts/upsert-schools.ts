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
import {
  type FormattedSchoolNcesMetadataRecord,
  type PublicSchoolCsvRecord,
  type PrivateSchoolCsvRecord,
} from '../types/school-csv-data'

export type UpsertSchoolsData = {
  schoolYear: string
  fileNames: string[]
  schoolDataType?: 'private' | 'public'
}

type SchoolFormatter = (
  schoolYear: string,
  school: unknown
) => FormattedSchoolNcesMetadataRecord

const privateSchoolGradeLabels: Record<string, string> = {
  '1': 'All Ungraded',
  '2': 'Prekindergarten',
  '3': 'Kindergarten',
  '4': 'Transitional Kindergarten',
  '5': 'Transitional First Grade',
  '6': '1st Grade',
  '7': '2nd Grade',
  '8': '3rd Grade',
  '9': '4th Grade',
  '10': '5th Grade',
  '11': '6th Grade',
  '12': '7th Grade',
  '13': '8th Grade',
  '14': '9th Grade',
  '15': '10th Grade',
  '16': '11th Grade',
  '17': '12th Grade',
}

export default async function upsertSchools(
  job: Job<UpsertSchoolsData>
): Promise<void> {
  const baseDir = `${__dirname}/../../database/seeds/static/schools/`
  const schoolFormatter =
    job.data.schoolDataType === 'private'
      ? getFormattedPrivateSchoolForInsert
      : getFormattedSchoolForInsert

  if (!job.data.fileNames.length) {
    logger.info('UpsertSchools Job: No file names provided for schools data.')
    return
  }

  let totalCreatedCount = 0
  let totalUpdatedCount = 0
  let totalErrorCount = 0

  for (const fileName of job.data.fileNames) {
    const filePath = path.join(baseDir, fileName)

    if (!fs.existsSync(filePath)) {
      logger.error('UpsertSchools Job cannot find file `${filePath}`,')
      continue
    }

    const { createdCount, updatedCount, errorCount } = await processSchoolsFile(
      filePath,
      job.data.schoolYear,
      schoolFormatter
    )

    totalCreatedCount += createdCount
    totalUpdatedCount += updatedCount
    totalErrorCount += errorCount

    logger.info(
      {
        fileName,
        createdCount,
        updatedCount,
        errorCount,
      },
      `UpsertSchools Job processed ${job.data.schoolDataType} school file`
    )
  }

  logger.info(
    {
      totalCreatedCount,
      totalUpdatedCount,
      totalErrorCount,
    },
    `UpsertSchools Job completed all files`
  )
}

async function processSchoolsFile(
  filePath: string,
  schoolYear: string,
  schoolFormatter: SchoolFormatter
): Promise<{
  createdCount: number
  updatedCount: number
  errorCount: number
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

  for await (const school of parser) {
    const formattedSchool = schoolFormatter(schoolYear, school)

    if (
      !formattedSchool.lcity ||
      !formattedSchool.sch_name ||
      !formattedSchool.ncessch
    ) {
      errorCount++
      logger.warn(
        { formattedSchool },
        'Unable to upsert school: SchoolNcesMetadataRecord missing necessary value city, sch_name, or ncessch.'
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
        logger.info({ school: existingSchool }, 'Updated Existing School')
        updatedCount++
      } else {
        await addSchool(formattedSchool)
        logger.info({ school: formattedSchool }, 'Added School')
        createdCount++
      }
    } catch (err) {
      errorCount++
      logger.warn({ err, school }, 'Failed to process school')
    }
  }

  return { createdCount, updatedCount, errorCount }
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
  school: unknown
): FormattedSchoolNcesMetadataRecord {
  const publicSchool = school as PublicSchoolCsvRecord

  return {
    ncessch: publicSchool.ncessch,
    school_year: schoolYear,
    st: publicSchool.st,
    sch_name: toTitleCase(publicSchool.sch_name),
    lea_name: toTitleCase(publicSchool.lea_name),
    lcity: toTitleCase(publicSchool.lcity),
    lzip: publicSchool.lzip,
    mcity: toTitleCase(publicSchool.mcity),
    mzip: publicSchool.mzip,
    gslo: publicSchool.gslo,
    gshi: publicSchool.gshi,
    national_school_lunch_program: publicSchool.national_school_lunch_program,
    total_students: publicSchool.total_students
      ? asNumber(publicSchool.total_students)
      : undefined,
    nslp_direct_certification: publicSchool.nslp_direct_certification
      ? asNumber(publicSchool.nslp_direct_certification)
      : undefined,
    frl_eligible: publicSchool.frl_eligible
      ? asNumber(publicSchool.frl_eligible)
      : undefined,
  }
}

function getFormattedPrivateSchoolForInsert(
  schoolYear: string,
  school: unknown
): FormattedSchoolNcesMetadataRecord {
  const privateSchool = school as PrivateSchoolCsvRecord

  return {
    ncessch: privateSchool.PPIN,
    school_year: schoolYear,
    st: privateSchool.PSTABB,
    sch_name: toTitleCase(privateSchool.PINST),
    lea_name: undefined,
    lcity: toTitleCase(privateSchool.PCITY),
    lzip: privateSchool.PZIP,
    mcity: toTitleCase(privateSchool.PCITY),
    mzip: privateSchool.PZIP,
    gslo: formatPrivateSchoolGrade(privateSchool.LOGR2022),
    gshi: formatPrivateSchoolGrade(privateSchool.HIGR2022),
    national_school_lunch_program: null,
    total_students: privateSchool.NUMSTUDS
      ? asNumber(privateSchool.NUMSTUDS)
      : undefined,
    nslp_direct_certification: null,
    frl_eligible: null,
  }
}

function formatPrivateSchoolGrade(
  gradeCode: string | null | undefined
): string | undefined {
  if (!gradeCode) return undefined

  return privateSchoolGradeLabels[gradeCode] ?? gradeCode
}
