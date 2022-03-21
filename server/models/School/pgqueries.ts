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

export async function getSchool(schoolId: Ulid) {
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

export type CreateSchoolPayload = {
  name: string
  city: string
  state: string
  zipCode: string
  isApproved: boolean
}

export async function createSchool(data: CreateSchoolPayload) {
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

export async function updateApproval(schoolId: Ulid, isApproved: boolean) {
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

export async function updateIsPartner(schoolId: Ulid, isPartner: boolean) {
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

export async function adminUpdateSchool(data: AdminUpdate) {
  try {
    const { schoolId, name, city, state, zipCode, isApproved } = data

    await pgQueries.adminUpdateSchoolMetaData.run(
      { schoolId, zipCode },
      getClient()
    )
    const result = await pgQueries.adminUpdateSchool.run(
      { schoolId, name, state, city, isApproved },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
