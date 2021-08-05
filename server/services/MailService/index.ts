import config from '../../config'
import sgMail from '@sendgrid/mail'
import axios from 'axios'
import { capitalize } from 'lodash'
import {
  volunteerPartnerManifests,
  studentPartnerManifests
} from '../../partnerManifests'
import formatMultiWordSubject from '../../utils/format-multi-word-subject'
import { SESSION_REPORT_REASON } from '../../constants'
import { Reference, Volunteer } from '../../models/Volunteer'
import { Student } from '../../models/Student'
import { User } from '../../models/User'

sgMail.setApiKey(config.sendgrid.apiKey)

const options = {
  headers: {
    Authorization: `Bearer ${config.sendgrid.apiKey}`,
    'content-type': 'application/json'
  }
}

function putContact(data: {}) {
  return axios.put('https://api.sendgrid.com/v3/marketing/contacts', data, options)
}

function getContact(email: string) {
  return axios.post(
    'https://api.sendgrid.com/v3/marketing/contacts/search',
    {query: `email = '${email}'`},
    options
  )
}

function sgDeleteContact(contactId: string) {
  return axios.delete(
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
  passedUpchieve101: 'e17_T'
}

// @todo: refactor sendEmail to better handle overrides with custom unsubscribe groups
//        and preferences and bypassing those unsubscribe groups
function sendEmail(
  toEmail: string,
  fromEmail: string,
  fromName: string,
  templateId: string,
  dynamicData: {},
  callback: Function,
  overrides: {} = {}
) {
  const msg = {
    to: toEmail,
    from: {
      email: fromEmail,
      name: fromName
    },
    reply_to: {
      email: config.mail.receivers.support
    },
    templateId: templateId,
    dynamic_template_data: dynamicData,
    ...overrides
  }

  return sgMail.send(msg, false, callback)
}

// @todo: use this in other MailService methods
function buildLink(path: string) {
  const { host } = config.client
  const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}/${path}`
}

function getFormattedHourSummaryTime(time: number) {
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


export function sendVerification(email: string, token: string) {
  const url = `http://${config.client.host}/action/verify/${token}`

  const overrides = {
    categories: ['account verification'],
    mail_settings: { bypass_list_management: { enable: true } }
  }

  sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.verifyTemplate,
    {
      userEmail: email,
      verifyLink: url
    },
    () => {},
    overrides
  )
}

export function sendContactForm(requestData: any, callback: Function) {
  const overrides = {
    // ensure staff members always get contact form submissions
    mail_settings: { bypass_list_management: { enable: true } }
  }

  sendEmail(
    config.mail.receivers.contact,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.contactTemplate,
    requestData,
    callback,
    overrides
  )
}

export function sendReset(email: string, token: string, callback: Function) {
  const url = `http://${config.client.host}/setpassword/${token}`
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } }
  }

  sendEmail(
    email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.resetTemplate,
    {
      userEmail: email,
      resetLink: url
    },
    callback,
    overrides
  )
}

export function sendOpenVolunteerWelcomeEmail(email: string, volunteerName: string) {
  const overrides = {
    categories: ['volunteer welcome email']
  }

  sendEmail(
    email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.openVolunteerWelcomeTemplate,
    { volunteerName },
    () => {},
    overrides
  )
}

export function sendPartnerVolunteerWelcomeEmail(email: string, volunteerName: string) {
  const overrides = {
    categories: ['partner volunteer welcome email']
  }

  sendEmail(
    email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.partnerVolunteerWelcomeTemplate,
    { volunteerName },
    () => {},
    overrides
  )
}

export function sendStudentWelcomeEmail(email: string, firstName: string) {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students
    },
    categories: ['student welcome email']
  }
  sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentWelcomeTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendStudentUseCases(email: string, firstName: string) {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students
    },
    categories: ['student welcome email - student use cases']
  }

  sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentUseCasesTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendMeetOurVolunteers(email: string, firstName: string) {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students
    },
    categories: ['student welcome email - meet our volunteers']
  }

  sendEmail(
    email,
    config.mail.senders.volunteerManager,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.meetOurVolunteersTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendIndependentLearning(email: string, firstName: string) {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students
    },
    categories: ['student welcome email - independent learning']
  }

  sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentIndependentLearningTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendStudentGoalSetting(email: string, firstName: string) {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students
    },
    categories: ['student welcome email - goal setting']
  }
  sendEmail(
    email,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentGoalSettingTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendStudentFirstSessionCongrats(email: string, firstName: string) {
  const sender = config.mail.senders.studentOutreachManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['student cultivation email - first session congrats']
  }
  sendEmail(
    email,
    sender,
    `${config.mail.people.studentOutreachManager.firstName} ${config.mail.people.studentOutreachManager.lastName}`,
    config.sendgrid.studentFirstSessionCongratsTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendReportedSessionAlert(
  sessionId: string,
  reportedByEmail: string,
  reportReason: string,
  reportMessage: string) {
  const sessionAdminLink = buildLink(`admin/sessions/${sessionId}`)
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } }
  }
  return sendEmail(
    config.mail.receivers.staff,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.reportedSessionAlertTemplate,
    {
      sessionId,
      sessionAdminLink,
      reportedByEmail,
      reportReason,
      reportMessage
    },
    () => {},
    overrides
  )
}

