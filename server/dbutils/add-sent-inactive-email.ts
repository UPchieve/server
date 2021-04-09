import mongoose from 'mongoose'
import VolunteerModel from '../models/Volunteer'
import dbconnect from './dbconnect'

// Run:
// npx ts-node server/dbutils/add-sent-inactive-email.ts
async function upgrade(): Promise<void> {
  try {
    await dbconnect()
    const result = await VolunteerModel.updateMany(
      {},
      {
        $set: {
          sentInactiveThirtyDayEmail: false,
          sentInactiveSixtyDayEmail: false,
          sentInactiveNinetyDayEmail: false
        }
      }
    )
    console.log('Updated: ', result)
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

async function downgrade(): Promise<void> {
  try {
    await dbconnect()
    const results = await VolunteerModel.updateMany(
      {},
      {
        $unset: {
          sentInactiveThirtyDayEmail: '',
          sentInactiveSixtyDayEmail: '',
          sentInactiveNinetyDayEmail: ''
        }
      }
    )
    console.log('Updated: ', results)
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/add-sent-inactive-email.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
