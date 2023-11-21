import config from '../../config'
import { Ulid } from '../../models/pgUtils'
import sgMail from '@sendgrid/mail'
import axios from 'axios'
import { capitalize } from 'lodash'
import formatMultiWordSubject from '../../utils/format-multi-word-subject'
import {
  SESSION_REPORT_REASON,
  USER_BAN_REASONS,
  TRAINING,
} from '../../constants'
import { getUserToCreateSendGridContact } from '../../models/User'
import { VolunteerContactInfo, UnsentReference } from '../../models/Volunteer'
import { getFullVolunteerPartnerOrgByKey } from '../../models/VolunteerPartnerOrg'
import { getFullStudentPartnerOrgByKey } from '../../models/StudentPartnerOrg'
import { buildAppLink } from '../../utils/link-builders'

sgMail.setApiKey(config.sendgrid.apiKey)

const options = {
  headers: {
    Authorization: `Bearer ${config.sendgrid.apiKey}`,
    'content-type': 'application/json',
  },
}

// TODO: properly type the sendgrid responses https://sendgrid.api-docs.io/v3.0/contacts/search-contacts
async function putContact(data: any): Promise<any> {
  return await axios.put(
    'https://api.sendgrid.com/v3/marketing/contacts',
    data,
    options
  )
}

async function getContact(email: string): Promise<{ data: { result: any[] } }> {
  return await axios.post(
    'https://api.sendgrid.com/v3/marketing/contacts/search',
    { query: `email = '${email}'` },
    options
  )
}

async function sgDeleteContact(contactId: string): Promise<any> {
  return await axios.delete(
    `https://api.sendgrid.com/v3/marketing/contacts?ids=${contactId}`,
    options
  )
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
}

// TODO: refactor sendEmail to better handle overrides with custom unsubscribe groups
//        and preferences and bypassing those unsubscribe groups
async function sendEmail(
  toEmail: string,
  fromEmail: string,
  fromName: string,
  templateId: string,
  dynamicData: any,
  overrides: any = {}
): Promise<void> {
  const msg = {
    to: toEmail,
    from: {
      email: fromEmail,
      name: fromName,
    },
    reply_to: {
      email: config.mail.receivers.support,
    },
    templateId: templateId,
    dynamic_template_data: dynamicData,
    ...overrides,
  }

  await sgMail.send(msg)
}

function getFormattedHourSummaryTime(time: number): string {
  const hour = Math.floor(Math.abs(time))
  const minute = Math.floor((Math.abs(time) * 60) % 60)
  let format = ''
  if (hour > 1) format += `${hour} hours`
  if (hour === 1) format += `${hour} hour`
  if (hour && minute) format += ' and '
  if (minute > 1) format += `${minute} minutes`
  if (minute === 1) format += `${minute} minute`
  if (hour === 0 && minute === 0) format += '0'

  return format
}

export async function sendVerification(
  email: string,
  token: string
): Promise<void> {
  const url = 'http://' + config.client.host + '/action/verify/' + token

  const overrides = {
    categories: ['account verification'],
    mail_settings: { bypass_list_management: { enable: true } },
  }

  await sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.verifyTemplate,
    {
      userEmail: email,
      verifyLink: url,
    },
    overrides
  )
}

interface ContactData {
  topic: string
  message: string
  email: string
}
export async function sendContactForm(requestData: ContactData): Promise<void> {
  const overrides = {
    // ensure staff members always get contact form submissions
    mail_settings: { bypass_list_management: { enable: true } },
  }

  await sendEmail(
    config.mail.receivers.contact,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.contactTemplate,
    requestData,
    overrides
  )
}

export async function sendReset(email: string, token: string): Promise<void> {
  const url = `https://${config.client.host}/setpassword?token=${token}`

  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }

  await sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.resetTemplate,
    {
      userEmail: email,
      resetLink: url,
    },
    overrides
  )
}

export async function sendOpenVolunteerWelcomeEmail(
  email: string,
  volunteerName: string
): Promise<void> {
  const overrides = {
    categories: ['volunteer welcome email'],
  }

  await sendEmail(
    email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.openVolunteerWelcomeTemplate,
    { volunteerName },
    overrides
  )
}

export async function sendPartnerVolunteerWelcomeEmail(
  email: string,
  volunteerName: string
): Promise<void> {
  const overrides = {
    categories: ['partner volunteer welcome email'],
  }

  await sendEmail(
    email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.partnerVolunteerWelcomeTemplate,
    { volunteerName },
    overrides
  )
}

export async function sendStudentOnboardingWelcomeEmail(
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 1 - Welcome'],
  }
  await sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingWelcomeTemplate,
    { firstName },
    overrides
  )
}