export function sendReferenceForm(reference: Reference, volunteer: Volunteer) {
  const emailData = {
    referenceUrl: buildLink(`reference-form/${reference._id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteer.firstname} ${volunteer.lastname}`
  }
  const overrides = {
    categories: ['reference form email']
  }

  return sendEmail(
    reference.email,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.referenceFormTemplate,
    emailData,
    () => {},
    overrides
  )
}

export function sendApprovedNotOnboardedEmail(volunteer: Volunteer) {
  const overrides = {
    categories: ['approved not onboarded email']
  }

  return sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.approvedNotOnboardedTemplate,
    { volunteerName: volunteer.firstname },
    () => {},
    overrides
  )
}

export function sendReadyToCoachEmail(volunteer: Volunteer) {
  const readyToCoachTemplate = volunteer.volunteerPartnerOrg
    ? volunteer.volunteerPartnerOrg === config.customVolunteerPartnerOrg
      ? config.sendgrid.customPartnerReadyToCoachTemplate
      : config.sendgrid.partnerReadyToCoachTemplate
    : config.sendgrid.openReadyToCoachTemplate
  const overrides = {
    categories: ['ready to coach email']
  }

  return sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'UPchieve',
    readyToCoachTemplate,
    { volunteerName: volunteer.firstname },
    () => {},
    overrides
  )
}

export function sendBannedUserAlert(userId: string, banReason: string, sessionId: string) {
  const userAdminLink = buildLink(`admin/users/${userId}`)
  const sessionAdminLink = buildLink(`admin/sessions/${sessionId}`)
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } }
  }
  return sendEmail(
    config.mail.receivers.staff,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.bannedUserAlertTemplate,
    {
      userId,
      banReason,
      sessionId,
      userAdminLink,
      sessionAdminLink
    },
    () => {},
    overrides
  )
}

export function sendRejectedPhotoSubmission(volunteer: Volunteer) {
  const overrides = {
    categories: ['photo rejected email']
  }

  return sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.rejectedPhotoSubmissionTemplate,
    { firstName: volunteer.firstname },
    () => {},
    overrides
  )
}

export function sendRejectedReference(reference: Reference, volunteer: Volunteer) {
  const firstName = capitalize(volunteer.firstname)
  const emailData = {
    referenceName: `${capitalize(reference.firstName)} ${capitalize(
      reference.lastName
    )}`,
    firstName
  }
  const overrides = {
    categories: ['reference rejected email']
  }

  return sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.rejectedReferenceTemplate,
    emailData,
    () => {},
    overrides
  )
}

