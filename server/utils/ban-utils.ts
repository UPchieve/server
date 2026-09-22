import { USER_BAN_TYPES } from '../constants'

export function isPlatformBanType(banType?: USER_BAN_TYPES | null): boolean {
  return (
    banType === USER_BAN_TYPES.COMPLETE || banType === USER_BAN_TYPES.SHADOW
  )
}