export async function sendStudentOnboardingHowItWorks(
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 2 - How It Works'],
  }

  await sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingHowItWorksTemplate,
    { firstName },
    overrides
  )
}

export async function sendMeetOurVolunteers(
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 3 - Meet Our Volunteers'],
  }

  await sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.meetOurVolunteersTemplate,
    { firstName },
    overrides
  )
}

export async function sendStudentOnboardingMission(
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 4 - Mission'],
  }

  await sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingMissionTemplate,
    { firstName },
    overrides
  )
}

export async function sendStudentOnboardingSurvey(
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 5 - Survey'],
  }
  await sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingSurveyTemplate,
    { firstName },
    overrides
  )
}

export async function sendStudentFirstSessionCongrats(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.studentOutreachManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student cultivation email - first session congrats'],
  }
  await sendEmail(
    email,
    sender,
    `${config.mail.people.studentOutreachManager.firstName} ${config.mail.people.studentOutreachManager.lastName}`,
    config.sendgrid.studentFirstSessionCongratsTemplate,
    { firstName },
    overrides
  )
}

export async function sendReportedSessionAlert(
  sessionId: Ulid,
  reportedByEmail: string,
  reportReason: string,
  reportMessage: string
): Promise<void> {
  const sessionAdminLink = buildAppLink(`admin/sessions/${sessionId}`)
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }
  await sendEmail(
    config.mail.receivers.staff,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.reportedSessionAlertTemplate,
    {
      sessionId,
      sessionAdminLink,
      reportedByEmail,
      reportReason,
      reportMessage,
    },
    overrides
  )
}

export async function sendReferenceForm(
  reference: UnsentReference,
  volunteer: VolunteerContactInfo
): Promise<void> {
  const emailData = {
    referenceUrl: buildAppLink(`reference-form/${reference.id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
  }
  const overrides = {
    categories: ['reference form email'],
  }

  await sendEmail(
    reference.email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.referenceFormTemplate,
    emailData,
    overrides
  )
}

// TODO: remove once job is executed
export async function sendReferenceFormApology(
  reference: UnsentReference,
  volunteer: VolunteerContactInfo
): Promise<void> {
  const emailData = {
    referenceUrl: buildAppLink(`reference-form/${reference.id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
  }
  const overrides = {
    categories: ['reference form email'],
  }

  await sendEmail(
    reference.email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.referenceFormApologyTemplate,
    emailData,
    overrides
  )
}

export async function sendApprovedNotOnboardedEmail<
  V extends VolunteerContactInfo
>(volunteer: V): Promise<void> {
  const overrides = {
    categories: ['approved not onboarded email'],
  }

  await sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.approvedNotOnboardedTemplate,
    { volunteerName: volunteer.firstName },
    overrides
  )
}

export async function sendReadyToCoachEmail<V extends VolunteerContactInfo>(
  volunteer: V
): Promise<void> {
  const readyToCoachTemplate = volunteer.volunteerPartnerOrg
    ? config.customVolunteerPartnerOrgs.some(
        org => org === volunteer.volunteerPartnerOrg
      )
      ? config.sendgrid.customPartnerReadyToCoachTemplate
      : config.sendgrid.partnerReadyToCoachTemplate
    : config.sendgrid.openReadyToCoachTemplate
  const overrides = {
    categories: ['ready to coach email'],
  }

  await sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'UPchieve',
    readyToCoachTemplate,
    { volunteerName: volunteer.firstName },
    overrides
  )
}

export async function sendBannedUserAlert(
  userId: Ulid,
  banReason: USER_BAN_REASONS,
  sessionId?: Ulid
): Promise<void> {
  const userAdminLink = buildAppLink(`admin/users/${userId}`)
  const sessionAdminLink = buildAppLink(`admin/sessions/${sessionId}`)
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }
  await sendEmail(
    config.mail.receivers.staff,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.bannedUserAlertTemplate,
    {
      userId,
      banReason,
      sessionId,
      userAdminLink,
      sessionAdminLink,
    },
    overrides
  )
}

export async function sendRejectedPhotoSubmission<
  V extends VolunteerContactInfo
>(volunteer: V): Promise<void> {
  const overrides = {
    categories: ['photo rejected email'],
  }

  await sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.rejectedPhotoSubmissionTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendRejectedReference<V extends VolunteerContactInfo>(
  reference: UnsentReference,
  volunteer: V
): Promise<void> {
  const firstName = capitalize(volunteer.firstName)
  const emailData = {
    referenceName: `${capitalize(reference.firstName)} ${capitalize(
      reference.lastName
    )}`,
    firstName,
  }
  const overrides = {
    categories: ['reference rejected email'],
  }

  await sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.rejectedReferenceTemplate,
    emailData,
    overrides
  )
}

