import { ProcessPromiseFunction, Queue } from 'bull'
import { map } from 'lodash'
import newrelic from 'newrelic'
import logger from '../../logger'
import EventEmitter from 'events'
import notifyTutors from './notifyTutors'
import updateElapsedAvailability from './updateElapsedAvailability'
import updateTotalVolunteerHours from './updateTotalVolunteerHours'
import endStaleSessions from './endStaleSessions'
import endUnmatchedSession from './endUnmatchedSession'
import generateAndStoreWaitTimeHeatMap from './generateAndStoreWaitTimeHeatMap'
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
import emailStudentOnboardingSeries from './student-emails/emailStudentOnboardingSeries'
import emailStudentSessionActions from './student-emails/emailStudentSessionActions'
import emailPartnerVolunteerReferACoworker from './partner-volunteer-emails/emailReferACoworker'
import emailPartnerVolunteerTenSessionMilestone from './partner-volunteer-emails/emailTenSessionMilestone'
import emailVolunteerGentleWarning from './volunteer-emails/emailGentleWarning'
import emailVolunteerInactive from './volunteer-emails/emailVolunteerInactive'
import emailVolunteerFirstSessionCongrats from './volunteer-emails/emailVolunteerFirstSessionCongrats'
import emailStudentFirstSessionCongrats from './student-emails/emailStudentFirstSessionCongrats'
import emailFailedFirstAttemptedQuiz from './volunteer-emails/emailFailedFirstAttemptedQuiz'
import emailVolunteerInactiveBlackoutOver from './volunteer-emails/emailVolunteerInactiveBlackoutOver'
import emailVolunteerSessionActions from './volunteer-emails/emailVolunteerSessionActions'
import emailSessionReported from './student-emails/emailSessionReported'
import sendAssistmentsData from './sendAssistmentsData'
import chatbot from './chatbot'
import sendFollowupText from './sendFollowupText'

export enum Jobs {
  NotifyTutors = 'NotifyTutors',
  UpdateElapsedAvailability = 'UpdateElapsedAvailability',
  UpdateTotalVolunteerHours = 'UpdateTotalVolunteerHours',
  EndStaleSessions = 'EndStaleSessions',
  EndUnmatchedSession = 'EndUnmatchedSession',
  GenerateAndStoreWaitTimeHeatMap = 'GenerateAndStoreWaitTimeHeatMap',
  EmailReferences = 'EmailReferences',
  EmailReadyToCoach = 'EmailReadyToCoach',
  EmailReferenceFollowup = 'EmailReferenceFollowup',
  EmailWaitingOnReferences = 'EmailWaitingOnReferences',
  EmailNiceToMeetYou = 'EmailNiceToMeetYou',
  EmailWeeklyHourSummary = 'EmailWeeklyHourSummary',
  EmailOnboardingReminderOne = 'EmailOnboardingReminderOne',
  EmailOnboardingReminderTwo = 'EmailOnboardingReminderTwo',
  EmailOnboardingReminderThree = 'EmailOnboardingReminderThree',
  EmailStudentOnboardingHowItWorks = 'EmailStudentOnboardingHowItWorks',
  EmailStudentOnboardingMission = 'EmailStudentOnboardingMission',
  EmailMeetOurVolunteers = 'EmailMeetOurVolunteers',
  EmailStudentOnboardingSurvey = 'EmailStudentOnboardingSurvey',
  EmailStudentAbsentWarning = 'EmailStudentAbsentWarning',
  EmailStudentAbsentVolunteerApology = 'EmailStudentAbsentVolunteerApology',
  EmailStudentUnmatchedApology = 'EmailStudentUnmatchedApology',
  EmailSessionReported = 'EmailSessionReported',
  EmailVolunteerQuickTips = 'EmailVolunteerQuickTips',
  EmailPartnerVolunteerOnlyCollegeCerts = 'EmailVolunteerCollegeCertsOnly',
  EmailPartnerVolunteerLowHoursSelected = 'EmailPartnerVolunteerLowHoursSelected',
  EmailPartnerVolunteerReferACoworker = 'EmailPartnerVolunteerReferACoworker',
  EmailPartnerVolunteerTenSessionMilestone = 'EmailPartnerVolunteerTenSessionMilestone',
  EmailVolunteerInactiveBlackoutOver = 'EmailVolunteerInactiveBlackoutOver',
  EmailVolunteerGentleWarning = 'EmailVolunteerGentleWarning',
  EmailVolunteerInactiveThirtyDays = 'EmailVolunteerInactiveThirtyDays',
  EmailVolunteerInactiveSixtyDays = 'EmailVolunteerInactiveSixtyDays',
  EmailVolunteerInactiveNinetyDays = 'EmailVolunteerInactiveNinetyDays',
  EmailVolunteerInactive = 'EmailVolunteerInactive',
  EmailVolunteerFirstSessionCongrats = 'EmailVolunteerFirstSessionCongrats',
  EmailVolunteerAbsentWarning = 'EmailVolunteerAbsentWarning',
  EmailVolunteerAbsentStudentApology = 'EmailVolunteerAbsentStudentApology',
  EmailStudentFirstSessionCongrats = 'EmailStudentFirstSessionCongrats',
  EmailFailedFirstAttemptedQuiz = 'EmailFailedFirstAttemptedQuiz',
  SendAssistmentsData = 'SendAssistmentsData',
  EmailStudentOnlyLookingForAnswers = 'EmailStudentOnlyLookingForAnswers',
  SendFollowupText = 'SendFollowupText',
  // TODO: add the tech issue apology job to the job processor once it is ready to be released
  EmailTechIssueApology = 'EmailTechIssueApology',
  Chatbot = 'Chatbot',

