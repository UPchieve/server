import mongoose from 'mongoose';
import Notification from '../models/Notification';
import Session from '../models/Session';
import * as db from '../db';

// Run:
// npx ts-node dbutils/add-sessionid-to-notifications.ts
async function upgrade(): Promise<void> {
  try {
    await db.connect();
    const sessions = await Session.find({'notifications.0': { $exists: true }}).lean().exec();

    for(const session of sessions){
        const result = await Notification.updateMany(
          { 
            _id: 
            { 
              $in: session.notifications 
            }
          },
          { 
            $set: {
              sessionId: session._id 
            },
            $project: {
                _id: 1,
                notifications: 1
              }
          },
        );
        console.log('Updated: ', result);
    }
  } catch (error) {
      console.error(error);
  }

  mongoose.disconnect();
}

// npx ts-node dbutils/add-sessionid-to-notifications.ts
async function downgrade(): Promise<void> {
  try {
    await db.connect();
        const result = await Notification.updateMany(
          {},
          { 
            $unset: {
              sessionId: ''
            }
          }
        );
        console.log('Updated: ', result);
  } catch (error) {
      console.error(error);
  }

  mongoose.disconnect();
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/add-sessionid-to-notifications.ts
if (process.env.DOWNGRADE) {
  downgrade();
} else {
  upgrade();
}