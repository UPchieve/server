import mongoose from 'mongoose';
import * as db from '../db';
import Question from '../models/Question'

async function upgrade(): Promise<void> {
  try {
    await db.connect();
    const result = await Question.find(
      { isVolunteer: true},
      { category: 'algebra' })
      .exec(
        function(err, doc) {
          doc._id: mongoose.Types.ObjectId();
          doc.isNew = true;
          doc.category = 'algebraOne'
        //  d1.save();
      }
      )
    console.log('Updated: ', result);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
}



