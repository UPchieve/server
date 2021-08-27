// Reverse mapping of enum
export function getEnumKeyByEnumValue<
  T extends { [index: string]: string | number }
>(myEnum: T, enumValue: string | number): keyof T | null {
  const keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue)
  return keys.length > 0 ? keys[0] : null
}
