import mongoose from 'mongoose'
import { SUBJECTS, MATH_CERTS } from '../constants';
import VolunteerModel from '../models/Volunteer'

async function upgrade(): Promise<void> {
  let exitCode = 0;
  try{
    const result = await VolunteerModel.updateMany({
      // all volunteers who do not have at least one precalculus, calculus ab and calculus bc in their subjects and have algebraTwo
      // should only be able to take temporary algebra 2 requests till 3/1/22
      subjects: {
          $nin: [ SUBJECTS.PRECALCULUS, SUBJECTS.CALCULUS_AB, SUBJECTS.CALCULUS_BC ],
          $in: [ SUBJECTS.ALGEBRA_TWO]
        }
      },
      {
        $pull: {
          subjects: SUBJECTS.ALGEBRA_TWO
        },
        $push: {
          // setting algebraTwo-temporary?
          subjects: SUBJECTS.ALGEBRA_TWO
        }
      }
    )

    // const certifiedVolunteers = await VolunteerModel.updateMany({
    //   certifications.MATH_CERTS.ALGEBRA.passed: true
    // },
    // {
    //   $set: {
    //     certifications.MATH_CERTS.ALGEBRAONE: certifications.MATH_CERTS.ALGEBRA
    //   }
    // })

  } catch(error){
    console.error("Unhandled error: ", error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

upgrade()