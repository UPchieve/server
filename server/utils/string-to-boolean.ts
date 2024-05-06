import { trim } from 'lodash'

/**
 * Casts the given string to a boolean
 * @param stringVal
 */
export function stringToBoolean(stringVal: string): boolean {
  const val = trim(stringVal.toLowerCase())
  if (!['true', 'false'].includes(val)) {
    throw new Error("Given string needs to resemble 'true' or 'false'")
  }
  return val === 'true'
}
