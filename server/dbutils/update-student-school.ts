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
        approvedHighschool: new ObjectId(schoolIdToQuery)
      },
      {
        approvedHighschool: new ObjectId(schoolIdToUpdateTo)
      }
    )

    const ineligibleStudentUpdateResults = await IneligibleStudentModel.updateMany(
      {
        school: new ObjectId(schoolIdToQuery)
      },
      {
        school: new ObjectId(schoolIdToUpdateTo)
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
