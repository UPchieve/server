import {
  getDistrictAccessToken,
  getSchool,
  getSchoolsInDistrict,
  getStudentsInSchool,
  getUserProfile,
  parseCleverGrade,
  TCleverStudents,
  UPchieveSchoolId,
} from './CleverAPIService'
import * as SchoolService from './SchoolService'
import * as UserCreationService from './UserCreationService'

/**
 * Clever Secure Sync Integration (i.e. rostering with Clever).
 *
 * Admins can perform this action through the "Clever Roster" option on the admin
 * console in app.
 *
 * First, we get the district's access token using the district's id and basic auth.
 * With the district access token, we can then get the schools in the district and
 * the students within those schools. Once we have the students belonging to a school,
 * we can upsert the students.
 *
 * Right now, we are really just interested in getting the updated school for students who
 * are using Clever, but there is a lot more data we can pull from Clever that might
 * be useful to integrate with in the future.
 */
export async function rosterDistrict(
  districtId: string,
  cleverToUPchieveIds?: { [cleverSchoolId: string]: UPchieveSchoolId }
) {
  const accessToken = await getDistrictAccessToken(districtId)
  const schools = await getSchoolsInDistrict(accessToken)

  const upsertReport: {
    updatedSchools: {
      [cleverSchoolId: string]: {
        upchieveSchoolId: string
        created: unknown[]
        updated: unknown[]
        skipped: unknown[]
        failed: unknown[]
      }
    }
    failedSchools: { [cleverSchoolId: string]: string }
  } = {
    updatedSchools: {},
    failedSchools: {},
  }

  for (const school of schools) {
    try {
      let upchieveSchool

      const upchieveSchoolId = cleverToUPchieveIds?.[school.data.id]
      if (upchieveSchoolId) {
        upchieveSchool = await SchoolService.getSchool(upchieveSchoolId)
      } else if (school.data.nces_id) {
        upchieveSchool = await SchoolService.getSchoolByNcesId(
          school.data.nces_id
        )
      }

      if (!upchieveSchool) {
        let failureReason
        if (upchieveSchoolId) {
          failureReason = `No UPchieve school found with ID of ${upchieveSchoolId}`
        } else if (school.data.nces_id) {
          failureReason = `No UPchieve school found with nces_id of ${school.data.nces_id}`
        } else {
          failureReason =
            'Clever school does not contain nces_id and no mapping to UPchieve school provided.'
        }

        upsertReport.failedSchools[school.data.id] = failureReason
        continue
      }

      let cleverStudents = await getStudentsInSchool(
        school.data.id,
        accessToken
      )
      while (cleverStudents.length) {
        const filteredOut: {
          id: string
          email: string
          gradeLevel?: string
          parsedGradeLevel?: number
        }[] = []
        const students = cleverStudents
          .filter(s => {
            const grade = parseCleverGrade(s.data.roles.student.grade)
            if (grade && grade > 5 && grade < 13) {
              return true
            }
            filteredOut.push({
              id: s.data.id,
              email: s.data.email,
              gradeLevel: s.data.roles.student.grade,
              parsedGradeLevel: grade,
            })
            return false
          })
          .map(s => {
            return {
              firstName: s.data.name.first,
              lastName: s.data.name.last,
              email: s.data.email,
              gradeLevel: s.data.roles.student.grade,
            }
          })

        const result = await UserCreationService.rosterPartnerStudents(
          students,
          upchieveSchool.id,
          false
        )

        const { created = [], updated = [], failed = [] } =
          upsertReport.updatedSchools[school.data.id] || {}
        upsertReport.updatedSchools[school.data.id] = {
          upchieveSchoolId: upchieveSchool.id,
          created: [...created, ...result.created],
          updated: [...updated, ...result.updated],
          skipped: filteredOut,
          failed: [...failed, ...result.failed],
        }

        const lastStudentCleverId =
          cleverStudents[cleverStudents.length - 1].data.id
        cleverStudents = await getStudentsInSchool(
          school.data.id,
          accessToken,
          lastStudentCleverId
        )
      }
    } catch (err) {
      upsertReport.failedSchools[school.data.id] = `Error: ${err}`
      continue
    }
  }

  return upsertReport
}
