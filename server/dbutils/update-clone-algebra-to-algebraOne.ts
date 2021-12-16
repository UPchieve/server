import * as db from '../db';
import Question from '../models/Question'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
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
        console.log('Updated: ', algebraOneQuestion)
      }
         
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

// Run:
// npx ts-node dbutils/update-clone-algebra-to-algebraOne.ts
upgrade();
