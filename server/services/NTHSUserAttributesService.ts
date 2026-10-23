import * as NTHSGroupsRepo from '../models/NTHSGroups'
import { Ulid } from '../models/pgUtils'

export type NthsUserAttributes = {
  isNthsMember: boolean
  isNthsAdmin: boolean
  isNthsPresident: boolean
}

export async function getNthsUserAttributes(
  userId: Ulid
): Promise<NthsUserAttributes> {
  const groups = await NTHSGroupsRepo.getGroupsByUser(userId)

  return {
    isNthsMember: groups.length > 0,
    isNthsAdmin: groups.some((group) => group.memberInfo.roleName === 'admin'),
    isNthsPresident: groups.some(
      (group) => group.memberInfo.title === 'President'
    ),
  }
}