// TODO: test this thoroughly
export async function sendReferenceFollowup(
  reference: UnsentReference,
  volunteer: VolunteerContactInfo
): Promise<void> {
  const volunteerFirstName = capitalize(volunteer.firstName)
  const volunteerLastName = capitalize(volunteer.lastName)
  const emailData = {
    referenceUrl: buildAppLink(`reference-form/${reference.id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteerFirstName} ${volunteerLastName}`,
    volunteerFirstName,
  }
  const overrides = {
    reply_to: {
      email: config.mail.receivers.recruitment,
    },
    categories: ['reference followup email'],
  }

  await sendEmail(
    reference.email,
    config.mail.senders.recruitment,
    `${config.mail.people.volunteerManager.firstName} at UPchieve`,
    config.sendgrid.referenceFollowupTemplate,
    emailData,
    overrides
  )
}

// actualy only requires contact info
export async function sendWaitingOnReferences<V extends VolunteerContactInfo>(
  volunteer: V
): Promise<void> {
  const overrides = {
    categories: ['waiting on references email'],
  }

  await sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.waitingOnReferencesTemplate,
    {
      firstName: capitalize(volunteer.firstName),
    },
    overrides
  )
}

// actually only requires contact info
export async function sendNiceToMeetYou<V extends VolunteerContactInfo>(
  volunteer: V
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.senders.volunteerManager,
    },
    categories: ['nice to meet you email'],
  }

  await sendEmail(
    volunteer.email,
    config.mail.senders.volunteerManager,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.niceToMeetYouTemplate,
    {
      firstName: capitalize(volunteer.firstName),
    },
    overrides
  )
}

export async function sendHourSummaryEmail(
  firstName: string,
  email: string,
  sentHourSummaryIntroEmail: boolean,
  fromDate: string,
  toDate: string,
  totalCoachingHours: number,
  totalElapsedAvailability: number,
  totalQuizzesPassed: number,
  totalVolunteerHours: number,
  customOrg = false
): Promise<void> {
  const formattedCoachingHours = getFormattedHourSummaryTime(totalCoachingHours)
  const formattedVolunteerHours = getFormattedHourSummaryTime(
    totalVolunteerHours
  )

  const overrides = {
    asm: {
      group_id: config.sendgrid.unsubscribeGroup.volunteerSummary,
    },
    categories: ['weekly hour summary email'],
  }

  const weeklyTemplate = customOrg
    ? config.sendgrid.customWeeklyHourSummaryEmailTemplate
    : config.sendgrid.weeklyHourSummaryEmailTemplate

  const introTemplate = customOrg
    ? config.sendgrid.customWeeklyHourSummaryIntroEmailTemplate
    : config.sendgrid.weeklyHourSummaryIntroEmailTemplate

  await sendEmail(
    email,
    config.mail.senders.support,
    'UPchieve',
    sentHourSummaryIntroEmail ? weeklyTemplate : introTemplate,
    {
      firstName: capitalize(firstName),
      fromDate,
      toDate,
      totalCoachingTime: formattedCoachingHours,
      totalElapsedAvailability,
      totalQuizzesPassed,
      totalVolunteerTime: formattedVolunteerHours,
    },
    overrides
  )
}

export async function sendWeeklyHourApologyEmail(
  firstName: string,
  email: string,
  fromDate: string,
  toDate: string
): Promise<void> {
  const overrides = {
    categories: ['weekly hour summary apology email'],
  }

  await sendEmail(
    email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.weeklyHourSummaryApologyEmailTemplate,
    {
      firstName: capitalize(firstName),
      fromDate,
      toDate,
    },
    overrides
  )
}

export async function sendOnboardingReminderOne(
  firstName: string,
  email: string,
  hasCompletedBackgroundInfo: boolean,
  hasCompletedUpchieve101: boolean,
  hasUnlockedASubject: boolean,
  hasSelectedAvailability: boolean
): Promise<void> {
  const overrides = {
    categories: ['onboarding reminder one email'],
  }

  await sendEmail(
    email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.onboardingReminderOneTemplate,
    {
      firstName: capitalize(firstName),
      hasCompletedBackgroundInfo,
      hasCompletedUpchieve101,
      hasUnlockedASubject,
      hasSelectedAvailability,
    },
    overrides
  )
}

