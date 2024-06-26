import { Pgid } from '../pgUtils'

export type SignUpSourceName =
  | 'Web search'
  | 'Social media'
  | 'Friend / Classmate'
  | 'School / Teacher'
  | 'Parent / Relative'
  | 'Roster'
  | 'Other'

export type SignUpSource = {
  id: Pgid
  name: string
  createdAt: Date
  updatedAt: Date
}

export type GetSignUpSourceResult = Pick<SignUpSource, 'id' | 'name'>
