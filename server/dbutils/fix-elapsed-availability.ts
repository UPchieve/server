import mongoose from 'mongoose';
import * as db from '../db';
import VolunteerModel from '../models/Volunteer';

const main = async (): Promise<void> => {
  try {
    await db.connect();

    const result = await VolunteerModel.updateMany(
      {
        isApproved: false,
        isOnboarded: true,
        elapsedAvailability: { $gt: 0 }
      },
      {
        elapsedAvailability: 0
      }
    );

    console.log(result);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
};

// To downgrade the migration run:
// npx ts-node dbutils/fix-elapsed-availability.ts
main();
