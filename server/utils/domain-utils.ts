import fs from 'fs'
import path from 'path'

let _blocklist: string[] | null = null

const getBlocklist = (): string[] => {
  if (!_blocklist) {
    const confPath = path.join(
      __dirname,
      '../../data/disposable_email_blocklist.conf'
    )
    _blocklist = fs
      .readFileSync(confPath, 'utf-8')
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
  }
  return _blocklist
}

export const isDisposableEmailDomain = (domain: string): boolean => {
  const blocklist = getBlocklist()
  const normalisedDomain = domain.trim().toLowerCase()
  return blocklist.includes(normalisedDomain)
}

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@').reverse()[0]
  return isDisposableEmailDomain(domain)
}
