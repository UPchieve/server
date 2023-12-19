import { ProcessPromiseFunction, Queue } from 'bull'
import EventEmitter from 'events'
import { map } from 'lodash'
import newrelic from 'newrelic'
import logger from '../../logger'
import backfillEmailNiceToMeetYou from '../../scripts/backfill-email-nice-to-meet-you'
import backfillEmailVolunteerInactive from '../../scripts/backfill-email-volunteer-inactive'
import backfillStudentPosthog from '../../scripts/backfill-student-posthog'
import backfillUpdateElapsedAvailability from '../../scripts/backfill-update-elapsed-availability'
import deleteDuplicatePushTokens from '../../scripts/delete-duplicate-push-tokens'
import deleteDuplicateUserSurveys from '../../scripts/delete-duplicate-user-surveys'
import deleteSelfFavoritedVolunteers from '../../scripts/delete-self-favorited-volunteers'
import deleteDuplicateStudentFavoriteVolunteers from '../../scripts/delete-duplicate-student-favorite-volunteers'
import sendWeeklyHourSummaryApology from '../../scripts/send-weekly-hour-summary-apology'
import upsertPostalCodes from '../../scripts/upsert-postal-codes'
import titlecaseSchoolNames from '../../scripts/titlecase-school-names'
import upsertSchools from '../../scripts/upsert-schools'
import chatbot from './chatbot'
import emailNiceToMeetYou from './emailNiceToMeetYou'
import emailReadyToCoach from './emailReadyToCoach'
import emailReferenceFollowup from './emailReferenceFollowup'
import emailReferences from './emailReferences'
import emailReferencesFormApology from './emailReferencesFormApology'
import emailWaitingOnReferences from './emailWaitingOnReferences'
import emailWeeklyHourSummary from './emailWeeklyHourSummary'
import endStaleSessions from './endStaleSessions'
import endUnmatchedSession from './endUnmatchedSession'
import generateAndStoreWaitTimeHeatMap from './generateAndStoreWaitTimeHeatMap'
import notifyTutors from './notifyTutors'
import emailPartnerVolunteerLowHoursSelected from './partner-volunteer-emails/emailLowHoursSelected'
import sendAssistmentsData from './sendAssistmentsData'
import sendFollowupText from './sendFollowupText'
import emailSessionReported from './user-emails/emailSessionReported'
import emailStudentFirstSessionCongrats from './student-emails/emailStudentFirstSessionCongrats'
import emailStudentOnboardingSeries from './student-emails/emailStudentOnboardingSeries'
import emailStudentSessionActions from './student-emails/emailStudentSessionActions'
import updateElapsedAvailability from './updateElapsedAvailability'
import updateTotalVolunteerHours from './updateTotalVolunteerHours'
import emailFailedFirstAttemptedQuiz from './volunteer-emails/emailFailedFirstAttemptedQuiz'
import emailVolunteerGentleWarning from './volunteer-emails/emailGentleWarning'
import emailOnboardingReminder from './volunteer-emails/emailOnboardingReminder'
import emailQuickTips from './volunteer-emails/emailQuickTips'
import emailVolunteerTenSessionMilestone from './volunteer-emails/emailTenSessionMilestone'
import emailVolunteerFirstSessionCongrats from './volunteer-emails/emailVolunteerFirstSessionCongrats'
import emailVolunteerInactive from './volunteer-emails/emailVolunteerInactive'
import emailVolunteerInactiveBlackoutOver from './volunteer-emails/emailVolunteerInactiveBlackoutOver'
import emailVolunteerSessionActions from './volunteer-emails/emailVolunteerSessionActions'
import updateGradeLevel from './updateGradeLevel'
import studentProcrastinationTextReminder from './studentProcrastinationTextReminder'
import sendSessionRecapMessageNotification from './sendSessionRecapMessageNotification'
import generateProgressReport from './generateProgressReport'
import updateBasicAccessViews from '../../scripts/update-basic-access-views'

export enum Jobs {
  NotifyTutors = 'NotifyTutors',
  UpdateElapsedAvailability = 'UpdateElapsedAvailability',
  UpdateTotalVolunteerHours = 'UpdateTotalVolunteerHours',
  EndStaleSessions = 'EndStaleSessions',
  EndUnmatchedSession = 'EndUnmatchedSession',
  GenerateAndStoreWaitTimeHeatMap = 'GenerateAndStoreWaitTimeHeatMap',
  EmailReferences = 'EmailReferences',
  EmailReferencesFormApology = 'EmailReferencesFormApology',
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
  EmailPartnerVolunteerLowHoursSelected = 'EmailPartnerVolunteerLowHoursSelected',
  EmailVolunteerTenSessionMilestone = 'EmailVolunteerTenSessionMilestone',
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
  Chatbot = 'Chatbot',
  UpdateGradeLevel = 'UpdateGradeLevel',
  StudentProcrastinationTextReminder = 'StudentProcrastinationTextReminder',
  SendSessionRecapMessageNotification = 'SendSessionRecapMessageNotification',
  GenerateProgressReport = 'GenerateProgressReport',

