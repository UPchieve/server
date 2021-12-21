import VolunteerModel, { Certifications, CertificationInfo } from '../models/Volunteer'
import QuestionModel from '../models/Question'
import { MATH_CERTS } from '../constants'
import mongoose from 'mongoose';
import * as db from '../db';

async function upgrade(): Promise<void> {
  let exitCode = 0
  try{
    await db.connect()

    const deletedQuestions = await QuestionModel.deleteMany({ category: MATH_CERTS.ALGEBRA})

    const result = await VolunteerModel.updateMany({}, 
      {
        $unset: { 
          'certifications.algebra' : ''
        }, 
        $pull: {
          subjects : 'algebraTwo-temporary'
        }
      }) 
    
    console.log('Questions deleted', deletedQuestions)
    console.log('Volunteers with algebra certification and algebraTwo-temporary subject removed', result)
  } catch (err) {
    console.log('Unhandled error: ', err)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0
  try{
    await db.connect()

    const addQuestions = await QuestionModel.find({ category: MATH_CERTS.ALGEBRA_ONE})

    for(const question of addQuestions){
      const obj = {
        ...question,
        category: MATH_CERTS.ALGEBRA
      }

      await QuestionModel.create(obj);
    }

    // to fix: change type to 'Certifications'
    const volunteers = await VolunteerModel.updateMany({ certifications: { $in: [ MATH_CERTS.ALGEBRA_ONE typeof CertificationInfo ]}},
      {
        $set: {
          'certifications.algebraOne': MATH_CERTS.ALGEBRA typeof Certifications
        },
        // $push: {
        //   subjects : 'algebraTwo-temporary'
        // }
      }) 
    
    console.log('Questions added', addQuestions)
    console.log('Volunteers with algebra certification changed from algebraOne to algebra', volunteers)
  } catch (err) {
    console.log('Unhandled error: ', err)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/remove-algebra-subject-and-certification.ts
if (process.env.DOWNGRADE) {
  downgrade();
} else {
  upgrade();
}