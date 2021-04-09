import { ProcessPromiseFunction, Queue } from 'bull'
import { map } from 'lodash'
import * as Sentry from '@sentry/node'
import newrelic from 'newrelic'
import { log } from '../logger'
import notifyTutors from './notifyTutors'
import updateElapsedAvailability from './updateElapsedAvailability'
import endStaleSessions from './endStaleSessions'
import endUnmatchedSession from './endUnmatchedSession'
import emailReferences from './emailReferences'
import emailReadyToCoach from './emailReadyToCoach'
import emailReferenceFollowup from './emailReferenceFollowup'
import emailWaitingOnReferences from './emailWaitingOnReferences'
import emailNiceToMeetYou from './emailNiceToMeetYou'
import emailWeeklyHourSummary from './emailWeeklyHourSummary'
import emailOnboardingReminder from './volunteer-emails/emailOnboardingReminder'
import emailQuickTips from './volunteer-emails/emailQuickTips'
import emailPartnerVolunteerOnlyCollegeCerts from './partner-volunteer-emails/emailOnlyCollegeCerts'
import emailPartnerVolunteerLowHoursSelected from './partner-volunteer-emails/emailLowHoursSelected'
import emailStudentWelcomeSeries from './student-emails/emailStudentWelcomeSeries'
import emailPartnerVolunteerReferACoworker from './partner-volunteer-emails/emailReferACoworker'
import emailPartnerVolunteerTenSessionMilestone from './partner-volunteer-emails/emailTenSessionMilestone'
import emailVolunteerGentleWarning from './volunteer-emails/emailGentleWarning'
import emailVolunteerInactive from './volunteer-emails/emailVolunteerInactive'
import emailVolunteerFirstSessionCongrats from './volunteer-emails/emailVolunteerFirstSessionCongrats'
import emailStudentFirstSessionCongrats from './student-emails/emailStudentFirstSessionCongrats'

export enum Jobs {
  NotifyTutors = 'NotifyTutors',
  UpdateElapsedAvailability = 'UpdateElapsedAvailability',
  EndStaleSessions = 'EndStaleSessions',
  EndUnmatchedSession = 'EndUnmatchedSession',
  EmailReferences = 'EmailReferences',
  EmailReadyToCoach = 'EmailReadyToCoach',
  EmailReferenceFollowup = 'EmailReferenceFollowup',
  EmailWaitingOnReferences = 'EmailWaitingOnReferences',
  EmailNiceToMeetYou = 'EmailNiceToMeetYou',
  EmailWeeklyHourSummary = 'EmailWeeklyHourSummary',
  EmailOnboardingReminderOne = 'EmailOnboardingReminderOne',
  EmailOnboardingReminderTwo = 'EmailOnboardingReminderTwo',
  EmailOnboardingReminderThree = 'EmailOnboardingReminderThree',
  EmailStudentUseCases = 'EmailStudentUseCases',
  EmailIndependentLearning = 'EmailIndependentLearning',
  EmailMeetOurVolunteers = 'EmailMeetOurVolunteers',
  EmailStudentGoalSetting = 'EmailStudentGoalSetting',
  EmailVolunteerQuickTips = 'EmailVolunteerQuickTips',
  EmailPartnerVolunteerOnlyCollegeCerts = 'EmailVolunteerCollegeCertsOnly',
  EmailPartnerVolunteerLowHoursSelected = 'EmailPartnerVolunteerLowHoursSelected',
  EmailPartnerVolunteerReferACoworker = 'EmailPartnerVolunteerReferACoworker',
  EmailPartnerVolunteerTenSessionMilestone = 'EmailPartnerVolunteerTenSessionMilestone',
  EmailVolunteerGentleWarning = 'EmailVolunteerGentleWarning',
  EmailVolunteerInactiveThirtyDays = 'EmailVolunteerInactiveThirtyDays',
  EmailVolunteerInactiveSixtyDays = 'EmailVolunteerInactiveSixtyDays',
  EmailVolunteerInactiveNinetyDays = 'EmailVolunteerInactiveNinetyDays',
  EmailVolunteerInactive = 'EmailVolunteerInactive',
  EmailVolunteerFirstSessionCongrats = 'EmailVolunteerFirstSessionCongrats',
  EmailStudentFirstSessionCongrats = 'EmailStudentFirstSessionCongrats'
}

