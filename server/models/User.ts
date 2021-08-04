import { values, isEmpty } from 'lodash'
import { Document, model, Schema, Types, FilterQuery, Model } from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'
import config from '../config'
import { USER_BAN_REASON } from '../constants'
import { Session } from './Session'
import { IpAddress } from './IpAddress'
import emailFailedFirstAttemptedQuiz from '../worker/jobs/volunteer-emails/emailFailedFirstAttemptedQuiz'
import P from 'pino'

export interface User {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  password: string
  verified: boolean
  verifiedEmail: boolean
  verifiedPhone: boolean
  verificationToken?: string
  passwordResetToken?: string
  firstname: string
  lastname: string
  phone?: string
  college?: string
  isVolunteer: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: USER_BAN_REASON
  isTestUser: boolean
  isFakeUser: boolean
  isDeactivated: boolean
  pastSessions: Session[] | Types.ObjectId[]
  partnerUserId?: string
  lastActivityAt: Date
  referralCode: string
  referredBy?: User | Types.ObjectId
  ipAddresses: IpAddress[] | Types.ObjectId
  type: string
  hashPassword?(password: string): string
}

export type UserDocument = User & Document

const schemaOptions = {
  /**
   * https://mongoosejs.com/docs/discriminators.html#discriminator-keys
   * The discriminator key is used to discern the different inherited models. The value of the disciminatorKey
   * is the property that is added to a model and resolves to that type of model e.g:
   * new Student()   --> type: "Student"
   * new Volunteer() --> type: "Volunteer"
   *
   **/
  discriminatorKey: 'type',
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
}

// baseUserSchema is a base schema that the Student and Volunteer schema inherit from
const baseUserSchema = new Schema(
  {
    createdAt: { type: Date, default: Date.now },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: function(v): boolean {
          return validator.isEmail(v)
        },
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String,
      select: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedEmail: {
      type: Boolean,
      default: false
    },
    verifiedPhone: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    firstname: {
      type: String,
      required: [true, 'First name is required.']
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required.']
    },
    phone: {
      type: String,
      trim: true
    },
    college: String,

    // User type (volunteer or student)
    isVolunteer: {
      type: Boolean,
      default: false
    },

    isAdmin: {
      type: Boolean,
      default: false
    },

    isBanned: {
      type: Boolean,
      default: false
    },

    banReason: {
      type: String,
      enum: values(USER_BAN_REASON),
      select: false
    },

    /**
     * Test users are used to make help requests on production without bothering actual volunteers.
     * A student test user making a help request will only notify volunteer test users.
     */
    isTestUser: {
      type: Boolean,
      default: false
    },

    /*
     * Fake Users are real, fully functional accounts that we decide not to track because they've been
     * identified as accounts that aren't actual students/volunteers; just people trying out the service.
     */
    isFakeUser: {
      type: Boolean,
      default: false
    },

    isDeactivated: {
      type: Boolean,
      default: false
    },

    pastSessions: [{ type: Types.ObjectId, ref: 'Session' }],

    partnerUserId: {
      type: String,
      select: false
    },

    lastActivityAt: { type: Date, default: Date.now },

    referralCode: { type: String, unique: true },

    referredBy: {
      type: Types.ObjectId,
      ref: 'User',
      select: false
    },

    ipAddresses: {
      type: [{ type: Types.ObjectId, ref: 'IpAddress' }],
      default: [],
      select: false
    },

    // This field is created from the value set for the discriminatorKey.
    // Added to help migrate existing users to also have this field.
    type: {
      type: String
    }
  },
  schemaOptions
)

baseUserSchema.methods.hashPassword = async function(
  password
): Promise<Error | string> {
  try {
    const salt = await bcrypt.genSalt(config.saltRounds)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    throw new Error(error)
  }
}

baseUserSchema.statics.verifyPassword = (
  candidatePassword,
  userPassword
): Promise<Error | boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, userPassword, (error, isMatch) => {
      if (error) {
        return reject(error)
      }

      return resolve(isMatch)
    })
  })
}

const UserModel = model<UserDocument>('User', baseUserSchema)

module.exports = UserModel
export default UserModel


