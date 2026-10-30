import { Job, ProcessPromiseFunction, Queue } from 'bull'
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
import emailPartnerVolunteerLowHoursSelected from './partner-volunteer-emails/emailLowHoursSelected'
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
import sendSessionRecapMessageNotification from './sendSessionRecapMessageNotification'
import generateProgressReport from './generateProgressReport'
import updateBasicAccessViews from '../../scripts/update-basic-access-views'
import migrateProgressReportPromptIds from '../../scripts/migrate-progress-report-prompt-ids'
import spawnEmailWeeklyHourSummaryJobs from './spawnEmailWeeklyHourSummaryJobs'
import textVolunteers from './textVolunteers'
import moderateSessionTranscript from '../jobs/moderate-session-transcript'
import migrateBannedAndTestUsersToBanType from '../../scripts/migrate-banned-and-test-users-to-bantype'
import updateSendGridGradeLevels from './updateSendGridGradeLevels'
import syncSendGridContact from './syncSendGridContact'
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
import spawnDeidentifyUsers from './spawn-deidentify-users'
import updateNthsChapterStatusForImpactPath from './updateNTHSChapterStatusForImpactPath'
import spawnUpdateNthsChapterStatusForImpactPath from './spawnUpdateNTHSChapterStatusForImpactPath'
import executeModerationAction from './executeModerationAction'
import deleteProxyEmailsIdenticalToEmails from './deleteProxyEmailsIdenticalToEmails'
import notifyVolunteersAboutEssayReviewSubmission from './volunteer-emails/notifyVolunteerAboutEssayReviewSubmission'
import candidateEngagementCampaign from './nths/candidateEngagementCampaign'
import applicationStatusNotification from './nths/applicationStatusNotification'
import chapterRenewal from './nths/chapterRenewal'
import spawnChapterRenewal from './nths/spawnChapterRenewal'

type JobProcessor = ProcessPromiseFunction<any>
export type JobName = keyof typeof jobProcessors
export type JobData<N extends JobName> =
  Parameters<(typeof jobProcessors)[N]> extends []
    ? undefined
    : NonNullable<Parameters<(typeof jobProcessors)[N]>[0]> extends Job<infer D>
      ? D
      : never

