import mongoose from 'mongoose'
import User from '../models/User'
import * as db from '../db'

const main = async () => {
  try {
    await db.connect()
    const biology = {
      passed: false,
      tries: 0
    }
    const result = await User.updateMany(
      { isVolunteer: true },
      { $set: { 'certifications.biology': biology } },
      { strict: false }
    )
    console.log(result)
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

main()