// register new job processors here
interface JobProcessor {
  name: Jobs
  processor: ProcessPromiseFunction<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

const jobProcessors: JobProcessor[] = [
  {
    name: Jobs.NotifyTutors,
    processor: notifyTutors
  },
  {
    name: Jobs.UpdateElapsedAvailability,
    processor: updateElapsedAvailability
  },
  {
    name: Jobs.EndStaleSessions,
    processor: endStaleSessions
  },
  {
    name: Jobs.EndUnmatchedSession,
    processor: endUnmatchedSession
  },
  {
    name: Jobs.EmailReferences,
    processor: emailReferences
  },
  {
    name: Jobs.EmailReadyToCoach,
    processor: emailReadyToCoach
  },
  {
    name: Jobs.EmailReferenceFollowup,
    processor: emailReferenceFollowup
  },
  {
    name: Jobs.EmailWaitingOnReferences,
    processor: emailWaitingOnReferences
  },
  {
    name: Jobs.EmailNiceToMeetYou,
    processor: emailNiceToMeetYou
  },
  {
    name: Jobs.EmailWeeklyHourSummary,
    processor: emailWeeklyHourSummary
  },
  {
    name: Jobs.EmailOnboardingReminderOne,
    processor: emailOnboardingReminder
  },
  {
    name: Jobs.EmailOnboardingReminderTwo,
    processor: emailOnboardingReminder
  },
  {
    name: Jobs.EmailOnboardingReminderThree,
    processor: emailOnboardingReminder
  },
  {
    name: Jobs.EmailStudentUseCases,
    processor: emailStudentWelcomeSeries
  },
  {
    name: Jobs.EmailMeetOurVolunteers,
    processor: emailStudentWelcomeSeries
  },
  {
    name: Jobs.EmailIndependentLearning,
    processor: emailStudentWelcomeSeries
  },
  {
    name: Jobs.EmailStudentGoalSetting,
    processor: emailStudentWelcomeSeries
  },
  {
    name: Jobs.EmailVolunteerQuickTips,
    processor: emailQuickTips
  },
  {
    name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
    processor: emailPartnerVolunteerOnlyCollegeCerts
  },
  {
    name: Jobs.EmailPartnerVolunteerLowHoursSelected,
    processor: emailPartnerVolunteerLowHoursSelected
  },
  {
    name: Jobs.EmailPartnerVolunteerReferACoworker,
    processor: emailPartnerVolunteerReferACoworker
  },
  {
    name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
    processor: emailPartnerVolunteerTenSessionMilestone
  },
  {
    name: Jobs.EmailVolunteerGentleWarning,
    processor: emailVolunteerGentleWarning
  },
  {
    name: Jobs.EmailVolunteerInactive,
    processor: emailVolunteerInactive
  },
  {
    name: Jobs.EmailVolunteerFirstSessionCongrats,
    processor: emailVolunteerFirstSessionCongrats
  },
  {
    name: Jobs.EmailStudentFirstSessionCongrats,
    processor: emailStudentFirstSessionCongrats
  }
]

export const addJobProcessors = (queue: Queue): void => {
  map(jobProcessors, jobProcessor =>
    queue.process(jobProcessor.name, job => {
      newrelic.startBackgroundTransaction(`job:${job.name}`, async () => {
        const transaction = newrelic.getTransaction()
        log(`Processing job: ${job.name}`)
        try {
          await jobProcessor.processor(job)
          log(`Completed job: ${job.name}`)
        } catch (error) {
          log(`Error processing job: ${job.name}`)
          log(error)
          Sentry.captureException(error)
        } finally {
          transaction.end()
        }
      })
    })
  )
}
