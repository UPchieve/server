import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function trainingCourses(): Promise<NameToId> {
  const courses = ['UPchieve 101']
  const temp: NameToId = {}
  for (const course of courses) {
    temp[course] = await wrapInsert(
      'training_courses',
      pgQueries.insertTrainingCourse.run,
      { name: course }
    )
  }
  return temp
}
