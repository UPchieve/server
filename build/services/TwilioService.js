"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrCreateRateLimit = exports.beginRegularNotifications = exports.confirmVerification = exports.sendVerification = exports.notifyVolunteer = exports.getAssociatedPartner = exports.buildNotificationContent = exports.buildTargetStudentContent = exports.sendFollowupText = exports.relativeDate = exports.getActiveSessionVolunteers = exports.getSessionUrl = exports.sendVoiceMessage = exports.sendProcrastinationTextReminder = exports.sendTextMessage = exports.getCurrentAvailabilityPath = void 0;
const twilio_1 = __importDefault(require("twilio"));
const get_times_1 = require("../utils/get-times");
const config_1 = __importDefault(require("../config"));
const moment_1 = __importDefault(require("moment"));
const Student_1 = require("../models/Student");
const Volunteer_1 = require("../models/Volunteer");
const QueueService_1 = __importDefault(require("./QueueService"));
const SessionRepo = __importStar(require("../models/Session"));
const VolunteerRepo = __importStar(require("../models/Volunteer"));
const case_1 = __importDefault(require("case"));
const logger_1 = __importDefault(require("../logger"));
const constants_1 = require("../constants");
const starts_with_vowel_1 = __importDefault(require("../utils/starts-with-vowel"));
const Session_1 = require("../models/Session");
const AssociatedPartner_1 = require("../models/AssociatedPartner");
const SponsorOrg_1 = require("../models/SponsorOrg");
const jobs_1 = require("../worker/jobs");
const FeatureFlagService_1 = require("./FeatureFlagService");
const protocol = config_1.default.NODE_ENV === 'production' ? 'https' : 'http';
const apiRoot = config_1.default.NODE_ENV === 'production'
    ? `https://${config_1.default.host}/twiml`
    : `http://${config_1.default.host}/twiml`;
const twilioClient = config_1.default.accountSid && config_1.default.authToken
    ? (0, twilio_1.default)(config_1.default.accountSid, config_1.default.authToken)
    : null;