export async function sendOnboardingReminderTwo(
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    categories: ['onboarding reminder two email'],
  }

  await sendEmail(
    email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.onboardingReminderTwoTemplate,
    {
      firstName: capitalize(firstName),
    },
    overrides
  )
}

export async function sendOnboardingReminderThree(
  email: string,
  firstName: string
): Promise<void> {
  const teamMemberEmail = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: teamMemberEmail,
    },
    categories: ['onboarding reminder three email'],
  }

  await sendEmail(
    email,
    teamMemberEmail,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.onboardingReminderThreeTemplate,
    {
      firstName: capitalize(firstName),
    },
    overrides
  )
}

export async function sendFailedFirstAttemptedQuiz(
  category: string,
  email: string,
  firstName: string
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.senders.support,
    },
    categories: ['failed first attempted quiz email'],
  }

  const templateToSend =
    category === TRAINING.UPCHIEVE_101
      ? config.sendgrid.failedFirstAttemptedTrainingTemplate
      : config.sendgrid.failedFirstAttemptedQuizTemplate

  await sendEmail(
    email,
    config.mail.senders.noreply,
    'The UPchieve Team',
    templateToSend,
    {
      firstName: capitalize(firstName),
      category: formatMultiWordSubject(category),
    },
    overrides
  )
}

export async function sendVolunteerQuickTips(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: config.mail.receivers.support,
    },
    categories: ['volunteer - quick tips'],
  }
  await sendEmail(
    email,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerQuickTipsTemplate,
    { firstName },
    overrides
  )
}

export async function sendPartnerVolunteerLowHoursSelected(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.receivers.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['partner volunteer - low hours'],
  }
  await sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.partnerVolunteerLowHoursSelectedTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerFirstSessionCongrats(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - first session congrats'],
  }
  await sendEmail(
    email,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerFirstSessionCongratsTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerTenSessionMilestone(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - ten session milestone'],
  }
  await sendEmail(
    email,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerTenSessionMilestoneTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerGentleWarning(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - gentle warning'],
  }
  await sendEmail(
    email,
    sender,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.volunteerGentleWarningTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerInactiveThirtyDays(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive thirty days'],
  }
  await sendEmail(
    email,
    sender,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.volunteerInactiveThirtyDaysTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerInactiveSixtyDays(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive sixty days'],
  }
  await sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveSixtyDaysTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerInactiveNinetyDays(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive ninety days'],
  }
  await sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveNinetyDaysTemplate,
    { firstName },
    overrides
  )
}

export async function sendVolunteerInactiveBlackoutOver(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive blackout over'],
  }
  await sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveBlackoutOverTemplate,
    { firstName },
    overrides
  )
}

export async function sendStudentReported(
  email: string,
  firstName: string,
  reportReason: string
): Promise<void> {
  let sender
  let from
  let template

  if (reportReason === SESSION_REPORT_REASON.STUDENT_RUDE) {
    sender = config.mail.senders.support
    from = 'The UPchieve Team'
    template = config.sendgrid.studentReportedRudeTemplate
  } else {
    sender = config.mail.senders.crisis
    from = 'Katy from UPchieve'
    template = config.sendgrid.studentReportedSafetyTemplate
  }

  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student - reported'],
  }

  await sendEmail(email, sender, from, template, { firstName }, overrides)
}

export async function sendCoachReported(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.support
  const from = 'The UPchieve Team'
  const template = config.sendgrid.studentReportedCoachDmTemplate
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['coach - reported'],
  }

  await sendEmail(email, sender, from, template, { firstName }, overrides)
}

export async function sendStudentAbsentWarning(
  email: string,
  firstName: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const from = config.mail.people.volunteerManager.firstName
  const template = config.sendgrid.studentAbsentWarningTemplate

  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student - absent warning'],
  }

  await sendEmail(email, sender, from, template, { firstName }, overrides)
}

export async function sendStudentAbsentVolunteerApology(
  firstName: string,
  email: string,
  volunteerFirstName: string,
  sessionSubject: string,
  sessionDate: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const from = config.mail.people.volunteerManager.firstName
  const template = config.sendgrid.studentAbsentVolunteerApologyTemplate

  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student - absent volunteer apology'],
  }

  await sendEmail(
    email,
    sender,
    from,
    template,
    {
      firstName,
      volunteerFirstName,
      sessionSubject,
      sessionDate,
    },
    overrides
  )
}

export async function sendStudentUnmatchedApology(
  firstName: string,
  email: string,
  sessionSubject: string,
  sessionDate: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const from = config.mail.people.volunteerManager.firstName
  const template = config.sendgrid.studentUnmatchedApologyTemplate

  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student - unmatched apology'],
  }

  await sendEmail(
    email,
    sender,
    from,
    template,
    { firstName, sessionSubject, sessionDate },
    overrides
  )
}

