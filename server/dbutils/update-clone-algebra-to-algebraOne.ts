import mongoose from 'mongoose';
import * as db from '../db';
import Question from '../models/Question'

async function upgrade(): Promise<void> {
  try {
    await db.connect();
    const result = await Question.find(
      { category: 'algebra' })
      .lean()
      .exec()

      for(const question in result){
        const obj1 = { question }
        const algebraOneQuestion = {
          ...obj1,
          category: 'algebraOne'
        }
        Question.create(algebraOneQuestion)
        console.log('Updated: ', algebraOneQuestion);
      }
         
  } catch (error) {
    console.error(error);
  }

  mongoose.disconnect();
}

// Run:
// npx ts-node dbutils/update-clone-algebra-to-algebraOne.ts
upgrade();
