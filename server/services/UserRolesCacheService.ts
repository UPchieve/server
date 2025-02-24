import * as CacheService from '../cache'
import { KeyNotFoundError } from '../cache'

export async function saveRoleContext(
  key: string,
  value: string
): Promise<void> {
  await CacheService.save(key, value)
}

export async function getRoleContext(key: string): Promise<string | undefined> {
  try {
    return await CacheService.get(key)
  } catch (err) {
    if (err instanceof KeyNotFoundError) return undefined
    else throw err
  }
}
