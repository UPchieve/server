import mongoose from 'mongoose'
import * as db from '../db'
import StudentModel from '../models/Student'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try{
    await db.connect()

    // const eligibleStudents = StudentModel.updateMany({
    //   $or: [
    //     // gatesQualified: true,
    //     // processPartnerSchoolGatesQualified: true,

    //   ]  
    // },
    // )
  } catch(error){
    console.log(error)
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}