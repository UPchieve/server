import * as UserRepo from '../models/User'
import * as UserRolesService from '../services/UserRolesService'
import { getClient, TransactionClient } from '../db'
import { Job } from 'bull'
import logger from '../logger'

export interface BackfillStudentAmbassadorRoleJobData {
  userIds: string[]
}

export default async function (job: Job<BackfillStudentAmbassadorRoleJobData>) {
  const jobName = 'BackfillStudentAmbassadorRole'
  const client = getClient()

  for (const userId of job.data.userIds) {
    logger.info(`${jobName}: Processing user ${userId}`)
    try {
      const hasAmbassadorRole = await hasStudentAmbassadorRole(userId, client)
      if (!hasAmbassadorRole) {
        await addAmbassadorRole(userId, client)
        logger.info(`${jobName}: Added ambassador role for user ${userId}`)
      }
      const roleContext = await refreshRoleContext(userId, client)
      logger.info(roleContext, `${jobName}: Refreshed role context for user.`)
    } catch (err) {
      logger.error(
        `${jobName}: Error while processing user ${userId}: ${err}`,
        err
      )
    }
  }
}

async function hasStudentAmbassadorRole(
  userId: string,
  client: TransactionClient
) {
  const roles = await UserRepo.getUserRolesById(userId, client)
  return roles.includes('ambassador')
}

async function addAmbassadorRole(userId: string, client: TransactionClient) {
  await UserRepo.insertUserRoleByUserId(userId, 'ambassador', client)
}

async function refreshRoleContext(userId: string, client: TransactionClient) {
  const forceRefresh = true
  return await UserRolesService.getRoleContext(userId, forceRefresh, client)
}