  // TODO: remove the following deprecated job names
  EmailStudentUseCases = 'EmailStudentUseCases',
  EmailIndependentLearning = 'EmailIndependentLearning',
  EmailStudentGoalSetting = 'EmailStudentGoalSetting',

  // Backfill scripts
  BackfillEmailNiceToMeetYou = 'BackfillEmailNiceToMeetYou',
  BackfillEmailVolunteersInactive = 'BackfillEmailVolunteersInactive',
  BackfillStudentPosthog = 'BackfillStudentPosthog',
  SendWeeklyHourSummaryApology = 'SendWeeklyHourSummaryApology',
  BackfillUpdateElapsedAvailability = 'BackfillUpdateElapsedAvailability',

  // Delete scripts
  DeleteDuplicatePushTokens = 'DeleteDuplicatePushTokens',
  DeleteDuplicateFeedbacks = 'DeleteDuplicateFeedbacks',
  DeleteSelfFavoritedVolunteers = 'DeleteSelfFavoritedVolunteers',
  DeleteDuplicateUserSurveys = 'DeleteDuplicateUserSurveys',
  DeleteDuplicateStudentFavoriteVolunteers = 'DeleteDuplicateStudentFavoriteVolunteers',

  // Migration scripts
  MigrateHistoricalPartnerData = 'MigrateHistoricalPartnerData',
  UpsertPostalCodes = 'UpsertPostalCodes',
  TitlecaseSchoolNames = 'TitlecaseSchoolNames',
  UpsertSchools = 'UpsertSchools',

  // Eng Tooling Scripts
  UpdateBasicAccessViews = 'UpdateBasicAccessViews',
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
    name: Jobs.EmailReferencesFormApology,
    processor: emailReferencesFormApology,
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
    name: Jobs.EmailPartnerVolunteerLowHoursSelected,
    processor: emailPartnerVolunteerLowHoursSelected,
  },
  {
    name: Jobs.EmailVolunteerTenSessionMilestone,
    processor: emailVolunteerTenSessionMilestone,
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
  {
    name: Jobs.UpdateGradeLevel,
    processor: updateGradeLevel,
  },
  {
    name: Jobs.StudentProcrastinationTextReminder,
    processor: studentProcrastinationTextReminder,
  },
  {
    name: Jobs.SendSessionRecapMessageNotification,
    processor: sendSessionRecapMessageNotification,
  },
  {
    name: Jobs.GenerateProgressReport,
    processor: generateProgressReport,
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

  // Backfill scripts
  {
    name: Jobs.BackfillEmailNiceToMeetYou,
    processor: backfillEmailNiceToMeetYou,
  },
  {
    name: Jobs.BackfillEmailVolunteersInactive,
    processor: backfillEmailVolunteerInactive,
  },
  {
    name: Jobs.BackfillStudentPosthog,
    processor: backfillStudentPosthog,
  },
  {
    name: Jobs.SendWeeklyHourSummaryApology,
    processor: sendWeeklyHourSummaryApology,
  },
  {
    name: Jobs.DeleteDuplicatePushTokens,
    processor: deleteDuplicatePushTokens,
  },
  {
    name: Jobs.DeleteDuplicateUserSurveys,
    processor: deleteDuplicateUserSurveys,
  },
  {
    name: Jobs.BackfillUpdateElapsedAvailability,
    processor: backfillUpdateElapsedAvailability,
  },
  {
    name: Jobs.DeleteSelfFavoritedVolunteers,
    processor: deleteSelfFavoritedVolunteers,
  },
  // TODO: uncomment this processor when ready to migrate
  //{
  //  name: Jobs.MigrateHistoricalPartnerData,
  //  processor: migrateHistoricalPartnerData
  //},
  {
    name: Jobs.UpsertPostalCodes,
    processor: upsertPostalCodes,
  },
  {
    name: Jobs.TitlecaseSchoolNames,
    processor: titlecaseSchoolNames,
  },
  {
    name: Jobs.UpsertSchools,
    processor: upsertSchools,
  },
  {
    name: Jobs.DeleteDuplicateStudentFavoriteVolunteers,
    processor: deleteDuplicateStudentFavoriteVolunteers,
  },
  {
    name: Jobs.UpdateBasicAccessViews,
    processor: updateBasicAccessViews,
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
