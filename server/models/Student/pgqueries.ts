import { getClient } from '../../pg'
import { RepoDeleteError, RepoReadError, RepoUpdateError } from '../Errors'
import { makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'

export type ReportedStudent = {
  id: Ulid
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  isTestUser: boolean
  isBanned: boolean
  isDeactivated: boolean
  isVolunteer: boolean
  studentPartnerOrg: string
}

export async function getReportedStudent(
  studentId: Ulid
): Promise<ReportedStudent | undefined> {
  try {
    const result = await pgQueries.getReportedStudent.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentPartnerInfo = {
  id: Ulid
  studentPartnerOrg?: string
  approvedHighschool?: Ulid
}

export async function getStudentPartnerInfoById(
  studentId: Ulid
): Promise<StudentPartnerInfo | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerInfoById.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length)
      return makeSomeRequired(result[0], [
        'studentPartnerOrg',
        'approvedHighschool',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentContactInfo = {
  id: Ulid
  firstName: string
  email: string
}
export async function getStudentContactInfoById(
  studentId: Ulid
): Promise<StudentContactInfo | undefined> {
  try {
    const result = await pgQueries.getStudentContactInfoById.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// NOTE: duplicate of `isTestUser` query function in this file
// remove once there are no more callers of this function
export async function getTestStudentExistsById(
  studentId: Ulid
): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0].testUser)
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isTestUser(studentId: Ulid): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0].testUser)
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type GatesStudent = {
  id: Ulid
  studentPartnerOrg: string
  currentGrade: string
  isPartnerSchool: boolean
}

export async function getGatesStudentById(
  userId: Ulid
): Promise<GatesStudent | undefined> {
  try {
    const result = await pgQueries.getGatesStudentById.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalFavoriteVolunteers(
  userId: Ulid
): Promise<number> {
  try {
    const result = await pgQueries.getTotalFavoriteVolunteers.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<boolean> {
  try {
    const result = await pgQueries.isFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )
    if (result.length) return true
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type FavoriteVolunteer = {
  volunteerId: Ulid
  firstName: string
  numSessions: number
}

type FavoriteVolunteersResponse = {
  favoriteVolunteers: FavoriteVolunteer[]
  isLastPage: boolean
}

export type UpdateFavoriteVolunteer = {
  studentId: Ulid
  volunteerId: Ulid
}

export async function getFavoriteVolunteers(
  userId: Ulid,
  limit: number,
  offset: number
): Promise<FavoriteVolunteersResponse> {
  try {
    const result = (await pgQueries.getFavoriteVolunteers.run(
      { userId, limit: String(limit), offset: String(offset) },
      getClient()
    )) as FavoriteVolunteer[]
    return { favoriteVolunteers: result, isLastPage: result.length < limit }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<UpdateFavoriteVolunteer> {
  try {
    const result = await pgQueries.deleteFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
    throw new RepoDeleteError(
      'Delete query did not return deleted favorited volunteer'
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function addFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<UpdateFavoriteVolunteer> {
  try {
    const result = await pgQueries.addFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoUpdateError(
      'Update query did not return added favorite volunteer'
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function deleteStudent(studentId: Ulid, email: string) {
  try {
    const result = await pgQueries.deleteStudent.run(
      { userId: studentId, email },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not delete student')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type AdminUpdateStudent = {
  firstName: string
  lastName: string
  email: string
  partnerOrg: string
  partnerSite?: string
  isVerified: boolean
  isBanned: boolean
  isDeactivated: boolean
  // TODO: where did this field go and can it be dropped?
  inGatesStudy?: boolean
}

export async function adminUpdateStudent(
  studentId: Ulid,
  update: AdminUpdateStudent
) {
  try {
    const partnerOrgResult = await pgQueries.getPartnerOrgByKey.run(
      {
        partnerOrgKey: update.partnerOrg,
        partnerOrgSiteName: update.partnerSite,
      },
      getClient()
    )
    const partnerOrg = makeRequired(partnerOrgResult[0])

    // TODO: use transactions
    const results = await Promise.all([
      pgQueries.adminUpdateStudent.run(
        {
          userId: studentId,
          firstName: update.firstName,
          lastName: update.lastName,
          email: update.email,
          verified: update.isVerified,
          banned: update.isBanned,
          deactivated: update.isDeactivated,
        },
        getClient()
      ),
      pgQueries.adminUpdateStudentProfile.run(
        {
          userId: studentId,
          partnerOrgId: partnerOrg.partnerId,
          partnerOrgSiteId: partnerOrg.siteId,
        },
        getClient()
      ),
    ])

    const [updateStudentResult, updateStudentProfileResult] = results

    if (
      results.length &&
      makeRequired(updateStudentResult[0].ok) &&
      updateStudentProfileResult[0].ok
    )
      return
    throw new RepoUpdateError('Update query did not update the student')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
