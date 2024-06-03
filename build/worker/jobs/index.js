"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJobProcessors = exports.Jobs = void 0;
const events_1 = __importDefault(require("events"));
const lodash_1 = require("lodash");
const newrelic_1 = __importDefault(require("newrelic"));
const logger_1 = __importDefault(require("../../logger"));
const backfill_email_nice_to_meet_you_1 = __importDefault(require("../../scripts/backfill-email-nice-to-meet-you"));
const backfill_email_volunteer_inactive_1 = __importDefault(require("../../scripts/backfill-email-volunteer-inactive"));
const backfill_student_posthog_1 = __importDefault(require("../../scripts/backfill-student-posthog"));
const backfill_student_users_roles_1 = __importDefault(require("../../scripts/backfill-student-users-roles"));
const backfill_update_elapsed_availability_1 = __importDefault(require("../../scripts/backfill-update-elapsed-availability"));
const delete_duplicate_push_tokens_1 = __importDefault(require("../../scripts/delete-duplicate-push-tokens"));
const delete_duplicate_user_surveys_1 = __importDefault(require("../../scripts/delete-duplicate-user-surveys"));
const delete_self_favorited_volunteers_1 = __importDefault(require("../../scripts/delete-self-favorited-volunteers"));
const delete_duplicate_student_favorite_volunteers_1 = __importDefault(require("../../scripts/delete-duplicate-student-favorite-volunteers"));
const send_weekly_hour_summary_apology_1 = __importDefault(require("../../scripts/send-weekly-hour-summary-apology"));
const upsert_postal_codes_1 = __importDefault(require("../../scripts/upsert-postal-codes"));
const titlecase_school_names_1 = __importDefault(require("../../scripts/titlecase-school-names"));
const upsert_schools_1 = __importDefault(require("../../scripts/upsert-schools"));
const chatbot_1 = __importDefault(require("./chatbot"));
const emailNiceToMeetYou_1 = __importDefault(require("./emailNiceToMeetYou"));
const emailReadyToCoach_1 = __importDefault(require("./emailReadyToCoach"));
const emailReferenceFollowup_1 = __importDefault(require("./emailReferenceFollowup"));
const emailReferences_1 = __importDefault(require("./emailReferences"));
const emailReferencesFormApology_1 = __importDefault(require("./emailReferencesFormApology"));
const emailWaitingOnReferences_1 = __importDefault(require("./emailWaitingOnReferences"));
const emailWeeklyHourSummary_1 = __importDefault(require("./emailWeeklyHourSummary"));
const endStaleSessions_1 = __importDefault(require("./endStaleSessions"));
const endUnmatchedSession_1 = __importDefault(require("./endUnmatchedSession"));
const generateAndStoreWaitTimeHeatMap_1 = __importDefault(require("./generateAndStoreWaitTimeHeatMap"));
const notifyTutors_1 = __importDefault(require("./notifyTutors"));
const emailLowHoursSelected_1 = __importDefault(require("./partner-volunteer-emails/emailLowHoursSelected"));
const sendAssistmentsData_1 = __importDefault(require("./sendAssistmentsData"));
const sendFollowupText_1 = __importDefault(require("./sendFollowupText"));
const emailSessionReported_1 = __importDefault(require("./user-emails/emailSessionReported"));
const emailStudentFirstSessionCongrats_1 = __importDefault(require("./student-emails/emailStudentFirstSessionCongrats"));
const emailStudentOnboardingSeries_1 = __importDefault(require("./student-emails/emailStudentOnboardingSeries"));
const emailStudentSessionActions_1 = __importDefault(require("./student-emails/emailStudentSessionActions"));
const updateElapsedAvailability_1 = __importDefault(require("./updateElapsedAvailability"));
const updateTotalVolunteerHours_1 = __importDefault(require("./updateTotalVolunteerHours"));
const emailFailedFirstAttemptedQuiz_1 = __importDefault(require("./volunteer-emails/emailFailedFirstAttemptedQuiz"));
const emailGentleWarning_1 = __importDefault(require("./volunteer-emails/emailGentleWarning"));
const emailOnboardingReminder_1 = __importDefault(require("./volunteer-emails/emailOnboardingReminder"));
const emailQuickTips_1 = __importDefault(require("./volunteer-emails/emailQuickTips"));
const emailTenSessionMilestone_1 = __importDefault(require("./volunteer-emails/emailTenSessionMilestone"));
const emailVolunteerFirstSessionCongrats_1 = __importDefault(require("./volunteer-emails/emailVolunteerFirstSessionCongrats"));
const emailVolunteerInactive_1 = __importDefault(require("./volunteer-emails/emailVolunteerInactive"));
const emailVolunteerInactiveBlackoutOver_1 = __importDefault(require("./volunteer-emails/emailVolunteerInactiveBlackoutOver"));
const emailVolunteerSessionActions_1 = __importDefault(require("./volunteer-emails/emailVolunteerSessionActions"));
const updateGradeLevel_1 = __importDefault(require("./updateGradeLevel"));
const studentProcrastinationTextReminder_1 = __importDefault(require("./studentProcrastinationTextReminder"));
const sendSessionRecapMessageNotification_1 = __importDefault(require("./sendSessionRecapMessageNotification"));
const generateProgressReport_1 = __importDefault(require("./generateProgressReport"));
const update_basic_access_views_1 = __importDefault(require("../../scripts/update-basic-access-views"));
const spawnEmailWeeklyHourSummaryJobs_1 = __importDefault(require("./spawnEmailWeeklyHourSummaryJobs"));
var Jobs;
(function (Jobs) {
    Jobs["NotifyTutors"] = "NotifyTutors";
    Jobs["UpdateElapsedAvailability"] = "UpdateElapsedAvailability";
    Jobs["UpdateTotalVolunteerHours"] = "UpdateTotalVolunteerHours";
    Jobs["EndStaleSessions"] = "EndStaleSessions";
    Jobs["EndUnmatchedSession"] = "EndUnmatchedSession";
    Jobs["GenerateAndStoreWaitTimeHeatMap"] = "GenerateAndStoreWaitTimeHeatMap";
    Jobs["EmailReferences"] = "EmailReferences";
    Jobs["EmailReferencesFormApology"] = "EmailReferencesFormApology";
    Jobs["EmailReadyToCoach"] = "EmailReadyToCoach";
    Jobs["EmailReferenceFollowup"] = "EmailReferenceFollowup";
    Jobs["EmailWaitingOnReferences"] = "EmailWaitingOnReferences";
    Jobs["EmailNiceToMeetYou"] = "EmailNiceToMeetYou";
    Jobs["SpawnEmailWeeklyHourSummaryJobs"] = "SpawnEmailWeeklyHourSummaryJobs";
    Jobs["EmailWeeklyHourSummary"] = "EmailWeeklyHourSummary";
    Jobs["EmailOnboardingReminderOne"] = "EmailOnboardingReminderOne";
    Jobs["EmailOnboardingReminderTwo"] = "EmailOnboardingReminderTwo";
    Jobs["EmailOnboardingReminderThree"] = "EmailOnboardingReminderThree";
    Jobs["EmailStudentOnboardingHowItWorks"] = "EmailStudentOnboardingHowItWorks";
    Jobs["EmailStudentOnboardingMission"] = "EmailStudentOnboardingMission";
    Jobs["EmailMeetOurVolunteers"] = "EmailMeetOurVolunteers";
    Jobs["EmailStudentOnboardingSurvey"] = "EmailStudentOnboardingSurvey";
    Jobs["EmailStudentAbsentWarning"] = "EmailStudentAbsentWarning";
    Jobs["EmailStudentAbsentVolunteerApology"] = "EmailStudentAbsentVolunteerApology";
    Jobs["EmailStudentUnmatchedApology"] = "EmailStudentUnmatchedApology";
    Jobs["EmailSessionReported"] = "EmailSessionReported";
    Jobs["EmailVolunteerQuickTips"] = "EmailVolunteerQuickTips";
    Jobs["EmailPartnerVolunteerLowHoursSelected"] = "EmailPartnerVolunteerLowHoursSelected";
    Jobs["EmailVolunteerTenSessionMilestone"] = "EmailVolunteerTenSessionMilestone";
    Jobs["EmailVolunteerInactiveBlackoutOver"] = "EmailVolunteerInactiveBlackoutOver";
    Jobs["EmailVolunteerGentleWarning"] = "EmailVolunteerGentleWarning";
    Jobs["EmailVolunteerInactiveThirtyDays"] = "EmailVolunteerInactiveThirtyDays";
    Jobs["EmailVolunteerInactiveSixtyDays"] = "EmailVolunteerInactiveSixtyDays";
    Jobs["EmailVolunteerInactiveNinetyDays"] = "EmailVolunteerInactiveNinetyDays";
    Jobs["EmailVolunteerInactive"] = "EmailVolunteerInactive";
    Jobs["EmailVolunteerFirstSessionCongrats"] = "EmailVolunteerFirstSessionCongrats";
    Jobs["EmailVolunteerAbsentWarning"] = "EmailVolunteerAbsentWarning";
    Jobs["EmailVolunteerAbsentStudentApology"] = "EmailVolunteerAbsentStudentApology";
    Jobs["EmailStudentFirstSessionCongrats"] = "EmailStudentFirstSessionCongrats";
    Jobs["EmailFailedFirstAttemptedQuiz"] = "EmailFailedFirstAttemptedQuiz";
    Jobs["SendAssistmentsData"] = "SendAssistmentsData";
    Jobs["EmailStudentOnlyLookingForAnswers"] = "EmailStudentOnlyLookingForAnswers";
    Jobs["SendFollowupText"] = "SendFollowupText";
    Jobs["Chatbot"] = "Chatbot";
    Jobs["UpdateGradeLevel"] = "UpdateGradeLevel";
    Jobs["StudentProcrastinationTextReminder"] = "StudentProcrastinationTextReminder";
    Jobs["SendSessionRecapMessageNotification"] = "SendSessionRecapMessageNotification";
    Jobs["GenerateProgressReport"] = "GenerateProgressReport";
    // TODO: remove the following deprecated job names
    Jobs["EmailStudentUseCases"] = "EmailStudentUseCases";
    Jobs["EmailIndependentLearning"] = "EmailIndependentLearning";
    Jobs["EmailStudentGoalSetting"] = "EmailStudentGoalSetting";
    // Backfill scripts
    Jobs["BackfillEmailNiceToMeetYou"] = "BackfillEmailNiceToMeetYou";
    Jobs["BackfillEmailVolunteersInactive"] = "BackfillEmailVolunteersInactive";
    Jobs["BackfillStudentPosthog"] = "BackfillStudentPosthog";
    Jobs["SendWeeklyHourSummaryApology"] = "SendWeeklyHourSummaryApology";
    Jobs["BackfillUpdateElapsedAvailability"] = "BackfillUpdateElapsedAvailability";
    Jobs["BackfillStudentUsersRoles"] = "BackfillStudentUsersRoles";
    // Delete scripts
    Jobs["DeleteDuplicatePushTokens"] = "DeleteDuplicatePushTokens";
    Jobs["DeleteDuplicateFeedbacks"] = "DeleteDuplicateFeedbacks";
    Jobs["DeleteSelfFavoritedVolunteers"] = "DeleteSelfFavoritedVolunteers";
    Jobs["DeleteDuplicateUserSurveys"] = "DeleteDuplicateUserSurveys";
    Jobs["DeleteDuplicateStudentFavoriteVolunteers"] = "DeleteDuplicateStudentFavoriteVolunteers";
    // Migration scripts
    Jobs["MigrateHistoricalPartnerData"] = "MigrateHistoricalPartnerData";
    Jobs["UpsertPostalCodes"] = "UpsertPostalCodes";
    Jobs["TitlecaseSchoolNames"] = "TitlecaseSchoolNames";
    Jobs["UpsertSchools"] = "UpsertSchools";
    // Eng Tooling Scripts
    Jobs["UpdateBasicAccessViews"] = "UpdateBasicAccessViews";
})(Jobs = exports.Jobs || (exports.Jobs = {}));
const jobProcessors = [
    {
        name: Jobs.NotifyTutors,
        processor: notifyTutors_1.default,
    },
    {
        name: Jobs.UpdateElapsedAvailability,
        processor: updateElapsedAvailability_1.default,
    },
    {
        name: Jobs.UpdateTotalVolunteerHours,
        processor: updateTotalVolunteerHours_1.default,
    },
    {
        name: Jobs.EndStaleSessions,
        processor: endStaleSessions_1.default,
    },
    {
        name: Jobs.EndUnmatchedSession,
        processor: endUnmatchedSession_1.default,
    },
    {
        name: Jobs.GenerateAndStoreWaitTimeHeatMap,
        processor: generateAndStoreWaitTimeHeatMap_1.default,
    },
    {
        name: Jobs.EmailReferences,
        processor: emailReferences_1.default,
    },
    {
        name: Jobs.EmailReferencesFormApology,
        processor: emailReferencesFormApology_1.default,
    },
    {
        name: Jobs.EmailReadyToCoach,
        processor: emailReadyToCoach_1.default,
    },
    {
        name: Jobs.EmailReferenceFollowup,
        processor: emailReferenceFollowup_1.default,
    },
    {
        name: Jobs.EmailWaitingOnReferences,
        processor: emailWaitingOnReferences_1.default,
    },
    {
        name: Jobs.EmailNiceToMeetYou,
        processor: emailNiceToMeetYou_1.default,
    },
    {
        name: Jobs.SpawnEmailWeeklyHourSummaryJobs,
        processor: spawnEmailWeeklyHourSummaryJobs_1.default,
    },
    {
        name: Jobs.EmailWeeklyHourSummary,
        processor: emailWeeklyHourSummary_1.default,
    },
    {
        name: Jobs.EmailOnboardingReminderOne,
        processor: emailOnboardingReminder_1.default,
    },
    {
        name: Jobs.EmailOnboardingReminderTwo,
        processor: emailOnboardingReminder_1.default,
    },
    {
        name: Jobs.EmailOnboardingReminderThree,
        processor: emailOnboardingReminder_1.default,
    },
    {
        name: Jobs.EmailStudentOnboardingHowItWorks,
        processor: emailStudentOnboardingSeries_1.default,
    },
    {
        name: Jobs.EmailMeetOurVolunteers,
        processor: emailStudentOnboardingSeries_1.default,
    },
    {
        name: Jobs.EmailStudentOnboardingMission,
        processor: emailStudentOnboardingSeries_1.default,
    },
    {
        name: Jobs.EmailStudentOnboardingSurvey,
        processor: emailStudentOnboardingSeries_1.default,
    },
    {
        name: Jobs.EmailStudentAbsentWarning,
        processor: emailStudentSessionActions_1.default,
    },
    {
        name: Jobs.EmailStudentAbsentVolunteerApology,
        processor: emailStudentSessionActions_1.default,
    },
    {
        name: Jobs.EmailStudentUnmatchedApology,
        processor: emailStudentSessionActions_1.default,
    },
    {
        name: Jobs.EmailStudentOnlyLookingForAnswers,
        processor: emailStudentSessionActions_1.default,
    },
    {
        name: Jobs.EmailVolunteerQuickTips,
        processor: emailQuickTips_1.default,
    },
    {
        name: Jobs.EmailPartnerVolunteerLowHoursSelected,
        processor: emailLowHoursSelected_1.default,
    },
    {
        name: Jobs.EmailVolunteerTenSessionMilestone,
        processor: emailTenSessionMilestone_1.default,
    },
    {
        name: Jobs.EmailVolunteerGentleWarning,
        processor: emailGentleWarning_1.default,
    },
    {
        name: Jobs.EmailVolunteerInactive,
        processor: emailVolunteerInactive_1.default,
    },
    {
        name: Jobs.EmailVolunteerFirstSessionCongrats,
        processor: emailVolunteerFirstSessionCongrats_1.default,
    },
    {
        name: Jobs.EmailVolunteerInactiveBlackoutOver,
        processor: emailVolunteerInactiveBlackoutOver_1.default,
    },
    {
        name: Jobs.EmailStudentFirstSessionCongrats,
        processor: emailStudentFirstSessionCongrats_1.default,
    },
    {
        name: Jobs.EmailVolunteerAbsentWarning,
        processor: emailVolunteerSessionActions_1.default,
    },
    {
        name: Jobs.EmailVolunteerAbsentStudentApology,
        processor: emailVolunteerSessionActions_1.default,
    },
    {
        name: Jobs.EmailFailedFirstAttemptedQuiz,
        processor: emailFailedFirstAttemptedQuiz_1.default,
    },
    {
        name: Jobs.EmailSessionReported,
        processor: emailSessionReported_1.default,
    },
    {
        name: Jobs.SendAssistmentsData,
        processor: sendAssistmentsData_1.default,
    },
    {
        name: Jobs.Chatbot,
        processor: chatbot_1.default,
    },
    {
        name: Jobs.SendFollowupText,
        processor: sendFollowupText_1.default,
    },
    {
        name: Jobs.UpdateGradeLevel,
        processor: updateGradeLevel_1.default,
    },
    {
        name: Jobs.StudentProcrastinationTextReminder,
        processor: studentProcrastinationTextReminder_1.default,
    },
    {
        name: Jobs.SendSessionRecapMessageNotification,
        processor: sendSessionRecapMessageNotification_1.default,
    },
    {
        name: Jobs.GenerateProgressReport,
        processor: generateProgressReport_1.default,
    },
    // TODO: remove the following deprecated job names
    {
        name: Jobs.EmailStudentUseCases,
        processor: emailStudentOnboardingSeries_1.default,
    },
    {
        name: Jobs.EmailIndependentLearning,
        processor: emailStudentOnboardingSeries_1.default,
    },
    {
        name: Jobs.EmailStudentGoalSetting,
        processor: emailStudentOnboardingSeries_1.default,
    },
    // Backfill scripts
    {
        name: Jobs.BackfillEmailNiceToMeetYou,
        processor: backfill_email_nice_to_meet_you_1.default,
    },
    {
        name: Jobs.BackfillEmailVolunteersInactive,
        processor: backfill_email_volunteer_inactive_1.default,
    },
    {
        name: Jobs.BackfillStudentPosthog,
        processor: backfill_student_posthog_1.default,
    },
    {
        name: Jobs.SendWeeklyHourSummaryApology,
        processor: send_weekly_hour_summary_apology_1.default,
    },
    {
        name: Jobs.DeleteDuplicatePushTokens,
        processor: delete_duplicate_push_tokens_1.default,
    },
    {
        name: Jobs.DeleteDuplicateUserSurveys,
        processor: delete_duplicate_user_surveys_1.default,
    },
    {
        name: Jobs.BackfillUpdateElapsedAvailability,
        processor: backfill_update_elapsed_availability_1.default,
    },
    {
        name: Jobs.BackfillStudentUsersRoles,
        processor: backfill_student_users_roles_1.default,
    },
    {
        name: Jobs.DeleteSelfFavoritedVolunteers,
        processor: delete_self_favorited_volunteers_1.default,
    },
    // TODO: uncomment this processor when ready to migrate
    //{
    //  name: Jobs.MigrateHistoricalPartnerData,
    //  processor: migrateHistoricalPartnerData
    //},
    {
        name: Jobs.UpsertPostalCodes,
        processor: upsert_postal_codes_1.default,
    },
    {
        name: Jobs.TitlecaseSchoolNames,
        processor: titlecase_school_names_1.default,
    },
    {
        name: Jobs.UpsertSchools,
        processor: upsert_schools_1.default,
    },
    {
        name: Jobs.DeleteDuplicateStudentFavoriteVolunteers,
        processor: delete_duplicate_student_favorite_volunteers_1.default,
    },
    {
        name: Jobs.UpdateBasicAccessViews,
        processor: update_basic_access_views_1.default,
    },
];
// Each Bull processor needs at least one listener per thread - https://github.com/OptimalBits/bull/issues/615
// TODO: determine concurrency at runtime
events_1.default.defaultMaxListeners = jobProcessors.length * 8;
/**
 * Job processors should throw an error when they fail perform an expected action.
 * The thrown error should include a message about which documents (if any) were
 * affected so failed actions can be backfilled.
 *
 * They can additionally log internal state but all thrown errors will be logged
 * in a consistent format with a Sentry capture so we can create effective
 * monitoring alerts on jobs.
 */
const addJobProcessors = (queue) => {
    try {
        (0, lodash_1.map)(jobProcessors, jobProcessor => queue.process(jobProcessor.name, (job /*, done*/) => {
            return new Promise((res, rej) => {
                newrelic_1.default
                    .startBackgroundTransaction(`job:${job.name}`, async () => {
                    const transaction = newrelic_1.default.getTransaction();
                    logger_1.default.info(`Processing job: ${job.name}`);
                    try {
                        await jobProcessor.processor(job);
                        logger_1.default.info(`Completed job: ${job.name}`);
                        res();
                    }
                    catch (error) {
                        logger_1.default.error(`Error processing job: ${job.name}\n${error}`);
                        newrelic_1.default.noticeError(error);
                        rej(error);
                    }
                    finally {
                        transaction.end();
                    }
                })
                    .catch(error => {
                    logger_1.default.error(`error in job processor newrelic transaction: ${error}`);
                    newrelic_1.default.noticeError(error);
                });
            });
        }));
    }
    catch (error) {
        logger_1.default.error(`error adding job processors: ${error}`);
        newrelic_1.default.noticeError(error);
    }
};
exports.addJobProcessors = addJobProcessors;