// See Twilio Verify error codes here: https://www.twilio.com/docs/api/errors#6-anchor
var TwilioErrorCodes;
(function (TwilioErrorCodes) {
    TwilioErrorCodes[TwilioErrorCodes["INVALID_PARAMETER"] = 60200] = "INVALID_PARAMETER";
})(TwilioErrorCodes || (TwilioErrorCodes = {}));
// get the availability field to query for the current time
function getCurrentAvailabilityPath() {
    const date = (0, get_times_1.getCurrentNewYorkTime)();
    const day = date.isoWeekday() - 1;
    let baseHour = date.hour();
    let hour;
    if (baseHour >= 12) {
        if (baseHour > 12) {
            baseHour -= 12;
        }
        hour = `${baseHour}p`;
    }
    else {
        if (baseHour === 0) {
            baseHour = 12;
        }
        hour = `${baseHour}a`;
    }
    const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];
    return `availability.${days[day]}.${hour}`;
}
exports.getCurrentAvailabilityPath = getCurrentAvailabilityPath;
async function sendTextMessage(phoneNumber, messageText) {
    logger_1.default.info(`Sending text message "${messageText}" to ${phoneNumber}`);
    // If stored phone number doesn't have international calling code (E.164 formatting)
    // then default to US number
    // TODO: normalize previously stored US phone numbers
    const fullPhoneNumber = phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`;
    if (!twilioClient) {
        logger_1.default.warn('Twilio client not loaded.');
        return '0';
    }
    const message = await twilioClient.messages.create({
        to: fullPhoneNumber,
        from: config_1.default.sendingNumber,
        body: messageText,
    });
    if (message.sid) {
        logger_1.default.info(`Message sent to ${phoneNumber} with message id \n ${message.sid}`);
        return message.sid;
    }
    throw new Error(`Failed to send text message ${messageText} to ${phoneNumber}`);
}
exports.sendTextMessage = sendTextMessage;
async function sendProcrastinationTextReminder(userId, firstName, phoneNumber) {
    let messageCopy = await (0, FeatureFlagService_1.getProcrastinationTextReminderCopy)(userId);
    // Use a default message if no message is found from the flag payload
    if (!messageCopy)
        messageCopy =
            "Hi {{firstName}}! UPchieve here. We're reminding you to stay ahead and avoid that last-minute panic. Tackle procrastination with a study session now: https://app.upchieve.org?s=tr";
    // Feature flag payload will have variables that we want to interpolate
    const messageText = messageCopy.replace('{{firstName}}', firstName);
    logger_1.default.info(`Sending reminder text ${userId} - "${messageText}" to ${phoneNumber}`);
    if (!twilioClient) {
        logger_1.default.warn('Twilio client not loaded.');
        return;
    }
    const message = await twilioClient.messages.create({
        to: phoneNumber,
        from: config_1.default.sendingNumber,
        body: messageText,
    });
    if (message.sid) {
        logger_1.default.info(`Message sent to user ${userId} at ${phoneNumber} with message id \n ${message.sid}`);
        return message.sid;
    }
    throw new Error(`Failed to send text message to user ${userId} - ${messageText} to ${phoneNumber}`);
}
exports.sendProcrastinationTextReminder = sendProcrastinationTextReminder;
async function sendVoiceMessage(phoneNumber, messageText) {
    logger_1.default.info(`Sending voice message "${messageText}" to ${phoneNumber}`);
    // URL for Twilio to retrieve the TwiML with the message text and voice
    const url = apiRoot + '/message/' + encodeURIComponent(messageText);
    // If stored phone number doesn't have international calling code (E.164 formatting)
    // then default to US number
    // TODO: normalize previously stored US phone numbers
    const fullPhoneNumber = phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`;
    // initiate call, giving Twilio the aforementioned URL which Twilio
    // opens when the call is answered to get the TwiML instructions
    if (!twilioClient) {
        logger_1.default.warn('Twilio client not loaded.');
        return '0';
    }
    const call = await twilioClient.calls.create({
        url: url,
        to: fullPhoneNumber,
        from: config_1.default.sendingNumber,
    });
    logger_1.default.info(`Voice call to ${phoneNumber} with id ${call.sid}`);
    return call.sid;
}
exports.sendVoiceMessage = sendVoiceMessage;
function getSessionUrl(session) {
    return `${protocol}://${config_1.default.client.host}/session/${case_1.default.kebab(session.topic)}/${case_1.default.kebab(session.subject)}/${session.id}`;
}
exports.getSessionUrl = getSessionUrl;
async function getActiveSessionVolunteers() {
    const volunteerIds = await SessionRepo.getActiveSessionsWithVolunteers();
    return volunteerIds;
}
exports.getActiveSessionVolunteers = getActiveSessionVolunteers;
function relativeDate(msAgo) {
    return new Date(new Date().getTime() - msAgo);
}
exports.relativeDate = relativeDate;
async function sendFollowupText(sessionId, volunteerId, volunteerPhone) {
    const messageText = 'Heads up: this student is still waiting for help!';
    let notification = {
        wasSuccessful: false,
        messageId: undefined,
        volunteer: volunteerId,
        type: 'followup',
        method: 'sms',
        priorityGroup: 'follow-up',
    };
    try {
        const messageId = await sendTextMessage(volunteerPhone, messageText);
        notification.wasSuccessful = true;
        notification.messageId = messageId;
    }
    catch (err) {
        logger_1.default.error(err);
    }
    await SessionRepo.addSessionNotification(sessionId, notification);
}
exports.sendFollowupText = sendFollowupText;
function buildTargetStudentContent(volunteer, associatedPartner) {
    return associatedPartner &&
        associatedPartner.studentOrgDisplay &&
        volunteer.volunteerPartnerOrg === associatedPartner.volunteerPartnerOrg
        ? (0, starts_with_vowel_1.default)(associatedPartner.studentOrgDisplay)
            ? `an ${associatedPartner.studentOrgDisplay} student`
            : `a ${associatedPartner.studentOrgDisplay} student`
        : 'a student';
}
exports.buildTargetStudentContent = buildTargetStudentContent;
function buildNotificationContent(session, volunteer, associatedPartner) {
    const sessionUrl = getSessionUrl(session);
    return `Hi ${volunteer.firstName}, ${buildTargetStudentContent(volunteer, associatedPartner)} needs help in ${session.subjectDisplayName} on UPchieve! ${sessionUrl}`;
}
exports.buildNotificationContent = buildNotificationContent;
async function getAssociatedPartner(partnerOrg, highSchoolId) {
    // Determine if the student's partner org is one of the orgs that
    // should have priority matching with its partner volunteer org counterpart
    if (partnerOrg &&
        config_1.default.priorityMatchingPartnerOrgs.some(org => partnerOrg === org))
        return await (0, AssociatedPartner_1.getAssociatedPartnerByPartnerOrg)(partnerOrg);
    for (const sponsorOrg of config_1.default.priorityMatchingSponsorOrgs) {
        // Determine if the student's school belongs to a sponsor org that
        // should have priority matching with its partner volunteer org counterpart
        const sponsorOrgs = await (0, SponsorOrg_1.getSponsorOrgs)();
        const matchingOrg = sponsorOrgs.find(org => org.key === sponsorOrg);
        if (highSchoolId &&
            matchingOrg &&
            Array.isArray(matchingOrg.schoolIds) &&
            matchingOrg.schoolIds.some(schoolId => schoolId === highSchoolId))
            return await (0, AssociatedPartner_1.getAssociatedPartnerBySponsorOrg)(sponsorOrg);
        // Determine if the student's partner org belongs to a sponsor org that
        // should have priority matching with its partner volunteer org counterpart
        if (partnerOrg &&
            matchingOrg &&
            Array.isArray(matchingOrg.studentPartnerOrgKeys) &&
            matchingOrg.studentPartnerOrgKeys.includes(partnerOrg))
            return await (0, AssociatedPartner_1.getAssociatedPartnerBySponsorOrg)(sponsorOrg);
    }
    return undefined;
}
exports.getAssociatedPartner = getAssociatedPartner;
async function notifyVolunteer(session) {
    const student = await (0, Student_1.getStudentContactInfoById)(session.studentId);
    if (!student)
        return;
    const favoriteVolunteers = await (0, Student_1.getFavoriteVolunteersByStudentId)(student.id);
    const associatedPartner = student.studentPartnerOrg
        ? await getAssociatedPartner(student.studentPartnerOrg, student.schoolId)
        : undefined;
    const activeSessionVolunteers = await getActiveSessionVolunteers();
    const notifiedForThisSessionId = await (0, Volunteer_1.getVolunteersNotifiedBySessionId)(session.id);
    const disqualifiedVolunteers = [
        ...activeSessionVolunteers,
        ...notifiedForThisSessionId,
    ];
    // Prioritize volunteers who do not have high-level subjects to avoid
    // lack of volunteers when high-level subjects are requested
    const highLevelSubjects = [
        constants_1.SUBJECTS.CALCULUS_AB,
        constants_1.SUBJECTS.CHEMISTRY,
        constants_1.SUBJECTS.STATISTICS,
    ];
    /**
     * 1. Favorite volunteers - not notified in the last 15 mins
     * 2. Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"
     * 3. Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"
     * 4. Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"
     * 5. Regular volunteers - not notified in the last 24 hours AND they don’t have " high level subjects"
     * 6. All volunteers - not notified in the last 24 hours
     * 7. All volunteers - not notified in the last 60 mins
     * 8. All volunteers - not notified in the last 15 mins
     */
    const volunteerPriority = [
        {
            groupName: `Favorite volunteers - not notified in the last 15 mins`,
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(15, 'minutes')
                    .toDate(),
                isPartner: undefined,
                highLevelSubjects: undefined,
                disqualifiedVolunteers,
                specificPartner: undefined,
                favoriteVolunteers,
            }),
        },
        {
            groupName: `${associatedPartner ? 'Associated partner' : 'Partner'} volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"`,
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(3, 'days')
                    .toDate(),
                isPartner: true,
                highLevelSubjects,
                disqualifiedVolunteers,
                specificPartner: associatedPartner === null || associatedPartner === void 0 ? void 0 : associatedPartner.volunteerPartnerOrg,
                favoriteVolunteers: undefined,
            }),
        },
        {
            groupName: 'Regular volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"',
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(3, 'days')
                    .toDate(),
                isPartner: false,
                highLevelSubjects,
                disqualifiedVolunteers,
                specificPartner: undefined,
                favoriteVolunteers: undefined,
            }),
        },
        {
            groupName: `${associatedPartner ? 'Associated partner' : 'Partner'} volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"`,
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(1, 'day')
                    .toDate(),
                isPartner: true,
                highLevelSubjects,
                disqualifiedVolunteers,
                specificPartner: associatedPartner === null || associatedPartner === void 0 ? void 0 : associatedPartner.volunteerPartnerOrg,
                favoriteVolunteers: undefined,
            }),
        },
        {
            groupName: 'Regular volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"',
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(1, 'day')
                    .toDate(),
                isPartner: false,
                highLevelSubjects,
                disqualifiedVolunteers,
                specificPartner: undefined,
                favoriteVolunteers: undefined,
            }),
        },
        {
            groupName: 'All volunteers - not notified in the last 24 hours',
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(1, 'day')
                    .toDate(),
                isPartner: undefined,
                highLevelSubjects: undefined,
                disqualifiedVolunteers,
                specificPartner: undefined,
                favoriteVolunteers: undefined,
            }),
        },
        {
            groupName: 'All volunteers - not notified in the last 60 mins',
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(1, 'hour')
                    .toDate(),
                isPartner: undefined,
                highLevelSubjects: undefined,
                disqualifiedVolunteers,
                specificPartner: undefined,
                favoriteVolunteers: undefined,
            }),
        },
        {
            groupName: 'All volunteers - not notified in the last 15 mins',
            query: () => VolunteerRepo.getNextVolunteerToNotify({
                subject: session.subject,
                lastNotified: (0, moment_1.default)()
                    .subtract(15, 'minutes')
                    .toDate(),
                isPartner: undefined,
                highLevelSubjects: undefined,
                disqualifiedVolunteers,
                specificPartner: undefined,
                favoriteVolunteers: undefined,
            }),
        },
    ];
    let volunteer;
    let priorityGroup;
    for (const priorityFilter of volunteerPriority) {
        volunteer = await priorityFilter.query();
        if (volunteer) {
            const mutedSubjectAlertsFlag = await (0, FeatureFlagService_1.getMutedSubjectAlertsFlag)(volunteer.id);
            if (mutedSubjectAlertsFlag) {
                const volunteerMutedSubject = await VolunteerRepo.checkIfVolunteerMutedSubject(volunteer.id, session.subject);
                if (volunteerMutedSubject) {
                    volunteer = undefined;
                    continue;
                }
            }
            priorityGroup = priorityFilter.groupName;
            break;
        }
    }
    if (!volunteer)
        return;
    const messageText = buildNotificationContent(session, volunteer, associatedPartner);
    let notification = {
        wasSuccessful: false,
        messageId: undefined,
        volunteer: volunteer.id,
        type: 'initial',
        method: 'sms',
        priorityGroup,
    };
    try {
        const messageId = await sendTextMessage(volunteer.phone, messageText);
        notification.wasSuccessful = true;
        notification.messageId = messageId;
    }
    catch (err) {
        logger_1.default.error(err);
    }
    await SessionRepo.addSessionNotification(session.id, notification);
    return volunteer.id;
}
exports.notifyVolunteer = notifyVolunteer;
async function sendVerification(sendTo, verificationMethod, firstName, userId) {
    if (!twilioClient) {
        logger_1.default.warn('Twilio client not loaded.');
        return;
    }
    await twilioClient.verify
        .services(config_1.default.twilioAccountVerificationServiceSid)
        .verifications.create({
        to: sendTo,
        channel: verificationMethod,
        channelConfiguration: {
            from: config_1.default.mail.senders.noreply,
            from_name: 'UPchieve',
            substitutions: {
                firstName,
            },
        },
        rateLimits: {
            [config_1.default.twilioVerificationRateLimitUniqueName]: userId,
        },
    }, async (error, verificationInstance) => {
        if (error) {
            if ('code' in error &&
                error['code'] === TwilioErrorCodes.INVALID_PARAMETER) {
                // Rate limit with that unique name does not exist.
                // This should have been created during application startup.
                logger_1.default.warn(`Could not find Twilio rate limit with uniqueName=${config_1.default.twilioVerificationRateLimitUniqueName} while attempting to send a verification code. Will attempt to create it now.`);
                await createRateLimit(config_1.default.twilioVerificationRateLimitUniqueName);
            }
        }
    });
}
exports.sendVerification = sendVerification;
async function confirmVerification(to, code) {
    if (!twilioClient) {
        logger_1.default.warn('Twilio client not loaded.');
        return true;
    }
    const result = await twilioClient.verify
        .services(config_1.default.twilioAccountVerificationServiceSid)
        .verificationChecks.create({ to, code });
    return result.valid;
}
exports.confirmVerification = confirmVerification;
async function beginRegularNotifications(sessionId) {
    const session = await (0, Session_1.getSessionById)(sessionId);
    const isTestUser = await (0, Student_1.getTestStudentExistsById)(session.studentId);
    if (isTestUser)
        return;
    // Delay initial wave of notifications by 1 min to give
    // volunteers on the dashboard time to pick up the request
    const notificationSchedule = config_1.default.notificationSchedule.slice();
    const delay = notificationSchedule.shift();
    await QueueService_1.default.add(jobs_1.Jobs.NotifyTutors, { sessionId, notificationSchedule, currentNotificationRound: 1 }, { delay, removeOnComplete: true, removeOnFail: true });
}
exports.beginRegularNotifications = beginRegularNotifications;
/**
 * Verifies that the Twilio RateLimit resource with the desired uniqueName exists,
 * or creates it if not.
 *
 * The RateLimit is identified by its uniqueName attribute when you
 * make a createVerification request.
 *
 * Each RateLimit has 1 or more associated RateLimitBucket resources which
 * is where we configure the actual time interval and number of retries.
 *
 * Learn more here: https://www.twilio.com/docs/verify/api/programmable-rate-limits
 */
