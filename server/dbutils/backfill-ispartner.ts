import mongoose from 'mongoose'
import * as db from '../db'
import SchoolModel from '../models/School'

// Run:
// npx ts-node server/dbutils/backfill-ispartner.ts
async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const result = await SchoolModel.updateMany(
      { isPartner: {
        $exists: false
      }},
      { $set: { isPartner: false } }
    )
    console.log(result)
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
