import { Engine } from 'json-rules-engine'
import * as RULES from './rule'
import { objToFacts } from './fact'
import UserModel from '../models/User'
import dbconnect from '../dbutils/dbconnect'

export const engine = new Engine([
  RULES.EMAIL_BANNED_USER
])

async function main() {
  try {
    await dbconnect()
    const user = await UserModel.findOne({email: "student1@upchieve.org"}).exec()
    const facts = objToFacts(user, 'User.')
    await engine.run(facts)
    process.exit(0)
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

main()