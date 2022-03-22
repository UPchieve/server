import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { PgSchool } from './types'
import { makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'

export async function findSchoolByUpchieveId(
  schoolId: Ulid
): Promise<PgSchool | undefined> {
  try {
    const result = await pgQueries.findSchoolByUpchieveId.run(
      { schoolId },
      getClient()
    )

    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSchool(schoolId: Ulid): Promise<PgSchool | undefined> {
  try {
    const result = await pgQueries.getSchool.run({ schoolId }, getClient())

    // TODO: fix return type with virtuals and add approvalNotifyEmails
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type GetSchoolsPayload = {
  name: string
  state: string
  city: string
}

export async function getSchools(
  data: GetSchoolsPayload,
  limit: number,
  offset: number
): Promise<PgSchool[] | undefined> {
  try {
    const { name, state, city } = data
    const result = await pgQueries.getSchools.run(
      { name, state, city, limit: String(limit), offset: String(offset) },
      getClient()
    )

    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type CreateSchoolPayload = {
  name: string
  city: string
  state: string
  zipCode: string
  isApproved: boolean
}

export async function createSchool(
  data: CreateSchoolPayload
): Promise<PgSchool | undefined> {
  try {
    const { isApproved, name, city, state, zipCode } = data

    await pgQueries.createSchoolMetaData.run({ zipCode }, getClient())
    const result = await pgQueries.createSchool.run(
      { isApproved, name, city, state },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoCreateError(err)
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
  try {
    const result = await pgQueries.updateIsPartner.run(
      { schoolId, isPartner },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type AdminUpdate = {
  schoolId: Ulid
  name?: string
  city?: string
  state?: string
  zipCode?: string
  isApproved?: boolean
}

export async function adminUpdateSchool(data: AdminUpdate): Promise<void> {
  try {
    const { schoolId, name, city, state, zipCode, isApproved } = data

    await pgQueries.adminUpdateSchoolMetaData.run(
      { schoolId, zipCode },
      getClient()
    )
    await pgQueries.adminUpdateSchool.run(
      { schoolId, name, state, city, isApproved },
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