export const jobProcessors = {
  AddScheduledJobs: addScheduledJobs,
  BackfillAvailabilityHistories: backfillAvailabilityHistories,
  BackfillElapsedAvailability: backfillElapsedAvailability,
  BackfillEmailNiceToMeetYou: backfillEmailNiceToMeetYou,
  BackfillEmailVolunteersInactive: backfillEmailVolunteerInactive,
  BackfillSessionEndedTasks: backfillSessionEndedTasks,
  BackfillStudentAmbassadorRole: backfillStudentAmbassadorRole,
  BackfillStudentPosthog: backfillStudentPosthog,
  BackfillStudentUsersRoles: backfillStudentUsersRoles,
  ClearBullJobsByStatus: clearBullJobByStatus,
  DeidentifyUser: deidentifyUser,
  DeleteDuplicateStudentFavoriteVolunteers:
    deleteDuplicateStudentFavoriteVolunteers,
  DeleteDuplicateUserSurveys: deleteDuplicateUserSurveys,
  DeleteSelfFavoritedVolunteers: deleteSelfFavoritedVolunteers,
  DetectSessionLanguages: detectSessionLanguages,
  EmailFailedFirstAttemptedQuiz: emailFailedFirstAttemptedQuiz,
  EmailFallIncentiveEnrollmentWelcome: emailFallIncentiveEnrollmentWelcome,
  EmailFallIncentiveInvitedToEnrollReminder:
    emailFallIncentiveInvitedToEnrollReminder,
  EmailFallIncentiveSessionQualification:
    emailFallIncentiveSessionQualification,
  EmailIndependentLearning: emailStudentOnboardingSeries,
  EmailMeetOurVolunteers: emailStudentOnboardingSeries,
  EmailNiceToMeetYou: emailNiceToMeetYou,
  EmailOnboardingReminderOne: emailOnboardingReminder,
  EmailOnboardingReminderThree: emailOnboardingReminder,
  EmailOnboardingReminderTwo: emailOnboardingReminder,
  EmailPartnerVolunteerLowHoursSelected: emailPartnerVolunteerLowHoursSelected,
  EmailReadyToCoach: emailReadyToCoach,
  EmailReferenceFollowup: emailReferenceFollowup,
  EmailReferences: emailReferences,
  EmailSessionReported: emailSessionReported,
  EmailStudentAbsentVolunteerApology: emailStudentSessionActions,
  EmailStudentAbsentWarning: emailStudentSessionActions,
  EmailStudentFirstSessionCongrats: emailStudentFirstSessionCongrats,
  EmailStudentGoalSetting: emailStudentOnboardingSeries,
  EmailStudentOnboardingHowItWorks: emailStudentOnboardingSeries,
  EmailStudentOnboardingMission: emailStudentOnboardingSeries,
  EmailStudentOnboardingSurvey: emailStudentOnboardingSeries,
  EmailStudentOnlyLookingForAnswers: emailStudentSessionActions,
  EmailStudentUnmatchedApology: emailStudentSessionActions,
  EmailStudentUseCases: emailStudentOnboardingSeries,
  EmailVolunteerAbsentStudentApology: emailVolunteerSessionActions,
  EmailVolunteerAbsentWarning: emailVolunteerSessionActions,
  EmailVolunteerFirstSessionCongrats: emailVolunteerFirstSessionCongrats,
  EmailVolunteerInactive: emailVolunteerInactive,
  EmailVolunteerInactiveBlackoutOver: emailVolunteerInactiveBlackoutOver,
  EmailVolunteerQuickTips: emailQuickTips,
  EmailVolunteerTenSessionMilestone: emailVolunteerTenSessionMilestone,
  EmailWaitingOnReferences: emailWaitingOnReferences,
  EmailWeeklyHourSummary: emailWeeklyHourSummary,
  EndStaleSessions: endStaleSessions,
  EndUnmatchedSession: endUnmatchedSession,
  ExecuteModerationAction: executeModerationAction,
  GenerateAndStoreWaitTimeHeatMap: generateAndStoreWaitTimeHeatMap,
  GenerateProgressReport: generateProgressReport,
  GenerateSessionSummary: generateSessionSummary,
  MaybeSendStudentFeedbackToVolunteer: maybeSendStudentFeedbackToVolunteer,
  MigrateBannedAndTestUsersToBanType: migrateBannedAndTestUsersToBanType,
  MigrateProgressReportPromptIds: migrateProgressReportPromptIds,
  ModerateSessionTranscript: moderateSessionTranscript,
  ProcessSessionEnded: processSessionEnded,
  NTHSApplicationStatus: applicationStatusNotification,
  NotifyVolunteersAboutEssayReviewSubmission:
    notifyVolunteersAboutEssayReviewSubmission,
  NTHSCandidateEngagement: candidateEngagementCampaign,
  NTHSChapterRenewal: chapterRenewal,
  SpawnNTHSChapterRenewal: spawnChapterRenewal,
  RedisKeyMemStats: logRedisKeyMemStats,
  SendAmbassadorCongratsEmail: emailAmbassadorCongrats,
  SendBecomeAnAmbassadorEmail: emailBecomeAnAmbassador,
  SendNationalTutorCertificateEmail: emailNationalTutorCertificate,
  SendReferralSignUpCelebrationEmail: emailReferralSignUpCelebration,
  SendSessionRecapMessageNotification: sendSessionRecapMessageNotification,
  SpawnDeidentifyUsers: spawnDeidentifyUsers,
  SpawnEmailWeeklyHourSummaryJobs: spawnEmailWeeklyHourSummaryJobs,
  TextVolunteers: textVolunteers,
  TitlecaseSchoolNames: titlecaseSchoolNames,
  UpdateBasicAccessViews: updateBasicAccessViews,
  UpdateElapsedAvailability: updateElapsedAvailability,
  UpdateSendGridGradeLevels: updateSendGridGradeLevels,
  SyncSendGridContact: syncSendGridContact,
  UpdateTotalVolunteerHours: updateTotalVolunteerHours,
  UpsertPostalCodes: upsertPostalCodes,
  UpsertSchools: upsertSchools,
  UpdateCachedVolunteersForTextNotifications:
    updateCachedVolunteersForTextNotifications,
  UpdateNTHSChapterStatusForImpactPath: updateNthsChapterStatusForImpactPath,
  SpawnUpdateNTHSChapterStatusForImpactPath:
    spawnUpdateNthsChapterStatusForImpactPath,
  CleanUpProxyEmailsThatAreIdenticalToEmail: deleteProxyEmailsIdenticalToEmails,
} satisfies Record<string, JobProcessor>

// Each Bull processor needs at least one listener per thread - https://github.com/OptimalBits/bull/issues/615
// TODO: determine concurrency at runtime
EventEmitter.defaultMaxListeners = Object.keys(jobProcessors).length * 8

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
    for (const [name, processor] of Object.entries<JobProcessor>(
      jobProcessors
    )) {
      queue.process(name, async (job) => {
        const loggingContext = {
          sessionId: job.data?.sessionId,
          userId: job.data?.userId,
        }

        logger.info(`Processing job: ${job.name}`, loggingContext)
        await newrelic.startBackgroundTransaction(
          `job:${job.name}`,
          async () => {
            const transaction = newrelic.getTransaction()
            try {
              await processor(job)
              logger.info(`Completed job: ${job.name}`, loggingContext)
            } catch (error) {
              logger.error(`Error processing job: ${job.name}`, {
                err: error,
                ...loggingContext,
              })
              throw error
            } finally {
              transaction.end()
            }
          }
        )
      })
    }
  } catch (error) {
    logger.error(`Error adding job processors`, { err: error })
  }
}