  // TODO: remove the following deprecated job names
  EmailStudentUseCases = 'EmailStudentUseCases',
  EmailIndependentLearning = 'EmailIndependentLearning',
  EmailStudentGoalSetting = 'EmailStudentGoalSetting',
}

// register new job processors here
interface JobProcessor {
  name: Jobs
  processor: ProcessPromiseFunction<any>
}

const jobProcessors: JobProcessor[] = [
  {
    name: Jobs.NotifyTutors,
    processor: notifyTutors,
  },
  {
    name: Jobs.UpdateElapsedAvailability,
    processor: updateElapsedAvailability,
  },
  {
    name: Jobs.UpdateTotalVolunteerHours,
    processor: updateTotalVolunteerHours,
  },
  {
    name: Jobs.EndStaleSessions,
    processor: endStaleSessions,
  },
  {
    name: Jobs.EndUnmatchedSession,
    processor: endUnmatchedSession,
  },
  {
    name: Jobs.GenerateAndStoreWaitTimeHeatMap,
    processor: generateAndStoreWaitTimeHeatMap,
  },
  {
    name: Jobs.EmailReferences,
    processor: emailReferences,
  },
  {
    name: Jobs.EmailReadyToCoach,
    processor: emailReadyToCoach,
  },
  {
    name: Jobs.EmailReferenceFollowup,
    processor: emailReferenceFollowup,
  },
  {
    name: Jobs.EmailWaitingOnReferences,
    processor: emailWaitingOnReferences,
  },
  {
    name: Jobs.EmailNiceToMeetYou,
    processor: emailNiceToMeetYou,
  },
  {
    name: Jobs.EmailWeeklyHourSummary,
    processor: emailWeeklyHourSummary,
  },
  {
    name: Jobs.EmailOnboardingReminderOne,
    processor: emailOnboardingReminder,
  },
  {
    name: Jobs.EmailOnboardingReminderTwo,
    processor: emailOnboardingReminder,
  },
  {
    name: Jobs.EmailOnboardingReminderThree,
    processor: emailOnboardingReminder,
  },
  {
    name: Jobs.EmailStudentOnboardingHowItWorks,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailMeetOurVolunteers,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailStudentOnboardingMission,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailStudentOnboardingSurvey,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailStudentAbsentWarning,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentAbsentVolunteerApology,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentUnmatchedApology,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentOnlyLookingForAnswers,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailVolunteerQuickTips,
    processor: emailQuickTips,
  },
  {
    name: Jobs.EmailPartnerVolunteerOnlyCollegeCerts,
    processor: emailPartnerVolunteerOnlyCollegeCerts,
  },
  {
    name: Jobs.EmailPartnerVolunteerLowHoursSelected,
    processor: emailPartnerVolunteerLowHoursSelected,
  },
  {
    name: Jobs.EmailPartnerVolunteerReferACoworker,
    processor: emailPartnerVolunteerReferACoworker,
  },
  {
    name: Jobs.EmailPartnerVolunteerTenSessionMilestone,
    processor: emailPartnerVolunteerTenSessionMilestone,
  },
  {
    name: Jobs.EmailVolunteerGentleWarning,
    processor: emailVolunteerGentleWarning,
  },
  {
    name: Jobs.EmailVolunteerInactive,
    processor: emailVolunteerInactive,
  },
  {
    name: Jobs.EmailVolunteerFirstSessionCongrats,
    processor: emailVolunteerFirstSessionCongrats,
  },
  {
    name: Jobs.EmailVolunteerInactiveBlackoutOver,
    processor: emailVolunteerInactiveBlackoutOver,
  },
  {
    name: Jobs.EmailStudentFirstSessionCongrats,
    processor: emailStudentFirstSessionCongrats,
  },
  {
    name: Jobs.EmailVolunteerAbsentWarning,
    processor: emailVolunteerSessionActions,
  },
  {
    name: Jobs.EmailVolunteerAbsentStudentApology,
    processor: emailVolunteerSessionActions,
  },
  {
    name: Jobs.EmailFailedFirstAttemptedQuiz,
    processor: emailFailedFirstAttemptedQuiz,
  },
  {
    name: Jobs.EmailSessionReported,
    processor: emailSessionReported,
  },
  {
    name: Jobs.SendAssistmentsData,
    processor: sendAssistmentsData,
  },
  {
    name: Jobs.Chatbot,
    processor: chatbot,
  },
  {
    name: Jobs.SendFollowupText,
    processor: sendFollowupText,
  },

  // TODO: remove the following deprecated job names
  {
    name: Jobs.EmailStudentUseCases,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailIndependentLearning,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailStudentGoalSetting,
    processor: emailStudentOnboardingSeries,
  },
]

