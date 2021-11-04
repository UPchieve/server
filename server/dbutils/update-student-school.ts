import mongoose from 'mongoose'
import StudentModel from '../models/Student'
import IneligibleStudentModel from '../models/IneligibleStudent'
import * as db from '../db'
import logger from '../logger'
const ObjectId = mongoose.Types.ObjectId

// Updates a student's approvedHighschool
const main = async (): Promise<void> => {
  const schoolIdToQuery = ''
  const schoolIdToUpdateTo = ''
  if (!(schoolIdToQuery && schoolIdToUpdateTo)) {
    logger.info(
      "Please enter a school id to query and one to update the student's approvedHighschool"
    )
    process.exit(1)
  }

  try {
    await db.connect()
    // TODO: the update operations below should utilize db transactions, and fail if
    //        one of the write operations does not succeed
    const studentUpdateResults = await StudentModel.updateMany(
      {
        approvedHighschool: ObjectId(schoolIdToQuery)
      },
      {
        approvedHighschool: ObjectId(schoolIdToUpdateTo)
      }
    )

    const ineligibleStudentUpdateResults = await IneligibleStudentModel.updateMany(
      {
        school: ObjectId(schoolIdToQuery)
      },
      {
        school: ObjectId(schoolIdToUpdateTo)
      }
    )

    logger.info(
      'Student update results: ',
      studentUpdateResults,
      'Ineligible student update results: ',
      ineligibleStudentUpdateResults
    )
  } catch (error) {
    logger.error(error)
    process.exit(1)
  } finally {
    mongoose.disconnect()
    process.exit(0)
  }
}

main()
