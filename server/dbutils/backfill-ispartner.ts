import mongoose from 'mongoose'
import User from '../models/User'
import * as db from '../db'

// Run:
// npx ts-node server/dbutils/backfill-ispartner.ts
const main = async () => {
  try {
    await db.connect()
   
    const result = await User.updateMany(
      //should we filter by if the user is a student?
//      { isStudent: true },
      { $set: { 'school.isPartner': false } },
      { strict: false }
    )
    console.log(result)
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

main()
