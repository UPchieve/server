import { Types } from 'mongoose'

export function getIdFromModelReference<M extends { _id: Types.ObjectId }>(
  modelOrId: M | Types.ObjectId
): Types.ObjectId {
  if (modelOrId instanceof Types.ObjectId) {
    return modelOrId as Types.ObjectId
  } else {
    return (modelOrId as M)._id
  }
}

export function getModelFromModelReference<M extends { _id: Types.ObjectId }>(
  modelOrId: M | Types.ObjectId
): M {
  if (modelOrId instanceof Types.ObjectId) {
    throw new Error(`Expected model but found id ${modelOrId}`)
  } else {
    return modelOrId as M
  }
}
