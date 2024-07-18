import { NameToId } from '../utils'
import * as pgQueries from './pg.queries'
import client from '../pgClient'

function buildMapFromRows(
  rows: { id: string | number; name: string }[]
): NameToId {
  const map: NameToId = {}
  for (const row of rows) {
    if (row.id && row.name) map[row.name] = row.id
  }
  return map
}

export async function getVolunteerPartnerOrgs(): Promise<NameToId> {
  try {
    const result = await pgQueries.getVolunteerPartnerOrgs.run(
      undefined,
      client
    )
    return buildMapFromRows(result)
  } catch {
    throw new Error('Could not lookup partner orgs')
  }
}

export async function getCertifications(): Promise<NameToId> {
  try {
    const result = await pgQueries.getCertifications.run(undefined, client)
    return buildMapFromRows(result)
  } catch {
    throw new Error('Could not lookup partner orgs')
  }
}

export async function getQuizzes(): Promise<NameToId> {
  try {
    const result = await pgQueries.getQuizzes.run(undefined, client)
    return buildMapFromRows(result)
  } catch {
    throw new Error('Could not lookup partner orgs')
  }
}

export async function getStudentPartnerOrgs(): Promise<NameToId> {
  try {
    const result = await pgQueries.getStudentPartnerOrgs.run(undefined, client)
    return buildMapFromRows(result)
  } catch {
    throw new Error('Could not lookup partner orgs')
  }
}

export async function getAlgebraOneSubcategories(): Promise<NameToId> {
  try {
    const result = await pgQueries.getAlgebraOneSubcategories.run(
      undefined,
      client
    )
    return buildMapFromRows(result)
  } catch {
    throw new Error('Could not lookup partner orgs')
  }
}
