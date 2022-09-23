import { MongoClient } from 'mongodb'
import { addMissingCerts } from '../controllers/TrainingCtrl'
import * as db from '../db'
import { getVolunteerWithCert, addMissingQuiz } from '../models/Volunteer'
import config from '../config'

// Create a new MongoClient
const client = new MongoClient(config.mongoDbConn)
const usersCollection = client.db().collection('users')

type CertType = {
  passed: boolean
  tries: number
  lastAttemptedAt?: Date
}

async function main() {
  let exitCode = 0
  try {
    // Connect the clients to the MongoDb and Postgres
    await client.connect()
    await db.connect()

    // Get all volunteers from MongoDB
    const cursor = usersCollection
      .find({ isVolunteer: true })
      .project({ _id: 1, certifications: 1 })
    for await (const doc of cursor) {
      // We need to stringify _id because it is type ObjectId
      // We're grabbing the volunteer using mongo's _id
      const volunteer = await getVolunteerWithCert(String(doc._id))
      if (!volunteer) continue
      const missingCerts = []

      // Determine which certs our Postgres volunteer is missing and
      // add any missing quizzes
      for (const [cert, certData] of Object.entries(doc.certifications) as [
        string,
        CertType
      ][]) {
        // upchieve101 lives as a training quiz, not as a certification in PG
        if (cert === 'upchieve101') continue
        if (certData.passed && !volunteer.certifications.hasOwnProperty(cert))
          missingCerts.push(cert)

        /**
         *
         * Volunteers who previously passed a subject, but do not have a
         * lastAttemptedAt on their record did not get migrated to Postgres properly
         * Adding the missing quiz ensures that we have their passed quizzes in PG
         *
         */
        if (certData.passed) await addMissingQuiz(volunteer.id, cert, true)
      }

      for (const cert of missingCerts) {
        await addMissingCerts(volunteer.id, cert)
      }
    }
    console.log('Added the missing certs to volunteers')
  } catch (error) {
    console.log(`error: ${error}`)
    exitCode = 1
  } finally {
    await client.close()
    await db.closeClient()
    process.exit(exitCode)
  }
}

main()
