import { Pgid } from '../pgUtils'

export type SignUpSource = {
  id: Pgid
  name: string
  createdAt: Date
  updatedAt: Date
}

export type GetSignUpSourceResult = Pick<SignUpSource, 'id' | 'name'>

export type SignupSources = {
  id: number
  name: string
}
