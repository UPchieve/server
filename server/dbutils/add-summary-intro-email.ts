import mongoose from 'mongoose';
import * as db from '../db';
import VolunteerModel from '../models/Volunteer';

const upgrade = async (): Promise<void> => {
  try {
    await db.connect();

    const results = await VolunteerModel.updateMany(
      {},
      {
        sentHourSummaryIntroEmail: false
      }
    );
    console.log(results);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
};

async function downgrade(): Promise<void> {
  try {
    await db.connect();
    const results = await VolunteerModel.updateMany(
      {},
      {
        $unset: {
          sentHourSummaryIntroEmail: ''
        }
      }
    );
    console.log(results);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/add-summary-intro-email.ts
if (process.env.DOWNGRADE) {
  downgrade();
} else {
  upgrade();
}
