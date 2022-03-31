import mongoose from 'mongoose'
import * as db from '../db'
import SchoolModel from '../models/School'
import async from 'async'

// Run:
// npx ts-node server/dbutils/normalize-school-location-data.ts
async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const schools = await SchoolModel.find({
      '$or': [
        {
          'cityNameStored': {
            '$exists': false
          }
        }, {
          'stateStored': {
            '$exists': false
          }
        }
      ]
    }, {
        _id: 1,
        ST: 1,
        LCITY: 1
      }).lean().exec()
    console.log(schools.length)
    console.log(schools[0])
    console.log(schools[1])
    await async.forEach(schools, async (school) => {
      await SchoolModel.updateOne({_id: school._id}, {
        stateStored: school.ST,
        cityNameStored: school.LCITY
      })
    })
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0;
  try {
    await db.connect();
    const result = await SchoolModel.updateMany(
      { isPartner: {
          $exists: true
        }},
      {
        $unset: {
          isPartner: ''
        }
      }
    );
    console.log(result);

  } catch (error) {
    console.error(error);
    exitCode = 1;
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// Run:
// DOWNGRADE = true npx ts-node server/dbutils/backfill-ispartner.ts
if(process.env.DOWNGRADE){
  downgrade();
}
else {
  upgrade();
}