async function fetchOrCreateRateLimit() {
    if (!twilioClient) {
        logger_1.default.warn('Twilio client not loaded');
        return;
    }
    logger_1.default.info(`Attempting to fetch or create Twilio rate limit with uniqueName=${config_1.default.twilioVerificationRateLimitUniqueName}`);
    // Fetch RateLimits and see if the one we want exists.
    const rateLimits = await twilioClient.verify
        .services(config_1.default.twilioAccountVerificationServiceSid)
        .rateLimits.list();
    const targetRateLimit = rateLimits.find(rateLimit => rateLimit.uniqueName === config_1.default.twilioVerificationRateLimitUniqueName);
    if (targetRateLimit) {
        return;
    }
    logger_1.default.warn(`Did not find Twilio rate limit resource with name ${config_1.default.twilioVerificationRateLimitUniqueName}. Will create one now.`);
    await createRateLimit(config_1.default.twilioVerificationRateLimitUniqueName);
}
exports.fetchOrCreateRateLimit = fetchOrCreateRateLimit;
async function createRateLimit(uniqueName) {
    // Create RateLimit
    const rateLimit = await (twilioClient === null || twilioClient === void 0 ? void 0 : twilioClient.verify.services(config_1.default.twilioAccountVerificationServiceSid).rateLimits.create({
        uniqueName,
        description: `Rate limit on ${uniqueName}`,
    }));
    if (!rateLimit) {
        // It should throw an error in this case, but just to be safe
        throw new Error(`Could not create rate limit`);
    }
    logger_1.default.info(`Created RateLimit in Twilio with uniqueName=${uniqueName}`);
    const rateLimitSid = (await Promise.resolve(rateLimit)).sid;
    // Create RateLimitBucket
    const rateLimitBucket = await (twilioClient === null || twilioClient === void 0 ? void 0 : twilioClient.verify.services(config_1.default.twilioAccountVerificationServiceSid).rateLimits(rateLimitSid).buckets.create({
        max: config_1.default.twilioVerificationRateLimitMaxRetries,
        interval: config_1.default.twilioVerificationRateLimitIntervalSeconds,
    }));
    if (!rateLimitBucket) {
        // It should throw an error in this case, but just to be safe
        throw new Error('Could not create rate limit bucket');
    }
    logger_1.default.info(`Created RateLimitBucket in Twilio`);
}
