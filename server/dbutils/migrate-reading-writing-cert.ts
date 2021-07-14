import mongoose from 'mongoose'
import * as db from '../db'
import VolunteerModel from '../models/Volunteer'

async function upgrade() {
  let exitCode = 0
  try {
    await db.connect()
    const result = await VolunteerModel.updateMany(
      {
        "certifications.humanitiesEssays": { $exists: false }
      },
      {
        $set: { "certifications.humanitiesEssays": { passed: false, tries: 0 } }
      }
    )
    console.log(`Attempted to add humanities essay certification to ${result.n} volunteers`)
    console.log(`Successfully updated ${result.nModified} volunteers`)
  } catch (err) {
    console.error(err)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
  process.exit(exitCode)
}

async function downgrade() {
  let exitCode = 0
  try {
    await db.connect()
    const result = await VolunteerModel.updateMany(
      {
        "certifications.humanitiesEssays": { $exists: true }
      },
      {
        $unset: { "certifications.humanitiesEssays": "" }
      }
    )
    console.log(`Attempted to remove humanities essay certification from ${result.n} volunteers`)
    console.log(`Successfully updated ${result.nModified} volunteers`)
  } catch (err) {
    console.error(err)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
  process.exit(exitCode)
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/migrate-reading-writing-cert.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  // npx ts-node dbutils/migrate-reading-writing-cert.ts
  upgrade()
}
