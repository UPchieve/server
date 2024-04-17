import { trim } from 'lodash'

/**
 * Casts the given string to a boolean
 * @param stringVal
 */
export function stringToBoolean(stringVal: string): boolean {
  return trim(stringVal.toLowerCase()) === 'true'
}
