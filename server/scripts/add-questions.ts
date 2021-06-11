import fs from 'fs'
import { promisify } from 'util'
import mongoose from 'mongoose'
import dbconnect from '../dbutils/dbconnect'
import QuestionModel from '../models/Question'

/*
HOW TO USE:
1. Export question objects from Mongo Copass
  - make a query for the desired questions
  - click on 'export collection' near the 'add data' button
  - export the query results and uncheck the fields '__v', '__id', and 'image'
  - save the file to desired location <filePath>
2. Run script against target database with <filePath> as first param
  - edit mongoConn string in config as needed
3. Confirm new questions exist in target database

NOTE: this script is NOT idempotent; care running it multiple times
*/

const readFileAsync = promisify(fs.readFile)

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.log('Must provide path to question JSON file as first argument!')
    process.exit(1)
  }

  let exitCode = 0
  try {
    await dbconnect()

    const data = await readFileAsync(filePath, 'utf-8')
    const questions = JSON.parse(data)

    console.log(`Attempting to clean and add ${questions.length} questions`)
    const finalQuestions = []
    // @todo: use better typing here (possibleAnswers from compass has _id)
    for (const q of questions) {
      try {
        if (q.hasOwnProperty('_id')) delete q._id
        for (const a of q.possibleAnswers) {
          if (a.hasOwnProperty('_id')) delete a._id
        }
        await QuestionModel.create(q)
        finalQuestions.push(q)
      } catch (err) {
        console.log(
          `Failed to add question: ${q.questionText}\n--${err.message}`
        )
      }
    }
    console.log(`Successfuilly added ${finalQuestions.length} questions`)
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    mongoose.disconnect()
  }
  process.exit(exitCode)
}

main()
