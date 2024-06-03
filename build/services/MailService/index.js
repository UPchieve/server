"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchContact = exports.createContact = exports.sendSessionRecapMessage = exports.sendReferralProgramEmail = exports.sendRosterStudentSetPasswordEmail = exports.sendOnlyLookingForAnswersWarning = exports.sendVolunteerAbsentStudentApology = exports.sendVolunteerAbsentWarning = exports.sendStudentUnmatchedApology = exports.sendStudentAbsentVolunteerApology = exports.sendStudentAbsentWarning = exports.sendCoachReported = exports.sendStudentReported = exports.sendVolunteerInactiveBlackoutOver = exports.sendVolunteerInactiveNinetyDays = exports.sendVolunteerInactiveSixtyDays = exports.sendVolunteerInactiveThirtyDays = exports.sendVolunteerGentleWarning = exports.sendVolunteerTenSessionMilestone = exports.sendVolunteerFirstSessionCongrats = exports.sendPartnerVolunteerLowHoursSelected = exports.sendVolunteerQuickTips = exports.sendFailedFirstAttemptedQuiz = exports.sendOnboardingReminderThree = exports.sendOnboardingReminderTwo = exports.sendOnboardingReminderOne = exports.sendWeeklyHourApologyEmail = exports.sendHourSummaryEmail = exports.sendNiceToMeetYou = exports.sendWaitingOnReferences = exports.sendReferenceFollowup = exports.sendRejectedReference = exports.sendRejectedPhotoSubmission = exports.sendBannedUserAlert = exports.sendReadyToCoachEmail = exports.sendApprovedNotOnboardedEmail = exports.sendReferenceFormApology = exports.sendReferenceForm = exports.sendReportedSessionAlert = exports.sendStudentFirstSessionCongrats = exports.sendStudentOnboardingSurvey = exports.sendStudentOnboardingMission = exports.sendMeetOurVolunteers = exports.sendStudentOnboardingHowItWorks = exports.sendStudentOnboardingWelcomeEmail = exports.sendPartnerVolunteerWelcomeEmail = exports.sendOpenVolunteerWelcomeEmail = exports.sendReset = exports.sendContactForm = exports.sendVerification = void 0;
exports.deleteContact = void 0;
const config_1 = __importDefault(require("../../config"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const format_multi_word_subject_1 = __importDefault(require("../../utils/format-multi-word-subject"));
const constants_1 = require("../../constants");
const User_1 = require("../../models/User");
const VolunteerPartnerOrg_1 = require("../../models/VolunteerPartnerOrg");
const StudentPartnerOrg_1 = require("../../models/StudentPartnerOrg");
const link_builders_1 = require("../../utils/link-builders");
mail_1.default.setApiKey(config_1.default.sendgrid.apiKey);
const options = {
    headers: {
        Authorization: `Bearer ${config_1.default.sendgrid.apiKey}`,
        'content-type': 'application/json',
    },
};
// TODO: properly type the sendgrid responses https://sendgrid.api-docs.io/v3.0/contacts/search-contacts
async function putContact(data) {
    return await axios_1.default.put('https://api.sendgrid.com/v3/marketing/contacts', data, options);
}
async function getContact(email) {
    return await axios_1.default.post('https://api.sendgrid.com/v3/marketing/contacts/search', { query: `email = '${email}'` }, options);
}
async function sgDeleteContact(contactId) {
    return await axios_1.default.delete(`https://api.sendgrid.com/v3/marketing/contacts?ids=${contactId}`, options);
}
const SG_CUSTOM_FIELDS = {
    isBanned: 'e3_T',
    isTestUser: 'e4_T',
    isVolunteer: 'e6_T',
    isAdmin: 'e7_T',
    isFakeUser: 'e8_T',
    isDeactivated: 'e9_T',
    joined: 'e10_D',
    studentPartnerOrg: 'e11_T',
    studentPartnerOrgDisplay: 'e12_T',
    volunteerPartnerOrg: 'e13_T',
    volunteerPartnerOrgDisplay: 'e14_T',
    passedUpchieve101: 'e17_T',
    studentGradeLevel: 'w20_T',
};
// TODO: refactor sendEmail to better handle overrides with custom unsubscribe groups
//        and preferences and bypassing those unsubscribe groups
async function sendEmail(toEmail, fromEmail, fromName, templateId, dynamicData, overrides = {}) {
    const msg = {
        to: toEmail,
        from: {
            email: fromEmail,
            name: fromName,
        },
        reply_to: {
            email: config_1.default.mail.receivers.support,
        },
        templateId: templateId,
        dynamic_template_data: dynamicData,
        ...overrides,
    };
    await mail_1.default.send(msg);
}
function getFormattedHourSummaryTime(time) {
    const hour = Math.floor(Math.abs(time));
    const minute = Math.floor((Math.abs(time) * 60) % 60);
    let format = '';
    if (hour > 1)
        format += `${hour} hours`;
    if (hour === 1)
        format += `${hour} hour`;
    if (hour && minute)
        format += ' and ';
    if (minute > 1)
        format += `${minute} minutes`;
    if (minute === 1)
        format += `${minute} minute`;
    if (hour === 0 && minute === 0)
        format += '0';
    return format;
}
async function sendVerification(email, token) {
    const url = 'http://' + config_1.default.client.host + '/action/verify/' + token;
    const overrides = {
        categories: ['account verification'],
        mail_settings: { bypass_list_management: { enable: true } },
    };
    await sendEmail(email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.verifyTemplate, {
        userEmail: email,
        verifyLink: url,
    }, overrides);
}
exports.sendVerification = sendVerification;
async function sendContactForm(requestData) {
    const overrides = {
        // ensure staff members always get contact form submissions
        mail_settings: { bypass_list_management: { enable: true } },
    };
    await sendEmail(config_1.default.mail.receivers.contact, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.contactTemplate, requestData, overrides);
}
exports.sendContactForm = sendContactForm;
async function sendReset(email, token) {
    const url = `https://${config_1.default.client.host}/setpassword?token=${token}`;
    const overrides = {
        mail_settings: { bypass_list_management: { enable: true } },
    };
    await sendEmail(email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.resetTemplate, {
        userEmail: email,
        resetLink: url,
    }, overrides);
}
exports.sendReset = sendReset;
async function sendOpenVolunteerWelcomeEmail(email, volunteerName) {
    const overrides = {
        categories: ['volunteer welcome email'],
    };
    await sendEmail(email, config_1.default.mail.senders.support, 'UPchieve', config_1.default.sendgrid.openVolunteerWelcomeTemplate, { volunteerName }, overrides);
}
exports.sendOpenVolunteerWelcomeEmail = sendOpenVolunteerWelcomeEmail;
async function sendPartnerVolunteerWelcomeEmail(email, volunteerName) {
    const overrides = {
        categories: ['partner volunteer welcome email'],
    };
    await sendEmail(email, config_1.default.mail.senders.support, 'UPchieve', config_1.default.sendgrid.partnerVolunteerWelcomeTemplate, { volunteerName }, overrides);
}
exports.sendPartnerVolunteerWelcomeEmail = sendPartnerVolunteerWelcomeEmail;
async function sendStudentOnboardingWelcomeEmail(email, firstName) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.students,
        },
        categories: ['Student Onboarding Email 1 - Welcome'],
    };
    await sendEmail(email, config_1.default.mail.senders.students, 'UPchieve Student Success Team', config_1.default.sendgrid.studentOnboardingWelcomeTemplate, { firstName }, overrides);
}
exports.sendStudentOnboardingWelcomeEmail = sendStudentOnboardingWelcomeEmail;
async function sendStudentOnboardingHowItWorks(email, firstName) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.students,
        },
        categories: ['Student Onboarding Email 2 - How It Works'],
    };
    await sendEmail(email, config_1.default.mail.senders.students, 'UPchieve Student Success Team', config_1.default.sendgrid.studentOnboardingHowItWorksTemplate, { firstName }, overrides);
}
exports.sendStudentOnboardingHowItWorks = sendStudentOnboardingHowItWorks;
async function sendMeetOurVolunteers(email, firstName) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.students,
        },
        categories: ['Student Onboarding Email 3 - Meet Our Volunteers'],
    };
    await sendEmail(email, config_1.default.mail.senders.students, 'UPchieve Student Success Team', config_1.default.sendgrid.meetOurVolunteersTemplate, { firstName }, overrides);
}
exports.sendMeetOurVolunteers = sendMeetOurVolunteers;
async function sendStudentOnboardingMission(email, firstName) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.students,
        },
        categories: ['Student Onboarding Email 4 - Mission'],
    };
    await sendEmail(email, config_1.default.mail.senders.students, 'UPchieve Student Success Team', config_1.default.sendgrid.studentOnboardingMissionTemplate, { firstName }, overrides);
}
exports.sendStudentOnboardingMission = sendStudentOnboardingMission;
async function sendStudentOnboardingSurvey(email, firstName) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.students,
        },
        categories: ['Student Onboarding Email 5 - Survey'],
    };
    await sendEmail(email, config_1.default.mail.senders.students, 'UPchieve Student Success Team', config_1.default.sendgrid.studentOnboardingSurveyTemplate, { firstName }, overrides);
}
exports.sendStudentOnboardingSurvey = sendStudentOnboardingSurvey;
async function sendStudentFirstSessionCongrats(email, firstName) {
    const sender = config_1.default.mail.senders.studentOutreachManager;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['student cultivation email - first session congrats'],
    };
    await sendEmail(email, sender, `${config_1.default.mail.people.studentOutreachManager.firstName} ${config_1.default.mail.people.studentOutreachManager.lastName}`, config_1.default.sendgrid.studentFirstSessionCongratsTemplate, { firstName }, overrides);
}
exports.sendStudentFirstSessionCongrats = sendStudentFirstSessionCongrats;
async function sendReportedSessionAlert(sessionId, reportedByEmail, reportReason, reportMessage) {
    const sessionAdminLink = (0, link_builders_1.buildAppLink)(`admin/sessions/${sessionId}`);
    const overrides = {
        mail_settings: { bypass_list_management: { enable: true } },
    };
    await sendEmail(config_1.default.mail.receivers.staff, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.reportedSessionAlertTemplate, {
        sessionId,
        sessionAdminLink,
        reportedByEmail,
        reportReason,
        reportMessage,
    }, overrides);
}
exports.sendReportedSessionAlert = sendReportedSessionAlert;
async function sendReferenceForm(reference, volunteer) {
    const emailData = {
        referenceUrl: (0, link_builders_1.buildAppLink)(`reference-form/${reference.id}`),
        referenceName: reference.firstName,
        volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
    };
    const overrides = {
        categories: ['reference form email'],
    };
    await sendEmail(reference.email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.referenceFormTemplate, emailData, overrides);
}
exports.sendReferenceForm = sendReferenceForm;
// TODO: remove once job is executed
async function sendReferenceFormApology(reference, volunteer) {
    const emailData = {
        referenceUrl: (0, link_builders_1.buildAppLink)(`reference-form/${reference.id}`),
        referenceName: reference.firstName,
        volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
    };
    const overrides = {
        categories: ['reference form email'],
    };
    await sendEmail(reference.email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.referenceFormApologyTemplate, emailData, overrides);
}
exports.sendReferenceFormApology = sendReferenceFormApology;
async function sendApprovedNotOnboardedEmail(volunteer) {
    const overrides = {
        categories: ['approved not onboarded email'],
    };
    await sendEmail(volunteer.email, config_1.default.mail.senders.support, 'UPchieve', config_1.default.sendgrid.approvedNotOnboardedTemplate, { volunteerName: volunteer.firstName }, overrides);
}
exports.sendApprovedNotOnboardedEmail = sendApprovedNotOnboardedEmail;
async function sendReadyToCoachEmail(volunteer) {
    const readyToCoachTemplate = volunteer.volunteerPartnerOrg
        ? config_1.default.customVolunteerPartnerOrgs.some(org => org === volunteer.volunteerPartnerOrg)
            ? config_1.default.sendgrid.customPartnerReadyToCoachTemplate
            : config_1.default.sendgrid.partnerReadyToCoachTemplate
        : config_1.default.sendgrid.openReadyToCoachTemplate;
    const overrides = {
        categories: ['ready to coach email'],
    };
    await sendEmail(volunteer.email, config_1.default.mail.senders.support, 'UPchieve', readyToCoachTemplate, { volunteerName: volunteer.firstName }, overrides);
}
exports.sendReadyToCoachEmail = sendReadyToCoachEmail;
async function sendBannedUserAlert(userId, banReason, sessionId) {
    const userAdminLink = (0, link_builders_1.buildAppLink)(`admin/users/${userId}`);
    const sessionAdminLink = (0, link_builders_1.buildAppLink)(`admin/sessions/${sessionId}`);
    const overrides = {
        mail_settings: { bypass_list_management: { enable: true } },
    };
    await sendEmail(config_1.default.mail.receivers.staff, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.bannedUserAlertTemplate, {
        userId,
        banReason,
        sessionId,
        userAdminLink,
        sessionAdminLink,
    }, overrides);
}
exports.sendBannedUserAlert = sendBannedUserAlert;
async function sendRejectedPhotoSubmission(volunteer) {
    const overrides = {
        categories: ['photo rejected email'],
    };
    await sendEmail(volunteer.email, config_1.default.mail.senders.support, 'The UPchieve Team', config_1.default.sendgrid.rejectedPhotoSubmissionTemplate, { firstName: volunteer.firstName }, overrides);
}
exports.sendRejectedPhotoSubmission = sendRejectedPhotoSubmission;
async function sendRejectedReference(reference, volunteer) {
    const firstName = (0, lodash_1.capitalize)(volunteer.firstName);
    const emailData = {
        referenceName: `${(0, lodash_1.capitalize)(reference.firstName)} ${(0, lodash_1.capitalize)(reference.lastName)}`,
        firstName,
    };
    const overrides = {
        categories: ['reference rejected email'],
    };
    await sendEmail(volunteer.email, config_1.default.mail.senders.support, 'The UPchieve Team', config_1.default.sendgrid.rejectedReferenceTemplate, emailData, overrides);
}
exports.sendRejectedReference = sendRejectedReference;
// TODO: test this thoroughly
async function sendReferenceFollowup(reference, volunteer) {
    const volunteerFirstName = (0, lodash_1.capitalize)(volunteer.firstName);
    const volunteerLastName = (0, lodash_1.capitalize)(volunteer.lastName);
    const emailData = {
        referenceUrl: (0, link_builders_1.buildAppLink)(`reference-form/${reference.id}`),
        referenceName: reference.firstName,
        volunteerName: `${volunteerFirstName} ${volunteerLastName}`,
        volunteerFirstName,
    };
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.recruitment,
        },
        categories: ['reference followup email'],
    };
    await sendEmail(reference.email, config_1.default.mail.senders.recruitment, `${config_1.default.mail.people.volunteerManager.firstName} at UPchieve`, config_1.default.sendgrid.referenceFollowupTemplate, emailData, overrides);
}
exports.sendReferenceFollowup = sendReferenceFollowup;
// actualy only requires contact info
async function sendWaitingOnReferences(volunteer) {
    const overrides = {
        categories: ['waiting on references email'],
    };
    await sendEmail(volunteer.email, config_1.default.mail.senders.support, 'The UPchieve Team', config_1.default.sendgrid.waitingOnReferencesTemplate, {
        firstName: (0, lodash_1.capitalize)(volunteer.firstName),
    }, overrides);
}
exports.sendWaitingOnReferences = sendWaitingOnReferences;
// actually only requires contact info
async function sendNiceToMeetYou(volunteer) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.senders.volunteerManager,
        },
        categories: ['nice to meet you email'],
    };
    await sendEmail(volunteer.email, config_1.default.mail.senders.volunteerManager, config_1.default.mail.people.volunteerManager.firstName, config_1.default.sendgrid.niceToMeetYouTemplate, {
        firstName: (0, lodash_1.capitalize)(volunteer.firstName),
    }, overrides);
}
exports.sendNiceToMeetYou = sendNiceToMeetYou;
async function sendHourSummaryEmail(firstName, email, sentHourSummaryIntroEmail, fromDate, toDate, totalCoachingHours, totalElapsedAvailability, totalQuizzesPassed, totalVolunteerHours, customOrg = false) {
    const formattedCoachingHours = getFormattedHourSummaryTime(totalCoachingHours);
    const formattedVolunteerHours = getFormattedHourSummaryTime(totalVolunteerHours);
    const overrides = {
        asm: {
            group_id: config_1.default.sendgrid.unsubscribeGroup.volunteerSummary,
        },
        categories: ['weekly hour summary email'],
    };
    const weeklyTemplate = customOrg
        ? config_1.default.sendgrid.customWeeklyHourSummaryEmailTemplate
        : config_1.default.sendgrid.weeklyHourSummaryEmailTemplate;
    const introTemplate = customOrg
        ? config_1.default.sendgrid.customWeeklyHourSummaryIntroEmailTemplate
        : config_1.default.sendgrid.weeklyHourSummaryIntroEmailTemplate;
    await sendEmail(email, config_1.default.mail.senders.support, 'UPchieve', sentHourSummaryIntroEmail ? weeklyTemplate : introTemplate, {
        firstName: (0, lodash_1.capitalize)(firstName),
        fromDate,
        toDate,
        totalCoachingTime: formattedCoachingHours,
        totalElapsedAvailability,
        totalQuizzesPassed,
        totalVolunteerTime: formattedVolunteerHours,
    }, overrides);
}
exports.sendHourSummaryEmail = sendHourSummaryEmail;
async function sendWeeklyHourApologyEmail(firstName, email, fromDate, toDate) {
    const overrides = {
        categories: ['weekly hour summary apology email'],
    };
    await sendEmail(email, config_1.default.mail.senders.support, 'UPchieve', config_1.default.sendgrid.weeklyHourSummaryApologyEmailTemplate, {
        firstName: (0, lodash_1.capitalize)(firstName),
        fromDate,
        toDate,
    }, overrides);
}
exports.sendWeeklyHourApologyEmail = sendWeeklyHourApologyEmail;
async function sendOnboardingReminderOne(firstName, email, hasCompletedBackgroundInfo, hasCompletedUpchieve101, hasUnlockedASubject, hasSelectedAvailability) {
    const overrides = {
        categories: ['onboarding reminder one email'],
    };
    await sendEmail(email, config_1.default.mail.senders.support, 'The UPchieve Team', config_1.default.sendgrid.onboardingReminderOneTemplate, {
        firstName: (0, lodash_1.capitalize)(firstName),
        hasCompletedBackgroundInfo,
        hasCompletedUpchieve101,
        hasUnlockedASubject,
        hasSelectedAvailability,
    }, overrides);
}
exports.sendOnboardingReminderOne = sendOnboardingReminderOne;
async function sendOnboardingReminderTwo(email, firstName) {
    const overrides = {
        categories: ['onboarding reminder two email'],
    };
    await sendEmail(email, config_1.default.mail.senders.support, 'The UPchieve Team', config_1.default.sendgrid.onboardingReminderTwoTemplate, {
        firstName: (0, lodash_1.capitalize)(firstName),
    }, overrides);
}
exports.sendOnboardingReminderTwo = sendOnboardingReminderTwo;
async function sendOnboardingReminderThree(email, firstName) {
    const teamMemberEmail = config_1.default.mail.senders.volunteerManager;
    const overrides = {
        reply_to: {
            email: teamMemberEmail,
        },
        categories: ['onboarding reminder three email'],
    };
    await sendEmail(email, teamMemberEmail, config_1.default.mail.people.volunteerManager.firstName, config_1.default.sendgrid.onboardingReminderThreeTemplate, {
        firstName: (0, lodash_1.capitalize)(firstName),
    }, overrides);
}
exports.sendOnboardingReminderThree = sendOnboardingReminderThree;
async function sendFailedFirstAttemptedQuiz(category, email, firstName) {
    const overrides = {
        reply_to: {
            email: config_1.default.mail.senders.support,
        },
        categories: ['failed first attempted quiz email'],
    };
    const templateToSend = category === constants_1.TRAINING.UPCHIEVE_101
        ? config_1.default.sendgrid.failedFirstAttemptedTrainingTemplate
        : config_1.default.sendgrid.failedFirstAttemptedQuizTemplate;
    await sendEmail(email, config_1.default.mail.senders.noreply, 'The UPchieve Team', templateToSend, {
        firstName: (0, lodash_1.capitalize)(firstName),
        category: (0, format_multi_word_subject_1.default)(category),
    }, overrides);
}
exports.sendFailedFirstAttemptedQuiz = sendFailedFirstAttemptedQuiz;
async function sendVolunteerQuickTips(email, firstName) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const overrides = {
        reply_to: {
            email: config_1.default.mail.receivers.support,
        },
        categories: ['volunteer - quick tips'],
    };
    await sendEmail(email, sender, `${config_1.default.mail.people.volunteerManager.firstName} ${config_1.default.mail.people.volunteerManager.lastName}`, config_1.default.sendgrid.volunteerQuickTipsTemplate, { firstName }, overrides);
}
exports.sendVolunteerQuickTips = sendVolunteerQuickTips;
async function sendPartnerVolunteerLowHoursSelected(email, firstName) {
    const sender = config_1.default.mail.receivers.support;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['partner volunteer - low hours'],
    };
    await sendEmail(email, sender, 'The UPchieve Team', config_1.default.sendgrid.partnerVolunteerLowHoursSelectedTemplate, { firstName }, overrides);
}
exports.sendPartnerVolunteerLowHoursSelected = sendPartnerVolunteerLowHoursSelected;
async function sendVolunteerFirstSessionCongrats(email, firstName) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - first session congrats'],
    };
    await sendEmail(email, sender, `${config_1.default.mail.people.volunteerManager.firstName} ${config_1.default.mail.people.volunteerManager.lastName}`, config_1.default.sendgrid.volunteerFirstSessionCongratsTemplate, { firstName }, overrides);
}
exports.sendVolunteerFirstSessionCongrats = sendVolunteerFirstSessionCongrats;
async function sendVolunteerTenSessionMilestone(email, firstName) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - ten session milestone'],
    };
    await sendEmail(email, sender, `${config_1.default.mail.people.volunteerManager.firstName} ${config_1.default.mail.people.volunteerManager.lastName}`, config_1.default.sendgrid.volunteerTenSessionMilestoneTemplate, { firstName }, overrides);
}
exports.sendVolunteerTenSessionMilestone = sendVolunteerTenSessionMilestone;
async function sendVolunteerGentleWarning(email, firstName) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - gentle warning'],
    };
    await sendEmail(email, sender, config_1.default.mail.people.volunteerManager.firstName, config_1.default.sendgrid.volunteerGentleWarningTemplate, { firstName }, overrides);
}
exports.sendVolunteerGentleWarning = sendVolunteerGentleWarning;
async function sendVolunteerInactiveThirtyDays(email, firstName) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - inactive thirty days'],
    };
    await sendEmail(email, sender, config_1.default.mail.people.volunteerManager.firstName, config_1.default.sendgrid.volunteerInactiveThirtyDaysTemplate, { firstName }, overrides);
}
exports.sendVolunteerInactiveThirtyDays = sendVolunteerInactiveThirtyDays;
async function sendVolunteerInactiveSixtyDays(email, firstName) {
    const sender = config_1.default.mail.senders.support;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - inactive sixty days'],
    };
    await sendEmail(email, sender, 'The UPchieve Team', config_1.default.sendgrid.volunteerInactiveSixtyDaysTemplate, { firstName }, overrides);
}
exports.sendVolunteerInactiveSixtyDays = sendVolunteerInactiveSixtyDays;
async function sendVolunteerInactiveNinetyDays(email, firstName) {
    const sender = config_1.default.mail.senders.support;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - inactive ninety days'],
    };
    await sendEmail(email, sender, 'The UPchieve Team', config_1.default.sendgrid.volunteerInactiveNinetyDaysTemplate, { firstName }, overrides);
}
exports.sendVolunteerInactiveNinetyDays = sendVolunteerInactiveNinetyDays;
async function sendVolunteerInactiveBlackoutOver(email, firstName) {
    const sender = config_1.default.mail.senders.support;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - inactive blackout over'],
    };
    await sendEmail(email, sender, 'The UPchieve Team', config_1.default.sendgrid.volunteerInactiveBlackoutOverTemplate, { firstName }, overrides);
}
exports.sendVolunteerInactiveBlackoutOver = sendVolunteerInactiveBlackoutOver;
async function sendStudentReported(email, firstName, reportReason) {
    let sender;
    let from;
    let template;
    if (reportReason === constants_1.SESSION_REPORT_REASON.STUDENT_RUDE) {
        sender = config_1.default.mail.senders.support;
        from = 'The UPchieve Team';
        template = config_1.default.sendgrid.studentReportedRudeTemplate;
    }
    else {
        sender = config_1.default.mail.senders.crisis;
        from = 'Katy from UPchieve';
        template = config_1.default.sendgrid.studentReportedSafetyTemplate;
    }
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['student - reported'],
    };
    await sendEmail(email, sender, from, template, { firstName }, overrides);
}
exports.sendStudentReported = sendStudentReported;
async function sendCoachReported(email, firstName) {
    const sender = config_1.default.mail.senders.support;
    const from = 'The UPchieve Team';
    const template = config_1.default.sendgrid.studentReportedCoachDmTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['coach - reported'],
    };
    await sendEmail(email, sender, from, template, { firstName }, overrides);
}
exports.sendCoachReported = sendCoachReported;
async function sendStudentAbsentWarning(email, firstName) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const from = config_1.default.mail.people.volunteerManager.firstName;
    const template = config_1.default.sendgrid.studentAbsentWarningTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['student - absent warning'],
    };
    await sendEmail(email, sender, from, template, { firstName }, overrides);
}
exports.sendStudentAbsentWarning = sendStudentAbsentWarning;
async function sendStudentAbsentVolunteerApology(firstName, email, volunteerFirstName, sessionSubject, sessionDate) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const from = config_1.default.mail.people.volunteerManager.firstName;
    const template = config_1.default.sendgrid.studentAbsentVolunteerApologyTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['student - absent volunteer apology'],
    };
    await sendEmail(email, sender, from, template, {
        firstName,
        volunteerFirstName,
        sessionSubject,
        sessionDate,
    }, overrides);
}
exports.sendStudentAbsentVolunteerApology = sendStudentAbsentVolunteerApology;
async function sendStudentUnmatchedApology(firstName, email, sessionSubject, sessionDate) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const from = config_1.default.mail.people.volunteerManager.firstName;
    const template = config_1.default.sendgrid.studentUnmatchedApologyTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['student - unmatched apology'],
    };
    await sendEmail(email, sender, from, template, { firstName, sessionSubject, sessionDate }, overrides);
}
exports.sendStudentUnmatchedApology = sendStudentUnmatchedApology;
async function sendVolunteerAbsentWarning(firstName, email, studentFirstName, sessionSubject, sessionDate) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const from = config_1.default.mail.people.volunteerManager.firstName;
    const template = config_1.default.sendgrid.volunteerAbsentWarningTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - absent warning'],
    };
    await sendEmail(email, sender, from, template, {
        firstName,
        studentFirstName,
        sessionSubject,
        sessionDate,
    }, overrides);
}
exports.sendVolunteerAbsentWarning = sendVolunteerAbsentWarning;
async function sendVolunteerAbsentStudentApology(firstName, email, studentFirstName, sessionSubject, sessionDate) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const from = config_1.default.mail.people.volunteerManager.firstName;
    const template = config_1.default.sendgrid.volunteerAbsentStudentApologyTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['volunteer - absent student apology'],
    };
    await sendEmail(email, sender, from, template, {
        firstName,
        studentFirstName,
        sessionSubject,
        sessionDate,
    }, overrides);
}
exports.sendVolunteerAbsentStudentApology = sendVolunteerAbsentStudentApology;
async function sendOnlyLookingForAnswersWarning(firstName, email) {
    const sender = config_1.default.mail.senders.volunteerManager;
    const from = config_1.default.mail.people.volunteerManager.firstName;
    const template = config_1.default.sendgrid.studentOnlyLookingForAnswersTemplate;
    const overrides = {
        reply_to: {
            email: sender,
        },
        categories: ['student - only looking for answers'],
    };
    await sendEmail(email, sender, from, template, { firstName }, overrides);
}
exports.sendOnlyLookingForAnswersWarning = sendOnlyLookingForAnswersWarning;
async function sendRosterStudentSetPasswordEmail(email, studentFirstName, token) {
    const overrides = {
        mail_settings: { bypass_list_management: { enable: true } },
    };
    const url = `https://${config_1.default.client.host}/setpassword?token=${token}`;
    await sendEmail(email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.rosterStudentSetPasswordTemplate, {
        firstName: studentFirstName,
        userEmail: email,
        resetLink: url,
    }, overrides);
}
exports.sendRosterStudentSetPasswordEmail = sendRosterStudentSetPasswordEmail;
async function sendReferralProgramEmail(email, studentFirstName, referralLink) {
    await sendEmail(email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.referralProgramTemplate, {
        firstName: studentFirstName,
        referralLink,
    });
}
exports.sendReferralProgramEmail = sendReferralProgramEmail;
async function sendSessionRecapMessage(email, receiverFirstName, senderFirstName, sessionRecapLink, message) {
    await sendEmail(email, config_1.default.mail.senders.noreply, 'UPchieve', config_1.default.sendgrid.emailSessionRecapMessage, {
        receiverFirstName,
        senderFirstName,
        sessionRecapLink,
        message,
    });
}
exports.sendSessionRecapMessage = sendSessionRecapMessage;
async function createContact(userId) {
    const user = await (0, User_1.getUserToCreateSendGridContact)(userId);
    const customFields = {
        [SG_CUSTOM_FIELDS.isBanned]: String(user.banned),
        [SG_CUSTOM_FIELDS.isTestUser]: String(user.testUser),
        [SG_CUSTOM_FIELDS.isVolunteer]: String(user.isVolunteer),
        [SG_CUSTOM_FIELDS.isAdmin]: String(user.isAdmin),
        [SG_CUSTOM_FIELDS.isDeactivated]: String(user.deactivated),
        [SG_CUSTOM_FIELDS.joined]: user.createdAt,
    };
    const contactListId = user.isVolunteer
        ? config_1.default.sendgrid.contactList.volunteers
        : config_1.default.sendgrid.contactList.students;
    if (user.isVolunteer) {
        const volunteer = user;
        customFields[SG_CUSTOM_FIELDS.passedUpchieve101] = String(volunteer.passedUpchieve101);
        if (volunteer.volunteerPartnerOrg) {
            customFields[SG_CUSTOM_FIELDS.volunteerPartnerOrg] =
                volunteer.volunteerPartnerOrg;
            customFields[SG_CUSTOM_FIELDS.volunteerPartnerOrgDisplay] = (await (0, VolunteerPartnerOrg_1.getFullVolunteerPartnerOrgByKey)(volunteer.volunteerPartnerOrg)).key;
        }
    }
    else {
        const student = user;
        if (student.studentGradeLevel)
            customFields[SG_CUSTOM_FIELDS.studentGradeLevel] =
                student.studentGradeLevel;
        if (student.studentPartnerOrg) {
            customFields[SG_CUSTOM_FIELDS.studentPartnerOrg] =
                student.studentPartnerOrg;
            customFields[SG_CUSTOM_FIELDS.studentPartnerOrgDisplay] = (await (0, StudentPartnerOrg_1.getFullStudentPartnerOrgByKey)(student.studentPartnerOrg)).key;
        }
    }
    const data = {
        list_ids: [contactListId],
        contacts: [
            {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                custom_fields: customFields,
            },
        ],
    };
    return await putContact(JSON.stringify(data));
}
exports.createContact = createContact;
async function searchContact(email) {
    const response = await getContact(email);
    const { data: { result }, } = response;
    const [contact] = result;
    return contact;
}
exports.searchContact = searchContact;
async function deleteContact(contactId) {
    return await sgDeleteContact(contactId);
}
exports.deleteContact = deleteContact;
