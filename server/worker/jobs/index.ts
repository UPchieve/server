import { ProcessPromiseFunction, Queue } from 'bull'
import EventEmitter from 'events'
import newrelic from 'newrelic'
import logger from '../../logger'
import backfillAvailabilityHistories from '../../scripts/backfill-availability-histories'
import backfillElapsedAvailability from '../../scripts/backfill-elapsed-availability'
import backfillEmailNiceToMeetYou from '../../scripts/backfill-email-nice-to-meet-you'
import backfillEmailVolunteerInactive from '../../scripts/backfill-email-volunteer-inactive'
import backfillStudentPosthog from '../../scripts/backfill-student-posthog'
import backfillStudentUsersRoles from '../../scripts/backfill-student-users-roles'
import deleteDuplicateUserSurveys from '../../scripts/delete-duplicate-user-surveys'
import deleteSelfFavoritedVolunteers from '../../scripts/delete-self-favorited-volunteers'
import deleteDuplicateStudentFavoriteVolunteers from '../../scripts/delete-duplicate-student-favorite-volunteers'
import deidentifyUser from './deidentify-user'
import upsertPostalCodes from '../../scripts/upsert-postal-codes'
import titlecaseSchoolNames from '../../scripts/titlecase-school-names'
import upsertSchools from '../../scripts/upsert-schools'
import emailNiceToMeetYou from './emailNiceToMeetYou'
import emailReadyToCoach from './emailReadyToCoach'
import emailReferenceFollowup from './emailReferenceFollowup'
import emailReferences from './emailReferences'
import emailWaitingOnReferences from './emailWaitingOnReferences'
import emailWeeklyHourSummary from './emailWeeklyHourSummary'
import endStaleSessions from './endStaleSessions'
import endUnmatchedSession from './endUnmatchedSession'
import generateAndStoreWaitTimeHeatMap from './generateAndStoreWaitTimeHeatMap'
import notifyTutors from './notifyTutors'
import emailPartnerVolunteerLowHoursSelected from './partner-volunteer-emails/emailLowHoursSelected'
import sendFollowupText from './sendFollowupText'
import emailSessionReported from './user-emails/emailSessionReported'
import emailStudentFirstSessionCongrats from './student-emails/emailStudentFirstSessionCongrats'
import emailStudentOnboardingSeries from './student-emails/emailStudentOnboardingSeries'
import emailStudentSessionActions from './student-emails/emailStudentSessionActions'
import updateElapsedAvailability from './updateElapsedAvailability'
import updateTotalVolunteerHours from './updateTotalVolunteerHours'
import emailFailedFirstAttemptedQuiz from './volunteer-emails/emailFailedFirstAttemptedQuiz'
import emailOnboardingReminder from './volunteer-emails/emailOnboardingReminder'
import emailQuickTips from './volunteer-emails/emailQuickTips'
import emailVolunteerTenSessionMilestone from './volunteer-emails/emailTenSessionMilestone'
import emailVolunteerFirstSessionCongrats from './volunteer-emails/emailVolunteerFirstSessionCongrats'
import emailVolunteerInactive from './volunteer-emails/emailVolunteerInactive'
import emailVolunteerInactiveBlackoutOver from './volunteer-emails/emailVolunteerInactiveBlackoutOver'
import emailVolunteerSessionActions from './volunteer-emails/emailVolunteerSessionActions'
import updateGradeLevel from './updateGradeLevel'
import sendSessionRecapMessageNotification from './sendSessionRecapMessageNotification'
import generateProgressReport from './generateProgressReport'
import updateBasicAccessViews from '../../scripts/update-basic-access-views'
import migrateProgressReportPromptIds from '../../scripts/migrate-progress-report-prompt-ids'
import spawnEmailWeeklyHourSummaryJobs from './spawnEmailWeeklyHourSummaryJobs'
import textVolunteers from './textVolunteers'
import moderateSessionMessage from '../../scripts/moderate-session-message'
import moderateSessionTranscript from '../jobs/moderate-session-transcript'
import migrateBannedAndTestUsersToBanType from '../../scripts/migrate-banned-and-test-users-to-bantype'
import updateSendGridGradeLevels from './updateSendGridGradeLevels'
import emailFallIncentiveEnrollmentWelcome from './student-emails/emailFallIncentiveEnrollmentWelcome'
import emailFallIncentiveInvitedToEnrollReminder from './student-emails/emailFallIncentiveInvitedToEnrollReminder'
import emailFallIncentiveSessionQualification from './student-emails/emailFallIncentiveSessionQualification'
import generateSessionSummary from './generateSessionSummary'
import processSessionEnded from './processSessionEnded'
import detectSessionLanguages from './detectSessionLanguages'
import backfillStudentAmbassadorRole from '../../scripts/add-student-ambassador-role-for-user'
import emailBecomeAnAmbassador from './emailBecomeAnAmbassador'
import emailReferralSignUpCelebration from './emailReferralSignupCelebration'
import maybeSendStudentFeedbackToVolunteer from './volunteer-emails/maybeSendStudentFeedbackToVolunteer'
import emailNationalTutorCertificate from './emailNationalTutorCertificate'
import addScheduledJobs from './addScheduledJobs'
import emailAmbassadorCongrats from './emailAmbassadorCongrats'
import { logRedisKeyMemStats } from './logRedisKeyMemStats'
import { clearBullJobByStatus } from './clearBullJobsByStatus'
import updateCachedVolunteersForTextNotifications from './updateCachedVolunteersForTextNotifications'
import backfillSessionEndedTasks from '../../scripts/backfill-sessionEndedTasks'

