import mongoose from 'mongoose';
import User from '../models/User';
import * as db from '../db';

// Run:
// npx ts-node dbutils/add-isapproved.ts
async function upgrade(): Promise<void> {
  try {
    await db.connect();
    const result = await User.updateMany(
      { isVolunteer: true },
      {
        $set: {
          isApproved: true
        }
      },
      { strict: false }
    );
    console.log('Updated: ', result);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
}

// npx ts-node dbutils/add-isapproved.ts
async function downgrade(): Promise<void> {
  try {
    await db.connect();
    const results = await User.updateMany(
      { isVolunteer: true },
      { $unset: { isApproved: '' } },
      { strict: false }
    );
    console.log('Updated: ', results);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/add-isapproved.ts
if (process.env.DOWNGRADE) {
  downgrade();
} else {
  upgrade();
}
