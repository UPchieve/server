import { Ulid } from '../models/pgUtils'
import * as NTHSGroupsRepo from '../models/NTHSGroups'

export async function getGroups(userId: Ulid) {
  return NTHSGroupsRepo.getGroupsByUser(userId)
}