export enum Jobs {
  AddScheduledJobs = 'AddScheduledJobs',
  BackfillAvailabilityHistories = 'BackfillAvailabilityHistories',
  BackfillElapsedAvailability = 'BackfillElapsedAvailability',
  BackfillEmailNiceToMeetYou = 'BackfillEmailNiceToMeetYou',
  BackfillEmailVolunteersInactive = 'BackfillEmailVolunteersInactive',
  BackfillSessionEndedTasks = 'BackfillSessionEndedTasks',
  BackfillStudentAmbassadorRole = 'BackfillStudentAmbassadorRole',
  BackfillStudentPosthog = 'BackfillStudentPosthog',
  BackfillStudentUsersRoles = 'BackfillStudentUsersRoles',
  ClearBullJobsByStatus = 'ClearBullJobsByStatus',
  DeidentifyUser = 'DeidentifyUser',
  DeleteDuplicateFeedbacks = 'DeleteDuplicateFeedbacks',
  DeleteDuplicateStudentFavoriteVolunteers = 'DeleteDuplicateStudentFavoriteVolunteers',
  DeleteDuplicateUserSurveys = 'DeleteDuplicateUserSurveys',
  DeleteSelfFavoritedVolunteers = 'DeleteSelfFavoritedVolunteers',
  DetectSessionLanguages = 'DetectSessionLanguages',
  EmailFallIncentiveEnrollmentWelcome = 'EmailFallIncentiveEnrollmentWelcome',
  EmailFallIncentiveInvitedToEnrollReminder = 'EmailFallIncentiveInvitedToEnrollReminder',
  EmailFallIncentiveSessionQualification = 'EmailFallIncentiveSessionQualification',
  EmailFailedFirstAttemptedQuiz = 'EmailFailedFirstAttemptedQuiz',
  EmailIndependentLearning = 'EmailIndependentLearning',
  EmailMeetOurVolunteers = 'EmailMeetOurVolunteers',
  EmailNiceToMeetYou = 'EmailNiceToMeetYou',
  EmailOnboardingReminderOne = 'EmailOnboardingReminderOne',
  EmailOnboardingReminderThree = 'EmailOnboardingReminderThree',
  EmailOnboardingReminderTwo = 'EmailOnboardingReminderTwo',
  EmailPartnerVolunteerLowHoursSelected = 'EmailPartnerVolunteerLowHoursSelected',
  EmailReadyToCoach = 'EmailReadyToCoach',
  EmailReferenceFollowup = 'EmailReferenceFollowup',
  EmailReferences = 'EmailReferences',
  EmailSessionReported = 'EmailSessionReported',
  EmailStudentAbsentVolunteerApology = 'EmailStudentAbsentVolunteerApology',
  EmailStudentAbsentWarning = 'EmailStudentAbsentWarning',
  EmailStudentFirstSessionCongrats = 'EmailStudentFirstSessionCongrats',
  EmailStudentGoalSetting = 'EmailStudentGoalSetting',
  EmailStudentOnboardingHowItWorks = 'EmailStudentOnboardingHowItWorks',
  EmailStudentOnboardingMission = 'EmailStudentOnboardingMission',
  EmailStudentOnboardingSurvey = 'EmailStudentOnboardingSurvey',
  EmailStudentOnlyLookingForAnswers = 'EmailStudentOnlyLookingForAnswers',
  EmailStudentUnmatchedApology = 'EmailStudentUnmatchedApology',
  EmailStudentUseCases = 'EmailStudentUseCases',
  EmailVolunteerAbsentStudentApology = 'EmailVolunteerAbsentStudentApology',
  EmailVolunteerAbsentWarning = 'EmailVolunteerAbsentWarning',
  EmailVolunteerFirstSessionCongrats = 'EmailVolunteerFirstSessionCongrats',
  EmailVolunteerInactive = 'EmailVolunteerInactive',
  EmailVolunteerInactiveBlackoutOver = 'EmailVolunteerInactiveBlackoutOver',
  EmailVolunteerInactiveNinetyDays = 'EmailVolunteerInactiveNinetyDays',
  EmailVolunteerInactiveSixtyDays = 'EmailVolunteerInactiveSixtyDays',
  EmailVolunteerInactiveThirtyDays = 'EmailVolunteerInactiveThirtyDays',
  EmailVolunteerQuickTips = 'EmailVolunteerQuickTips',
  EmailVolunteerTenSessionMilestone = 'EmailVolunteerTenSessionMilestone',
  EmailWaitingOnReferences = 'EmailWaitingOnReferences',
  EmailWeeklyHourSummary = 'EmailWeeklyHourSummary',
  EndStaleSessions = 'EndStaleSessions',
  EndUnmatchedSession = 'EndUnmatchedSession',
  GenerateAndStoreWaitTimeHeatMap = 'GenerateAndStoreWaitTimeHeatMap',
  GenerateProgressReport = 'GenerateProgressReport',
  GenerateSessionSummary = 'GenerateSessionSummary',
  MaybeSendStudentFeedbackToVolunteer = 'MaybeSendStudentFeedbackToVolunteer',
  MigrateBannedAndTestUsersToBanType = 'MigrateBannedAndTestUsersToBanType',
  MigrateHistoricalPartnerData = 'MigrateHistoricalPartnerData',
  MigrateProgressReportPromptIds = 'MigrateProgressReportPromptIds',
  ModerateSessionMessage = 'ModerateSessionMessage',
  ModerateSessionTranscript = 'ModerateSessionTranscript',
  NotifyTutors = 'NotifyTutors',
  ProcessSessionEnded = 'ProcessSessionEnded',
  RedisKeyMemStats = 'RedisKeyMemStats',
  SendAmbassadorCongratsEmail = 'SendAmbassadorCongratsEmail',
  SendBecomeAnAmbassadorEmail = 'SendBecomeAnAmbassadorEmail',
  SendFollowupText = 'SendFollowupText',
  SendNationalTutorCertificateEmail = 'SendNationalTutorCertificateEmail',
  SendReferralSignUpCelebrationEmail = 'SendReferralSignUpCelebrationEmail',
  SendSessionRecapMessageNotification = 'SendSessionRecapMessageNotification',
  SpawnEmailWeeklyHourSummaryJobs = 'SpawnEmailWeeklyHourSummaryJobs',
  TextVolunteers = 'TextVolunteers',
  TitlecaseSchoolNames = 'TitlecaseSchoolNames',
  UpdateBasicAccessViews = 'UpdateBasicAccessViews',
  UpdateElapsedAvailability = 'UpdateElapsedAvailability',
  UpdateGradeLevel = 'UpdateGradeLevel',
  UpdateSendGridGradeLevels = 'UpdateSendGridGradeLevels',
  UpdateTotalVolunteerHours = 'UpdateTotalVolunteerHours',
  UpsertPostalCodes = 'UpsertPostalCodes',
  UpsertSchools = 'UpsertSchools',
  UpdateCachedVolunteersForTextNotifications = 'UpdateCachedVolunteersForTextNotifications',
}