// Must type projection values to ensure only 0 or 1 are used
type Zero = 0
type One = 1

// Overloads for better typing
export async function typedFindOneUser<P extends keyof User>(
  query: FilterQuery<User & Document>
): Promise<User>

export async function typedFindOneUser<P extends keyof User>(
  query: FilterQuery<User & Document>,
  projection: Record<any, never>
): Promise<User>

export async function typedFindOneUser<P extends keyof User>(
  query: FilterQuery<User & Document>,
  projection: Record<P, Zero>
): Promise<Omit<User, P>>

export async function typedFindOneUser<P extends keyof User>(
  query: FilterQuery<User & Document>,
  projection: Record<P, One>
): Promise<Pick<User, P>>

export async function typedFindOneUser<P extends keyof User>(
  query: FilterQuery<User & Document>,
  projection: Record<P, Zero> | Record<P, One> | {} = {}
): Promise<Omit<User, P> | Pick<User, P> | User> {
  const user = await UserModel.findOne(query, projection).lean().exec()
  if (Object.values(projection).includes(1))
    return user as Pick<User, P>
  else if (Object.values(projection).includes(0))
    return user as Omit<User, P>
  else
    return user as User
}

const proj = { firstname: 1 as One }
const user = typedFindOneUser({ email: 'user@test.com' }, proj)

const emptyUser = typedFindOneUser({ email: 'empty@email.com' }, {})

const neg = { firstname: 0 as Zero }
const negUser = typedFindOneUser({ email: 'neg@test.com' }, neg)

const badProj = { firstname: 0 as Zero, lastname: 1 as One }
const badProjUser = typedFindOneUser({ email: 'bad@test.com' }, badProj)  // type error on projection

const malformed = { foo: 'foo' }
const malformedUser = typedFindOneUser({ email: 'malformed@test.com' }, malformed)  //type error on projection

// compatibility with untyped projection objects
type Projection<U, T> = Record<keyof U, T>

const oldProjection = { firstname: 1 }  // untyped
const otherUser = typedFindOneUser(
  { email: 'other@test.com' },
  oldProjection as Projection<typeof oldProjection, One>
)

// NOTE: we cannot strongly type query checks due to mongoose RootQuerySelector
// underlying implementation uses `[key: string]: any` which destroys any typing attemps

// factory style
function typedFindOneFactory<T>(model: Model<T & Document>) {
  // no projection
  async function typedFindOneT<P extends keyof T>(
    query: FilterQuery<T & Document>,
  ): Promise<T>
  // empty projection
  async function typedFindOneT<P extends keyof T>(
    query: FilterQuery<T & Document>,
    projection: Record<any, never>
  ): Promise<T>
  // negative projection
  async function typedFindOneT<P extends keyof T>(
    query: FilterQuery<T & Document>,
    projection: Record<P, Zero>
  ): Promise<Omit<T, P>>
  // positive projection
  async function typedFindOneT<P extends keyof T>(
    query: FilterQuery<T & Document>,
    projection: Record<P, One>
  ): Promise<Pick<T, P>>
  // implementation
  async function typedFindOneT<P extends keyof T>(
    query: FilterQuery<T & Document>,
    projection: Record<P, Zero> | Record<P, One> | Record<any, never> = {}
  ): Promise<Omit<T, P> | Pick<T, P> | T> {
    const t = await model.findOne(query, projection).lean().exec()
    if (Object.values(projection).includes(1))
      return t as Pick<T, P>
    else if (Object.values(projection).includes(0))
      return t as Omit<T, P>
    else
      return t as T
  }

  return typedFindOneT
}

const userFindOne = typedFindOneFactory<User>(UserModel)

const user2 = userFindOne({ email: 'user@test.com' }, proj)

const emptyUser2 = userFindOne({ email: 'empty@email.com' }, {})

const negUser2 = userFindOne({ email: 'neg@test.com' }, neg)

const badProjUser2 = userFindOne({ email: 'bad@test.com' }, badProj)  // type error on projection

const malformedUser2 = userFindOne({ email: 'malformed@test.com' }, malformed)  //type error on projection

const otherUser2 = userFindOne(
  { email: 'other@test.com' },
  oldProjection as Projection<typeof oldProjection, One>
)