export function sendReferenceFollowup(reference: Reference, volunteer: Volunteer) {
  const volunteerFirstName = capitalize(volunteer.firstname)
  const volunteerLastName = capitalize(volunteer.lastname)
  const emailData = {
    referenceUrl: buildLink(`reference-form/${reference._id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteerFirstName} ${volunteerLastName}`,
    volunteerFirstName
  }
  const overrides = {
    reply_to: {
      email: config.mail.receivers.recruitment
    },
    categories: ['reference followup email']
  }

  return sendEmail(
    reference.email,
    config.mail.senders.recruitment,
    `${config.mail.people.volunteerManager.firstName} at UPchieve`,
    config.sendgrid.referenceFollowupTemplate,
    emailData,
    () => {},
    overrides
  )
}

export function sendWaitingOnReferences(volunteer: Volunteer) {
  const overrides = {
    categories: ['waiting on references email']
  }

  return sendEmail(
    volunteer.email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.waitingOnReferencesTemplate,
    {
      firstName: capitalize(volunteer.firstname)
    },
    () => {},
    overrides
  )
}

export function sendNiceToMeetYou(volunteer: Volunteer) {
  const overrides = {
    reply_to: {
      email: config.mail.senders.volunteerManager
    },
    categories: ['nice to meet you email']
  }

  return sendEmail(
    volunteer.email,
    config.mail.senders.volunteerManager,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.niceToMeetYouTemplate,
    {
      firstName: capitalize(volunteer.firstname)
    },
    () => {},
    overrides
  )
}

export function sendHourSummaryEmail(
  firstName: string,
  email: string,
  sentHourSummaryIntroEmail: string,
  fromDate: string,
  toDate: string,
  totalCoachingHours: number,
  totalElapsedAvailability: number,
  totalQuizzesPassed: number,
  totalVolunteerHours: number,
  customOrg: boolean = false
) {
  const formattedCoachingHours = getFormattedHourSummaryTime(
    totalCoachingHours
  )
  const formattedVolunteerHours = getFormattedHourSummaryTime(
    totalVolunteerHours
  )

  const overrides = {
    asm: {
      group_id: config.sendgrid.unsubscribeGroup.volunteerSummary,
      groups_to_display: [
        config.sendgrid.unsubscribeGroup.newsletter,
        // @todo: for all volunteer recipient emails, show volunteer summary email preference in their unsubscribe preferences
        config.sendgrid.unsubscribeGroup.volunteerSummary
      ]
    },
    categories: ['weekly hour summary email']
  }

  const weeklyTemplate = customOrg
    ? config.sendgrid.customWeeklyHourSummaryEmailTemplate
    : config.sendgrid.weeklyHourSummaryEmailTemplate

  const introTemplate = customOrg
    ? config.sendgrid.customWeeklyHourSummaryIntroEmailTemplate
    : config.sendgrid.weeklyHourSummaryIntroEmailTemplate

  return sendEmail(
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
      totalVolunteerTime: formattedVolunteerHours
    },
    () => {},
    overrides
  )
}

export function sendOnboardingReminderOne(
  firstName: string,
  email: string,
  hasCompletedBackgroundInfo: string,
  hasCompletedUpchieve101: boolean,
  hasUnlockedASubject: boolean,
  hasSelectedAvailability: Date
) {
  const overrides = {
    categories: ['onboarding reminder one email']
  }

  return sendEmail(
    email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.onboardingReminderOneTemplate,
    {
      firstName: capitalize(firstName),
      hasCompletedBackgroundInfo,
      hasCompletedUpchieve101,
      hasUnlockedASubject,
      hasSelectedAvailability
    },
    () => {},
    overrides
  )
}

export function sendOnboardingReminderTwo(email: string, firstName: string) {
  const overrides = {
    categories: ['onboarding reminder two email']
  }

  return sendEmail(
    email,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.onboardingReminderTwoTemplate,
    {
      firstName: capitalize(firstName)
    },
    () => {},
    overrides
  )
}

export function sendOnboardingReminderThree(email: string, firstName: string) {
  const teamMemberEmail = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: teamMemberEmail
    },
    categories: ['onboarding reminder three email']
  }

  return sendEmail(
    email,
    teamMemberEmail,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.onboardingReminderThreeTemplate,
    {
      firstName: capitalize(firstName)
    },
    () => {},
    overrides
  )
}

export function sendFailedFirstAttemptedQuiz(email: string, firstName: string, category: string) {
  const overrides = {
    reply_to: {
      email: config.mail.senders.support
    },
    categories: ['failed first attempted quiz email']
  }

  return sendEmail(
    email,
    config.mail.senders.noreply,
    'The UPchieve Team',
    config.sendgrid.failedFirstAttemptedQuizTemplate,
    {
      firstName: capitalize(firstName),
      category: formatMultiWordSubject(category)
    },
    () => {},
    overrides
  )
}

