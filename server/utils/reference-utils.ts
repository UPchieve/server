import { Reference } from '../models/Volunteer'
import { asDate, asFactory, asNumber, asString } from './type-utils'

export type ReferenceFormData = Omit<
  Reference,
  '_id' | 'firstName' | 'lastName' | 'email' | 'createdAt'
>
export const asReferenceFormData = asFactory<ReferenceFormData>({
  status: asString,
  sentAt: asDate,
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
