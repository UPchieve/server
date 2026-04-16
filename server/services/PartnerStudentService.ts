import { getClient, runInTransaction, TransactionClient } from '../db'
import * as StudentRepo from '../models/Student/queries'
import * as StudentPartnerOrgRepo from '../models/StudentPartnerOrg/queries'
import logger from '../logger'

export interface DeactivationRosterPayload {
  email: string
  deactivatedOn?: string
}

export async function bulkDeactivatePartnerStudents(
  rows: DeactivationRosterPayload[],
  partnerKey: string
): Promise<{
  deactivated: { email: string }[]
  skipped: { email: string; reason: string }[]
}> {
  const partnerOrgId = await getPartnerOrgIdByKey(partnerKey)

  const deactivated: { email: string }[] = []
  const skipped: { email: string; reason: string }[] = []

  for (const row of rows) {
    try {
      const result = await deactivatePartnerStudent(row, partnerOrgId)
      if (result.skip) {
        skipped.push({ email: row.email, reason: result.skip })
      } else {
        deactivated.push({ email: row.email })
      }
    } catch (err) {
      logger.error({ err, email: row.email }, 'Failed to deactivate student')
      skipped.push({ email: row.email, reason: 'unexpected error' })
    }
  }

  return { deactivated, skipped }
}

async function getPartnerOrgIdByKey(partnerKey: string) {
  const partnerOrg = await StudentPartnerOrgRepo.getStudentPartnerOrgByKey(
    getClient(),
    partnerKey
  )
  if (!partnerOrg) {
    throw new Error(`No partner organization found for key "${partnerKey}".`)
  }
  const partnerOrgId = partnerOrg.partnerId
  return partnerOrgId
}

async function deactivatePartnerStudent(
  row: DeactivationRosterPayload,
  partnerOrgId: string
) {
  const result = await runInTransaction(async (tc: TransactionClient) => {
    const student = await StudentRepo.getStudentByEmail(row.email, tc)
    if (!student) return { skip: 'user not found' }

    const activeInstances = await StudentRepo.getActivePartnersForStudent(
      student.id,
      tc
    )
    const match = activeInstances?.find((i) => i.id === partnerOrgId)
    if (!match) return { skip: 'no active partnership at this partner' }

    let deactivatedOn: Date | undefined
    if (row.deactivatedOn) {
      deactivatedOn = new Date(row.deactivatedOn)
      if (isNaN(deactivatedOn.getTime()))
        return { skip: 'invalid deactivatedOn date' }
    }

    await StudentPartnerOrgRepo.deactivateUserStudentPartnerOrgInstance(
      tc,
      student.id,
      partnerOrgId,
      deactivatedOn
    )
    return { skip: null }
  })
  return result
}