// register new job processors here
interface JobProcessor {
  name: Jobs
  processor: ProcessPromiseFunction<any>
}

const jobProcessors: JobProcessor[] = [
  {
    name: Jobs.AddScheduledJobs,
    processor: addScheduledJobs,
  },
  {
    name: Jobs.BackfillAvailabilityHistories,
    processor: backfillAvailabilityHistories,
  },
  {
    name: Jobs.BackfillElapsedAvailability,
    processor: backfillElapsedAvailability,
  },
  {
    name: Jobs.BackfillEmailNiceToMeetYou,
    processor: backfillEmailNiceToMeetYou,
  },
  {
    name: Jobs.BackfillEmailVolunteersInactive,
    processor: backfillEmailVolunteerInactive,
  },
  {
    name: Jobs.BackfillSessionEndedTasks,
    processor: backfillSessionEndedTasks,
  },
  {
    name: Jobs.BackfillStudentAmbassadorRole,
    processor: backfillStudentAmbassadorRole,
  },
  {
    name: Jobs.BackfillStudentPosthog,
    processor: backfillStudentPosthog,
  },
  {
    name: Jobs.BackfillStudentUsersRoles,
    processor: backfillStudentUsersRoles,
  },
  {
    name: Jobs.ClearBullJobsByStatus,
    processor: clearBullJobByStatus,
  },
  {
    name: Jobs.DeidentifyUser,
    processor: deidentifyUser,
  },
  {
    name: Jobs.DeleteDuplicateStudentFavoriteVolunteers,
    processor: deleteDuplicateStudentFavoriteVolunteers,
  },
  {
    name: Jobs.DeleteDuplicateUserSurveys,
    processor: deleteDuplicateUserSurveys,
  },
  {
    name: Jobs.DeleteSelfFavoritedVolunteers,
    processor: deleteSelfFavoritedVolunteers,
  },
  {
    name: Jobs.DetectSessionLanguages,
    processor: detectSessionLanguages,
  },
  {
    name: Jobs.EmailFailedFirstAttemptedQuiz,
    processor: emailFailedFirstAttemptedQuiz,
  },
  {
    name: Jobs.EmailFallIncentiveEnrollmentWelcome,
    processor: emailFallIncentiveEnrollmentWelcome,
  },
  {
    name: Jobs.EmailFallIncentiveInvitedToEnrollReminder,
    processor: emailFallIncentiveInvitedToEnrollReminder,
  },
  {
    name: Jobs.EmailFallIncentiveSessionQualification,
    processor: emailFallIncentiveSessionQualification,
  },
  {
    name: Jobs.EmailIndependentLearning,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailMeetOurVolunteers,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailNiceToMeetYou,
    processor: emailNiceToMeetYou,
  },
  {
    name: Jobs.EmailOnboardingReminderOne,
    processor: emailOnboardingReminder,
  },
  {
    name: Jobs.EmailOnboardingReminderThree,
    processor: emailOnboardingReminder,
  },
  {
    name: Jobs.EmailOnboardingReminderTwo,
    processor: emailOnboardingReminder,
  },
  {
    name: Jobs.EmailPartnerVolunteerLowHoursSelected,
    processor: emailPartnerVolunteerLowHoursSelected,
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
    name: Jobs.EmailReferences,
    processor: emailReferences,
  },
  {
    name: Jobs.EmailSessionReported,
    processor: emailSessionReported,
  },
  {
    name: Jobs.EmailStudentAbsentVolunteerApology,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentAbsentWarning,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentFirstSessionCongrats,
    processor: emailStudentFirstSessionCongrats,
  },
  {
    name: Jobs.EmailStudentGoalSetting,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailStudentOnboardingHowItWorks,
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
    name: Jobs.EmailStudentOnlyLookingForAnswers,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentUnmatchedApology,
    processor: emailStudentSessionActions,
  },
  {
    name: Jobs.EmailStudentUseCases,
    processor: emailStudentOnboardingSeries,
  },
  {
    name: Jobs.EmailVolunteerAbsentStudentApology,
    processor: emailVolunteerSessionActions,
  },
  {
    name: Jobs.EmailVolunteerAbsentWarning,
    processor: emailVolunteerSessionActions,
  },
  {
    name: Jobs.EmailVolunteerFirstSessionCongrats,
    processor: emailVolunteerFirstSessionCongrats,
  },
  {
    name: Jobs.EmailVolunteerInactive,
    processor: emailVolunteerInactive,
  },
  {
    name: Jobs.EmailVolunteerInactiveBlackoutOver,
    processor: emailVolunteerInactiveBlackoutOver,
  },
  {
    name: Jobs.EmailVolunteerQuickTips,
    processor: emailQuickTips,
  },
  {
    name: Jobs.EmailVolunteerTenSessionMilestone,
    processor: emailVolunteerTenSessionMilestone,
  },
  {
    name: Jobs.EmailWaitingOnReferences,
    processor: emailWaitingOnReferences,
  },
  {
    name: Jobs.EmailWeeklyHourSummary,
    processor: emailWeeklyHourSummary,
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
    name: Jobs.GenerateProgressReport,
    processor: generateProgressReport,
  },
  {
    name: Jobs.GenerateSessionSummary,
    processor: generateSessionSummary,
  },
  {
    name: Jobs.MaybeSendStudentFeedbackToVolunteer,
    processor: maybeSendStudentFeedbackToVolunteer,
  },
  {
    name: Jobs.MigrateBannedAndTestUsersToBanType,
    processor: migrateBannedAndTestUsersToBanType,
  },
  {
    name: Jobs.MigrateProgressReportPromptIds,
    processor: migrateProgressReportPromptIds,
  },
  {
    name: Jobs.ModerateSessionMessage,
    processor: moderateSessionMessage,
  },
  {
    name: Jobs.ModerateSessionTranscript,
    processor: moderateSessionTranscript,
  },
  {
    name: Jobs.NotifyTutors,
    processor: notifyTutors,
  },
  {
    name: Jobs.ProcessSessionEnded,
    processor: processSessionEnded,
  },
  { name: Jobs.RedisKeyMemStats, processor: logRedisKeyMemStats },
  {
    name: Jobs.SendAmbassadorCongratsEmail,
    processor: emailAmbassadorCongrats,
  },
  {
    name: Jobs.SendBecomeAnAmbassadorEmail,
    processor: emailBecomeAnAmbassador,
  },
  {
    name: Jobs.SendFollowupText,
    processor: sendFollowupText,
  },
  {
    name: Jobs.SendNationalTutorCertificateEmail,
    processor: emailNationalTutorCertificate,
  },
  {
    name: Jobs.SendReferralSignUpCelebrationEmail,
    processor: emailReferralSignUpCelebration,
  },
  {
    name: Jobs.SendSessionRecapMessageNotification,
    processor: sendSessionRecapMessageNotification,
  },
  {
    name: Jobs.SpawnEmailWeeklyHourSummaryJobs,
    processor: spawnEmailWeeklyHourSummaryJobs,
  },
  {
    name: Jobs.TextVolunteers,
    processor: textVolunteers,
  },
  {
    name: Jobs.TitlecaseSchoolNames,
    processor: titlecaseSchoolNames,
  },
  {
    name: Jobs.UpdateBasicAccessViews,
    processor: updateBasicAccessViews,
  },
  {
    name: Jobs.UpdateElapsedAvailability,
    processor: updateElapsedAvailability,
  },
  {
    name: Jobs.UpdateGradeLevel,
    processor: updateGradeLevel,
  },
  {
    name: Jobs.UpdateSendGridGradeLevels,
    processor: updateSendGridGradeLevels,
  },
  {
    name: Jobs.UpdateTotalVolunteerHours,
    processor: updateTotalVolunteerHours,
  },
  {
    name: Jobs.UpsertPostalCodes,
    processor: upsertPostalCodes,
  },
  {
    name: Jobs.UpsertSchools,
    processor: upsertSchools,
  },
  {
    name: Jobs.UpdateCachedVolunteersForTextNotifications,
    processor: updateCachedVolunteersForTextNotifications,
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
    for (const jobProcessor of jobProcessors) {
      queue.process(jobProcessor.name, async (job) => {
        await newrelic.startBackgroundTransaction(
          `job:${job.name}`,
          async () => {
            const transaction = newrelic.getTransaction()
            logger.info(`Processing job: ${job.name}`)
            try {
              await jobProcessor.processor(job)
              logger.info(`Completed job: ${job.name}`)
            } catch (error) {
              logger.error(error, `Error processing job: ${job.name}`)
              throw error
            } finally {
              transaction.end()
            }
          }
        )
      })
    }
  } catch (error) {
    logger.error(error, `Error adding job processors`)
  }
}