export async function sendVolunteerAbsentWarning(
  firstName: string,
  email: string,
  studentFirstName: string,
  sessionSubject: string,
  sessionDate: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const from = config.mail.people.volunteerManager.firstName
  const template = config.sendgrid.volunteerAbsentWarningTemplate

  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - absent warning'],
  }

  await sendEmail(
    email,
    sender,
    from,
    template,
    {
      firstName,
      studentFirstName,
      sessionSubject,
      sessionDate,
    },
    overrides
  )
}

export async function sendVolunteerAbsentStudentApology(
  firstName: string,
  email: string,
  studentFirstName: string,
  sessionSubject: string,
  sessionDate: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const from = config.mail.people.volunteerManager.firstName
  const template = config.sendgrid.volunteerAbsentStudentApologyTemplate

  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - absent student apology'],
  }

  await sendEmail(
    email,
    sender,
    from,
    template,
    {
      firstName,
      studentFirstName,
      sessionSubject,
      sessionDate,
    },
    overrides
  )
}

export async function sendOnlyLookingForAnswersWarning(
  firstName: string,
  email: string
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const from = config.mail.people.volunteerManager.firstName
  const template = config.sendgrid.studentOnlyLookingForAnswersTemplate
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student - only looking for answers'],
  }

  await sendEmail(email, sender, from, template, { firstName }, overrides)
}

export async function sendRosterStudentSetPasswordEmail(
  email: string,
  studentFirstName: string,
  token: string
) {
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }
  const url = `https://${config.client.host}/setpassword?token=${token}`

  await sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.rosterStudentSetPasswordTemplate,
    {
      firstName: studentFirstName,
      userEmail: email,
      resetLink: url,
    },
    overrides
  )
}

export async function sendReferralProgramEmail(
  email: string,
  studentFirstName: string,
  referralLink: string
) {
  await sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.referralProgramTemplate,
    {
      firstName: studentFirstName,
      referralLink,
    }
  )
}

export async function sendSessionRecapMessage(
  email: string,
  receiverFirstName: string,
  senderFirstName: string,
  sessionRecapLink: string,
  message: string
) {
  await sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.emailSessionRecapMessage,
    {
      receiverFirstName,
      senderFirstName,
      sessionRecapLink,
      message,
    }
  )
}

export async function createContact(userId: Ulid): Promise<any> {
  const user = await getUserToCreateSendGridContact(userId)
  const customFields = {
    [SG_CUSTOM_FIELDS.isBanned]: String(user.banned),
    [SG_CUSTOM_FIELDS.isTestUser]: String(user.testUser),
    [SG_CUSTOM_FIELDS.isVolunteer]: String(user.isVolunteer),
    [SG_CUSTOM_FIELDS.isAdmin]: String(user.isAdmin),
    [SG_CUSTOM_FIELDS.isDeactivated]: String(user.deactivated),
    [SG_CUSTOM_FIELDS.joined]: user.createdAt,
  }

  const contactListId = user.isVolunteer
    ? config.sendgrid.contactList.volunteers
    : config.sendgrid.contactList.students

  if (user.isVolunteer) {
    const volunteer = user
    customFields[SG_CUSTOM_FIELDS.passedUpchieve101] = String(
      volunteer.passedUpchieve101
    )

    if (volunteer.volunteerPartnerOrg) {
      customFields[SG_CUSTOM_FIELDS.volunteerPartnerOrg] =
        volunteer.volunteerPartnerOrg
      customFields[SG_CUSTOM_FIELDS.volunteerPartnerOrgDisplay] = (
        await getFullVolunteerPartnerOrgByKey(volunteer.volunteerPartnerOrg)
      ).key
    }
  } else {
    const student = user
    if (student.studentGradeLevel)
      customFields[SG_CUSTOM_FIELDS.studentGradeLevel] =
        student.studentGradeLevel
    if (student.studentPartnerOrg) {
      customFields[SG_CUSTOM_FIELDS.studentPartnerOrg] =
        student.studentPartnerOrg
      customFields[SG_CUSTOM_FIELDS.studentPartnerOrgDisplay] = (
        await getFullStudentPartnerOrgByKey(student.studentPartnerOrg)
      ).key
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
  }
  return await putContact(JSON.stringify(data))
}

export async function searchContact(email: string): Promise<any> {
  const response = await getContact(email)
  const {
    data: { result },
  } = response
  const [contact] = result
  return contact
}

export async function deleteContact(contactId: string): Promise<any> {
  return await sgDeleteContact(contactId)
}