export function sendVolunteerQuickTips(email: string, firstName: string) {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: config.mail.receivers.support
    },
    categories: ['volunteer - quick tips']
  }
  sendEmail(
    email,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerQuickTipsTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendPartnerVolunteerOnlyCollegeCerts(email: string, firstName: string) {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['partner volunteer - only college certs']
  }
  sendEmail(
    email,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.partnerVolunteerOnlyCollegeCertsTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendPartnerVolunteerLowHoursSelected(email: string, firstName: string) {
  const sender = config.mail.receivers.support
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['partner volunteer - low hours']
  }
  sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.partnerVolunteerLowHoursSelectedTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendVolunteerFirstSessionCongrats(email: string, firstName: string) {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['volunteer - first session congrats']
  }
  sendEmail(
    email,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerFirstSessionCongratsTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendPartnerVolunteerReferACoworker(
  email: string,
  firstName: string,
  partnerOrg: string,
  partnerOrgDisplay: string
) {
  const partnerOrgSignupLink = buildLink(`signup/volunteer/${partnerOrg}`)
  const sender = config.mail.senders.corporatePartnershipsManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['partner volunteer - refer a coworker']
  }
  sendEmail(
    email,
    sender,
    `${config.mail.people.corporatePartnershipsManager.firstName} ${config.mail.people.corporatePartnershipsManager.lastName}`,
    config.sendgrid.partnerVolunteerReferACoworkerTemplate,
    { firstName, partnerOrgSignupLink, partnerOrgDisplay },
    () => {},
    overrides
  )
}

export function sendPartnerVolunteerTenSessionMilestone(email: string, firstName: string) {
  const sender = config.mail.senders.corporatePartnershipsManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['partner volunteer - ten session milestone']
  }
  sendEmail(
    email,
    sender,
    `${config.mail.people.corporatePartnershipsManager.firstName} ${config.mail.people.corporatePartnershipsManager.lastName}`,
    config.sendgrid.partnerVolunteerTenSessionMilestoneTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendVolunteerGentleWarning(email: string, firstName: string) {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['volunteer - gentle warning']
  }
  sendEmail(
    email,
    sender,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.volunteerGentleWarningTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendVolunteerInactiveThirtyDays(email: string, firstName: string) {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['volunteer - inactive thirty days']
  }
  sendEmail(
    email,
    sender,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.volunteerInactiveThirtyDaysTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendVolunteerInactiveSixtyDays(email: string, firstName: string) {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['volunteer - inactive sixty days']
  }
  sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveSixtyDaysTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendVolunteerInactiveNinetyDays(email: string, firstName: string) {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender
    },
    categories: ['volunteer - inactive ninety days']
  }
  sendEmail(
    email,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveNinetyDaysTemplate,
    { firstName },
    () => {},
    overrides
  )
}

export function sendStudentReported(email: string, firstName: string, reportReason: string) {
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
      email: sender
    },
    categories: ['student - reported']
  }

  return sendEmail(
    email,
    sender,
    from,
    template,
    { firstName },
    () => {},
    overrides
  )
}

export async function createContact(user: User|Student|Volunteer)  {
  const customFields = {
    [SG_CUSTOM_FIELDS.isBanned]: String(user.isBanned),
    [SG_CUSTOM_FIELDS.isTestUser]: String(user.isTestUser),
    [SG_CUSTOM_FIELDS.isVolunteer]: String(user.isVolunteer),
    [SG_CUSTOM_FIELDS.isAdmin]: String(user.isAdmin),
    [SG_CUSTOM_FIELDS.isFakeUser]: String(user.isFakeUser),
    [SG_CUSTOM_FIELDS.isDeactivated]: String(user.isDeactivated),
    [SG_CUSTOM_FIELDS.joined]: user.createdAt
  }

  const contactListId = user.isVolunteer
    ? config.sendgrid.contactList.volunteers
    : config.sendgrid.contactList.students

  if (user.isVolunteer) {
    if ("certifications" in user) {
      customFields[SG_CUSTOM_FIELDS.passedUpchieve101] = String(
        user.certifications.upchieve101.passed
      )
    }
  }

  if (user.isVolunteer) {
    if ("volunteerPartnerOrg" in user && user.volunteerPartnerOrg) {
      customFields[SG_CUSTOM_FIELDS.volunteerPartnerOrg] =
        user.volunteerPartnerOrg
      customFields[SG_CUSTOM_FIELDS.volunteerPartnerOrgDisplay] =
        volunteerPartnerManifests[user.volunteerPartnerOrg].name
    }
  }

  if (!user.isVolunteer) {
    if ("studentPartnerOrg" in user && user.studentPartnerOrg) {
      customFields[SG_CUSTOM_FIELDS.studentPartnerOrg] = user.studentPartnerOrg
      customFields[SG_CUSTOM_FIELDS.studentPartnerOrgDisplay] =
        studentPartnerManifests[user.studentPartnerOrg].name
    }
  }

  const data = {
    list_ids: [contactListId],
    contacts: [
      {
        first_name: user.firstname,
        last_name: user.lastname,
        email: user.email,
        custom_fields: customFields
      }
    ]
  }
  return putContact(JSON.stringify(data))
}

export async function searchContact(email: string) {
  const response = await getContact(email)
  const {
    data: { result }
  } = response
  const [contact] = result
  return contact
}

export function deleteContact(contactId: string) {
  return sgDeleteContact(contactId)
}

