import mongoose from 'mongoose';
import * as db from '../db';
import Session from '../models/Session';

const upgrade = async (): Promise<void> => {
  try {
    await db.connect();

    const results = await Session.updateMany({}, { flags: [] });

    console.log(results);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
};

async function downgrade(): Promise<void> {
  try {
    await db.connect();
    const results = await Session.updateMany(
      {},
      {
        $unset: {
          flags: ''
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
// DOWNGRADE=true npx ts-node dbutils/add-session-flags.ts
if (process.env.DOWNGRADE) {
  downgrade();
} else {
  upgrade();
}
