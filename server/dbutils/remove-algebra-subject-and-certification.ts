import Volunteer from '../models/Volunteer'
import Question from '../models/Question'
import * as db from '../db';

async function upgrade(): Promise<void> {
  let exitCode = 0
  try{
    await db.connect()

    const deletedQuestions = await Question.deleteMany({ category: 'algebra'})

    // since update() is a deprecated method, using updateMany
    const removedCertification = await Volunteer.updateMany({}, 
      {
        $unset: { 
          'certifications.algebra' : ''
        }
      })

    const removedSubject = await Volunteer.updateMany({}, {
      $pull: {
        subjects : 'algebraTwo-temporary'
      }
    })  
    
    console.log('Questions deleted', deletedQuestions)
    console.log('Volunteers with algebra certification removed', removedCertification)
    console.log('Volunteers with algebra subject removed', removedSubject)
  } catch (err) {
    console.log(err)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
}

upgrade()