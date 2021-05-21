import moment from 'moment'
import mongoose from 'mongoose'
import dbconnect from './dbconnect'
import config from '../config'
import {
  getVolunteers,
  incrementTotalVolunteerHours
} from '../services/VolunteerService'
import { telecomHourSummaryStats } from '../utils/reportUtils'
import VolunteerModel from '../models/Volunteer'
import * as cache from '../cache'

async function upgrade(): Promise<void> {
  try {
    await dbconnect()

    const customVolunteers = await getVolunteers(
      {
        isTestUser: false,
        isFakeUser: false,
        volunteerPartnerOrg: config.customVolunteerPartnerOrg,
        isOnboarded: true,
        isApproved: true,
        isBanned: false,
        isDeactivated: false
      },
      {
        _id: 1,
        certifications: 1,
        volunteerPartnerOrg: 1,
        totalVolunteerHours: 1
      }
    )
    const startDate = moment().subtract(5, 'years')
    const endDate = moment()
    const dateQuery = { $gt: startDate.toDate(), $lte: endDate.toDate() }


    let successes = []
    let failures = []
    console.log(`Attempting to set totalVolunteerHours for ${customVolunteers.length} volunteers`)
    for (const volunteer of customVolunteers) {
      try {
        const summaryStats = await telecomHourSummaryStats(volunteer, dateQuery)
        await incrementTotalVolunteerHours(
          { _id: volunteer._id },
          summaryStats.totalVolunteerHours
        )
        successes.push(volunteer._id)
      } catch (error) {
        failures.push(`${volunteer._id}: ${error}\n`)
      }
    }
    console.log(`Successfully set totalVolunteerHours for ${successes.length} volunteers`)
    if (failures.length)
      console.log(`Failed to set totalVolunteerHours for ${failures.length} volunteers:\n${failures}`)
    else {
      console.log(`No failures. Setting cache key for last update to: ${endDate.format()}`)
      await cache.save(config.cacheKeys.updateTotalVolunteerHoursLastRun, endDate.format())
    }
  } catch(error) {
    console.log(`Uncaught error: ${error}`)
  }
  mongoose.disconnect()
}

async function downgrade(): Promise<void> {
  try {
    await dbconnect()
    const customVolunteers = await getVolunteers(
      {
        volunteerPartnerOrg: config.customVolunteerPartnerOrg,
      },
      {
        _id: 1,
        certifications: 1,
        volunteerPartnerOrg: 1,
        totalVolunteerHours: 1
      }
    )

    let successes = []
    let failures = []
    console.log(`Attempting to unset totalVolunteerHours for ${customVolunteers.length} volunteers`)
    for (const volunteer of customVolunteers) {
      try {
        await VolunteerModel.updateOne(
          { _id: volunteer._id },
          { $unset: { totalVolunteerHours: '' } }
        )
        successes.push(volunteer._id)
      } catch (error) {
        failures.push(`${volunteer._id}: ${error}\n`)
      }
    }
    console.log(`Successfully unset totalVolunteerHours for ${successes.length} volunteers`)
    if (failures.length)
      console.log(`Failed to unset totalVolunteerHours for ${failures.length} volunteers:\n${failures}`)
    else {
      console.log(`No failures. Unsetting cache key`)
      await cache.remove(config.cacheKeys.updateTotalVolunteerHoursLastRun)
    }
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
  }
  mongoose.disconnect()
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/migrate-telecom-totalVolunteerHours.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  // npx ts-node dbutils/migrate-telecom-totalVolunteerHours.ts
  upgrade()
}