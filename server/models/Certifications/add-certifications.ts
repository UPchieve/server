import { Certifications, getSubjectsForVolunteer } from '../Volunteer'
import * as pgQueries from './pg.queries'
import { makeRequired, Ulid } from '../pgUtils'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getClient, closeClient } from '../../db'
import { CERT_UNLOCKING, COMPUTED_CERTS } from '../../constants'
import _ from 'lodash'

type VolunteerWithCerts = {
  id: Ulid
  certifications: Certifications
}

function eqSet(as: Set<string>, bs: Set<string>): boolean {
  if (as.size !== bs.size) return false
  for (var a of as) if (!bs.has(a)) return false
  return true
}

function unlockedSubjects(userCertifications: Certifications) {
  const currentSubjects = new Set<string>()

  for (const cert in userCertifications) {
    // Check that the required training was completed for every certification that a user has
    // Add all the other subjects that a certification unlocks to the Set
    if (
      userCertifications[cert as keyof Certifications].passed &&
      // TrainingCtrl.hasRequiredTraining(cert as keyof Certifications, userCertifications) &&
      CERT_UNLOCKING[cert as keyof typeof CERT_UNLOCKING]
    )
      CERT_UNLOCKING[cert as keyof typeof CERT_UNLOCKING].forEach(subject =>
        currentSubjects.add(subject)
      )
  }

  // Check if the user has unlocked a new certification based on the current certifications they have
  for (const cert in COMPUTED_CERTS) {
    const prerequisiteCerts =
      COMPUTED_CERTS[cert as keyof typeof COMPUTED_CERTS]
    let meetsRequirements = true

    for (let i = 0; i < prerequisiteCerts.length; i++) {
      const prereqCert = prerequisiteCerts[i]

      if (!currentSubjects.has(prereqCert)) {
        meetsRequirements = false
        break
      }
    }

    if (meetsRequirements) currentSubjects.add(cert)
  }

  return currentSubjects
}

async function addCertificationsForPassedQuiz(
  userId: Ulid,
  quizzes: string[]
): Promise<string[]> {
  try {
    const result = await pgQueries.addCertificationsForPassedQuiz.run(
      { userId, quizzes },
      getClient()
    )
    return result.map(v => makeRequired(v).name)
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

async function getVolunteersWithCerts(): Promise<VolunteerWithCerts[]> {
  try {
    const result = await pgQueries.getVolunteersWithCerts.run(
      undefined,
      getClient()
    )
    const rows = result.map(v => makeRequired(v))
    const rowsByUser = _.groupBy(rows, v => v.userId)

    const users: VolunteerWithCerts[] = []
    for (const [user, rows] of Object.entries(rowsByUser)) {
      const certs: Certifications = {}
      for (const row of rows) {
        certs[row.name] = {
          passed: row.passed,
          tries: row.tries,
          lastAttemptedAt: row.lastAttemptedAt,
        }
      }
      users.push({
        id: user,
        certifications: certs,
      })
    }
    return users
  } catch (err) {
    throw new RepoReadError(err)
  }
}

async function processVolunteer(volunteer: VolunteerWithCerts): Promise<void> {
  const passedQuizzes = Object.entries(volunteer.certifications)
    .map(v => (v[1].passed ? v[0] : ''))
    .filter(v => v !== '')
  const appUnlockedSubjects = unlockedSubjects(volunteer.certifications)

  await addCertificationsForPassedQuiz(volunteer.id, passedQuizzes)
  const dbUnlockedSubjects = new Set(
    await getSubjectsForVolunteer(volunteer.id)
  )
  const areEqual = eqSet(dbUnlockedSubjects, appUnlockedSubjects)
  if (!areEqual)
    throw new Error(
      `Volunteer ${volunteer.id} app subjects [${Array.from(
        appUnlockedSubjects
      )}] and db subjects [${Array.from(dbUnlockedSubjects)}]`
    )
}

async function main(): Promise<void> {
  let code = 0
  try {
    const volunteers = await getVolunteersWithCerts()
    const errors: string[] = []
    console.log(
      `Attempting to update certifications for ${volunteers.length} volunteers`
    )
    for (const volunteer of volunteers) {
      try {
        await processVolunteer(volunteer)
      } catch (err) {
        errors.push((err as Error).message)
      }
    }
    if (errors.length) {
      console.error(`${errors.length} volunteers have mis-matched subjects`)
      throw new Error(`${errors.join('\n')}`)
    }
  } catch (err) {
    console.error(err)
    code = 1
  } finally {
    await closeClient()
    process.exit(code)
  }
}

main()
