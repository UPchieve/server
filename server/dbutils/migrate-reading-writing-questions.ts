import mongoose from 'mongoose'
import dbconnect from './dbconnect'
import QuestionModel from '../models/Question'

async function upgrade() {
  let exitCode = 0
  try {
    await dbconnect()
    const result = await QuestionModel.updateMany(
      {
        category: 'humanities_essays'
      },
      {
        category: 'humanitiesEssays'
      },
    ).exec()
    console.log(`Attempted to camel case-ify ${result.n} questions`)
    console.log(`Sucessfully updated ${result.nModified} questions`)
  } catch (err) {
    console.error(err)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
  process.exit(exitCode)
}

async function downgrade() {
  let exitCode = 0
  try {
    await dbconnect()
    const result = await QuestionModel.updateMany(
      {
        category: 'humanitiesEssays'
      },
      {
        category: 'humanities_essays'
      },
    ).exec()
    console.log(`Attempted to snake case-ify ${result.n} questions`)
    console.log(`Sucessfully updated ${result.nModified} questions`)
  } catch (err) {
    console.error(err)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
  process.exit(exitCode)
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/migrate-reading-writing-questions.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  // npx ts-node dbutils/migrate-reading-writing-questions.ts
  upgrade()
}