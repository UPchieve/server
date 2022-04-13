import { asFactory, asNumber, asString } from './type-utils'

export type ReferenceFormData = {
  affiliation: string
  relationshipLength: string
  patient: number
  positiveRoleModel: number
  agreeableAndApproachable: number
  communicatesEffectively: number
  trustworthyWithChildren: number
  rejectionReason: string
  additionalInfo: string
}

export const asReferenceFormData = asFactory<ReferenceFormData>({
  affiliation: asString,
  relationshipLength: asString,
  patient: asNumber,
  positiveRoleModel: asNumber,
  agreeableAndApproachable: asNumber,
  communicatesEffectively: asNumber,
  trustworthyWithChildren: asNumber,
  rejectionReason: asString,
  additionalInfo: asString,
})
