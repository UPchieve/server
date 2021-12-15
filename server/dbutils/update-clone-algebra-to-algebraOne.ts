import mongoose from 'mongoose';
import * as db from '../db';
import Question from '../models/Question'

async function upgrade(): Promise<void> {
  try {
    await db.connect();
    const result = await Question.find(
      { isVolunteer: true, category: 'algebra' })
      .lean()
      .exec()

      Question.create(result)
      
      console.log('Updated: ', result);
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
}

// Run:
// npx ts-node dbutils/update-clone-algebra-to-algebraOne.ts
upgrade();

// TODO: 
// set the category value of the cloned documents = 'algebraOne'
