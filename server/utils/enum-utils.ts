// Reverse mapping of enum
// TODO: should throw an error if key is not found
export function getEnumKeyByEnumValue<
  T extends { [index: string]: string | number }
>(myEnum: T, enumValue: string | number): keyof T | undefined {
  const keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue)
  return keys.length > 0 ? keys[0] : undefined
}
