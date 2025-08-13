import { isDisposableEmail as checkDisposableEmail } from 'disposable-email-domains-js'

export const isDisposableEmail = (email: string): boolean => {
  return checkDisposableEmail(email)
}