// Each Bull processor needs at least one listener per thread - https://github.com/OptimalBits/bull/issues/615
// TODO: determine concurrency at runtime
EventEmitter.defaultMaxListeners = jobProcessors.length * 8

/**
 * Job processors should throw an error when they fail perform an expected action.
 * The thrown error should include a message about which documents (if any) were
 * affected so failed actions can be backfilled.
 *
 * They can additionally log internal state but all thrown errors will be logged
 * in a consistent format with a Sentry capture so we can create effective
 * monitoring alerts on jobs.
 */

export const addJobProcessors = (queue: Queue): void => {
  try {
    map(jobProcessors, jobProcessor =>
      queue.process(jobProcessor.name, job => {
        newrelic
          .startBackgroundTransaction(`job:${job.name}`, async () => {
            const transaction = newrelic.getTransaction()
            logger.info(`Processing job: ${job.name}`)
            try {
              await jobProcessor.processor(job)
              logger.info(`Completed job: ${job.name}`)
            } catch (error) {
              logger.error(`Error processing job: ${job.name}\n${error}`)
              newrelic.noticeError(error as Error)
            } finally {
              transaction.end()
            }
          })
          .catch(error => {
            logger.error(
              `error in job processor newrelic transaction: ${error}`
            )
            newrelic.noticeError(error)
          })
      })
    )
  } catch (error) {
    logger.error(`error adding job processors: ${error}`)
    newrelic.noticeError(error as Error)
  }
}
