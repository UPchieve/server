export function getEmailDomain(email: string) {
  const domain = email.split('@').reverse()[0]
  return domain
}
