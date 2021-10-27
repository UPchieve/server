import { Document, model, Schema, Types, ValidatorProps } from 'mongoose'
import { validUser } from '../../utils/validators'
import { User } from '../User'

export interface UserProductFlags {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  gatesQualified: boolean
}

type UserProductFlagsDocument = UserProductFlags & Document

const UserProductFlagsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    validate: {
      validator: validUser,
      message: (props: ValidatorProps) => `${props.value} is not a valid user`,
    },
  },
  gatesQualified: {
    type: Boolean,
    default: false,
  },
})

const UserProductFlagsCollection = 'UserProductFlags'

const UserProductFlagsModel = model<UserProductFlagsDocument>(
  UserProductFlagsCollection,
  UserProductFlagsSchema
)

export default UserProductFlagsModel
