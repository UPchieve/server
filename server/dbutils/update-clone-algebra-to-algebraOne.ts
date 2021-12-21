import mongoose from 'mongoose';
import * as db from '../db';
import QuestionModel from '../models/Question'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const result = await QuestionModel.find(
      { category: 'algebra' }, { _id: 0 })
      .lean()
      .exec()

      for(const question of result){
        const obj = { 
          ...question,
          category: 'algebraOne'
          }
    
        await QuestionModel.create(obj)
        console.log('Updated: ', obj)
      }
         
  } catch (error) {
    console.error("Unhandled error: ", error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode) 
  }
}

// Run:
// npx ts-node server/dbutils/update-clone-algebra-to-algebraOne.ts
upgrade();
