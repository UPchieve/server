import mongoose from 'mongoose'
import Volunteer from '../models/Volunteer'
import Question from '../models/Question'
import * as db from '../db';

function removeAlgebra(volunteer){
  Volunteer.updateOne(
    // https://stackoverflow.com/questions/16959099/how-to-remove-array-element-in-mongodb
  )
}


async function upgrade(): Promise<void> {
  try{
    await db.connect();

    const volunteers = Volunteer.find({})

    for(var volunteer in volunteers){
      removeAlgebra(volunteer)
    }
  } catch (err) {

  }
}