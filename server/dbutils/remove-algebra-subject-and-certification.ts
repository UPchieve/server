import mongoose from 'mongoose'
import Volunteer, { Certifications } from '../models/Volunteer'
import Question from '../models/Question'
import * as db from '../db';

// https://stackoverflow.com/questions/16959099/how-to-remove-array-element-in-mongodb

async function upgrade(): Promise<void> {
  try{
    await db.connect();

    const deletedQuestions = await Question.deleteMany({ category: 'algebra'})

    // since update() is a deprecated method, using updateMany
    const removedCertification = await Volunteer.updateMany({}, 
      {
        $unset: { 
          "certifications.algebra": "" 
        }
      }, 
      { 
        multi: true
      })

    const removedSubject = await Volunteer.updateMany({}, {
      $pull: {
        subjects : 'algebraTwo-temporary'
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