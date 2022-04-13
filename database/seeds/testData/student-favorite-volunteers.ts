import { CERTS } from '../../../server/constants'
import {
  buildCerts,
  buildQuizzes,
  buildStudent,
  buildStudentProfile,
  buildVolunteer,
  buildSession,
} from './generate'
import { NameToId, wrapInsert } from '../utils'
import * as pgQueries from './pg.queries'

export async function studentFavoriteVolunteers(
  certIds: NameToId,
  quizIds: NameToId
) {
  const student = buildStudent({ email: 'favoritevolunteers@upchieve.org' })
  const studentProfile = buildStudentProfile({ userId: student.id })

  const volunteers = []
  const subjects = [CERTS.ALGEBRA_ONE]
  for (let i = 0; i < 5; i++) {
    volunteers.push(buildVolunteer())
  }

  await wrapInsert('users', pgQueries.insertStudentUser.run, student)
  await wrapInsert(
    'student_profiles',
    pgQueries.insertStudentProfile.run,
    studentProfile
  )

  for (const volunteer of volunteers) {
    await wrapInsert('users', pgQueries.insertVolunteerUser.run, volunteer)
    await wrapInsert(
      'student_favorite_volunteers',
      pgQueries.insertStudentFavoriteVolunteers.run,
      {
        studentId: student.id,
        volunteerId: volunteer.id,
      }
    )

    // generate a random number of times a student has had a session with a volunteer
    for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
      await wrapInsert(
        'sessions',
        pgQueries.insertSession.run,
        buildSession({
          studentId: student.id,
          volunteerId: volunteer.id,
          subjectId: certIds[subjects[0]] as number,
        })
      )
    }

    for (const subject of subjects) {
      await wrapInsert(
        'user_certifications',
        pgQueries.insertUserCertification.run,
        buildCerts({ volunteerId: volunteer.id, certIds, cert: subject })
      )

      await wrapInsert(
        'user_quizzes',
        pgQueries.insertIntoUserQuizzes.run,
        buildQuizzes({ volunteerId: volunteer.id, quizIds, quiz: subject })
      )
    }
  }
}
