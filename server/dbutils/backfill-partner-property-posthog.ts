import mongoose from 'mongoose'
import VolunteerModel from '../models/Volunteer'
import StudentModel from '../models/Student'
import * as db from '../db'
import config from '../config'
import axios from 'axios'
import {
  volunteerPartnerManifests,
  studentPartnerManifests
} from '../partnerManifests'

const POSTHOG_API_ROOT = `https://app.posthog.com/api/person`
const apiOptions = {
  headers: {
    Authorization: `Bearer ${config.posthogPersonalApiToken}`
  }
}
const getPersonByDistinctId = distinctId =>
  axios.get(
    `${POSTHOG_API_ROOT}/by_distinct_id/?distinct_id=${distinctId}`,
    apiOptions
  )
const updatePerson = (id, update) =>
  axios.patch(`${POSTHOG_API_ROOT}/${id}`, update, apiOptions)

async function addPartnerToUsers(
  users,
  partnerManifests,
  isVolunteer
): Promise<void> {
  for (const user of users) {
    let partnerOrg = ''
    if (isVolunteer) partnerOrg = user.volunteerPartnerOrg
    else partnerOrg = user.studentPartnerOrg

    try {
      const {
        data: { id: posthogUserId, properties }
      } = await getPersonByDistinctId(user._id)
      await updatePerson(posthogUserId, {
        properties: {
          // copy previous properties to the upadte
          ...properties,
          partner: partnerManifests[partnerOrg].name
        }
      })
    } catch (error) {
      console.log('Unable to find user')
    }
  }
}

async function backfillVolunteerPartners(): Promise<void> {
  try {
    await db.connect()

    const volunteers = await VolunteerModel.find({
      volunteerPartnerOrg: { $exists: true },
      // PostHog was implemented in the beginning of 2021. Users with
      // a recent lastActivityAt are more likely stored in PostHog
      lastActivityAt: { $gte: new Date('2021-01-01T00:00:00.000+00:00') }
    })
      .lean()
      .exec()

    await addPartnerToUsers(volunteers, volunteerPartnerManifests, true)
  } catch (error) {
    console.log('error', error)
  }

  mongoose.disconnect()
}

async function backfillStudentPartners(): Promise<void> {
  try {
    await db.connect()

    const students = await StudentModel.find({
      studentPartnerOrg: { $exists: true },
      lastActivityAt: { $gte: new Date('2021-01-01T00:00:00.000+00:00') }
    })
      .lean()
      .exec()

    await addPartnerToUsers(students, studentPartnerManifests, false)
  } catch (error) {
    console.log('error', error)
  }

  mongoose.disconnect()
}

// To run:
// npx ts-node server/dbutils/backfill-partner-property-posthog.ts
backfillVolunteerPartners()
backfillStudentPartners()


