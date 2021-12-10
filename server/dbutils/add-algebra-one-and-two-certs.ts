import mongoose from 'mongoose'
import * as db from '../db'
import VolunteerModel from '../models/Volunteer'

// Run:
// npx ts-node server/dbutils/add-algebra-one-and-two-certs.ts
async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const certData = {
      passed: false,
      tries: 0,
    }

    const volunteers = await VolunteerModel.find({}, { certifications: 1 })
      .lean()
      .exec()

    let totalUpdated = 0

    for (const volunteer of volunteers) {
      await VolunteerModel.updateOne(
        { _id: volunteer._id },
        {
          // copy the algebra cert over to the algebraOne cert
          'certifications.algebraOne': volunteer.certifications.algebra,
          'certifications.algebraTwo': certData,
        }
      )

      totalUpdated += 1
    }

    console.log(
      `Added algebraOne and algebraTwo certs to ${totalUpdated}/${volunteers.length} volunteers`
    )
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const results = await VolunteerModel.updateMany(
      {},
      {
        $unset: {
          'certifications.algebraOne': '',
          'certifications.algebraTwo': '',
        },
      }
    )
    console.log(
      `Removed algebraOne and algebraTwo certs to ${results.nModified}/${results.n} volunteers`
    )
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/add-algebra-one-and-two-certs.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
