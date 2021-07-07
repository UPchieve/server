import { Fact, Almanac } from 'json-rules-engine'
import { Types, Document } from 'mongoose'
import UserModel, { UserDocument } from '../models/User'

export const USER_ID = 'userId'

export const USER_FACT = new Fact(
  'user',
  async function(params, almanac) {
    const userId = await almanac.factValue(USER_ID)
    return await UserModel.findOne({ id: userId })
  }
)

export const getUser = async function(almanac: Almanac): Promise<UserDocument> {
  return await almanac.factValue<UserDocument>(USER_FACT.id)
}

// TODO: only works for mongoose documents, should work for generics
export const objToFacts = async function<T extends Document>(obj: T, prefix?: string): Promise<Fact[]> {
  const facts: Fact[] = []
  if (!prefix) prefix = ''
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    let objectCheck: boolean
    // TODO: check if its array of objectIds
    try {
      objectCheck = Types.ObjectId.isValid(value)
    } catch (err) {
      objectCheck = false
    }
    if (objectCheck) {
      // TODO: get nested from db
      await obj.populate(key).execPopulate()
      const nested = obj[key]
      if (nested)
        facts.push(...(await objToFacts(nested, '.' + key)))
    } else {
      facts.push(new Fact<typeof value>(prefix + key, value))
    }
  }
  return facts
}
