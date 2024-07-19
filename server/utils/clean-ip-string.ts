export function cleanIpString(rawIpString: string): string {
  // Remove ipv6 prefix if present
  const ipString =
    rawIpString.indexOf('::ffff:') === 0 ? rawIpString.slice(7) : rawIpString
  return ipString
}
