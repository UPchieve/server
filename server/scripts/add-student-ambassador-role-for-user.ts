import * as UserRepo from '../models/User'
import * as UserRolesService from '../services/UserRolesService'
import { getClient, TransactionClient } from '../db'
async function addStudentAmbassadorRole() {
  // @TODO update user IDs before running.
  const userIds = []

  const client = getClient()

  for (const userId of userIds) {
    console.log(`Processing user ${userId}`)
    try {
      const hasAmbassadorRole = await hasStudentAmbassadorRole(userId, client)
      if (!hasAmbassadorRole) {
        await addAmbassadorRole(userId, client)
        console.log('Added ambassador role for user.')
      }
      const roleContext = await refreshRoleContext(userId, client)
      console.log(roleContext, `Refreshed role context for user.`)
    } catch (err) {
      console.error(`Error while processing user ${userId}: ${err}`, err)
      process.exit(1)
    }
  }

  process.exit(0)
}

async function hasStudentAmbassadorRole(
  userId: string,
  client: TransactionClient
) {
  const roles = await UserRepo.getUserRolesById(userId, client)
  return roles.includes('student_ambassador')
}

async function addAmbassadorRole(userId: string, client: TransactionClient) {
  await UserRepo.insertUserRoleByUserId(userId, 'student_ambassador', client)
}

async function refreshRoleContext(userId: string, client: TransactionClient) {
  const forceRefresh = true
  return await UserRolesService.getRoleContext(userId, forceRefresh, client)
}

addStudentAmbassadorRole()
