import mongoose from 'mongoose'
import Volunteer, { Certifications } from '../models/Volunteer'
import Question from '../models/Question'
import * as db from '../db';

// https://stackoverflow.com/questions/16959099/how-to-remove-array-element-in-mongodb

async function upgrade(): Promise<void> {
  try{
    await db.connect();

    // deleting all algebra questions from collection
    // Model.deleteMany or Model.remove()?
    const deletedQuestions = Question.deleteMany({ category: 'algebra'})

    const removedCertification = Volunteer.updateMany({}, {
      $pull: {
        'certifications': { Certifications : 'algebra' }
      }
    })

    const removedSubject = Volunteer.updateMany({}, {
      $pull: {
        'subjects': { string: 'algebraTwo-temporary' }
      }
    })  
    
    console.log('Questions deleted', deletedQuestions);
    console.log('Volunteers with algebra certification removed', removedCertification);
    console.log('Volunteers with algebra subject removed', removedSubject);
  } catch (err) {
    console.log(err);
  }
}

upgrade()