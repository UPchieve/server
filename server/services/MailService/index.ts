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
import {
  UserEmailInfo,
  getUserToCreateSendGridContact,
} from '../../models/User'
import { VolunteerContactInfo, UnsentReference } from '../../models/Volunteer'
import { getFullVolunteerPartnerOrgByKey } from '../../models/VolunteerPartnerOrg'
import { getFullStudentPartnerOrgByKey } from '../../models/StudentPartnerOrg'

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
}

class SendEmail {
  static async toUpchieveStaff(
    toEmail: string,
    fromEmail: string,
    fromName: string,
    templateId: string,
    dynamicData: any,
    overrides: any = {}
  ) {
    await this.sendEmail(
      toEmail,
      fromEmail,
      fromName,
      templateId,
      dynamicData,
      overrides
    )
  }

  static async toUser(
    user: UserEmailInfo,
    fromEmail: string,
    fromName: string,
    templateId: string,
    dynamicData: any,
    overrides: any = {}
  ): Promise<void> {
    const toEmail = user.proxyEmail ?? user.email
    if (user.proxyEmail) {
      overrides.cc = user.email
    }
    await this.sendEmail(
      toEmail,
      fromEmail,
      fromName,
      templateId,
      dynamicData,
      overrides
    )
  }

  static async toReference(
    toEmail: string,
    fromEmail: string,
    fromName: string,
    templateId: string,
    dynamicData: any,
    overrides: any = {}
  ): Promise<void> {
    await this.sendEmail(
      toEmail,
      fromEmail,
      fromName,
      templateId,
      dynamicData,
      overrides
    )
  }

  // TODO: refactor sendEmail to better handle overrides with custom unsubscribe groups
  //        and preferences and bypassing those unsubscribe groups
  private static async sendEmail(
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
}

// TODO: use this in other MailService methods
function buildLink(path: string): string {
  const { host } = config.client
  const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}/${path}`
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

  await SendEmail.toUpchieveStaff(
    config.mail.receivers.contact,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.contactTemplate,
    requestData,
    overrides
  )
}

export async function sendReset(
  user: UserEmailInfo,
  sendToMobile: boolean,
  token: string
): Promise<void> {
  let url: string
  if (sendToMobile) {
    url = `com.upchieve.app://setpassword/${token}`
  } else {
    url = `https://${config.client.host}/setpassword?token=${token}`
  }
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }

  await SendEmail.toUser(
    user,
    config.mail.senders.noreply,
    'UPchieve',
    config.sendgrid.resetTemplate,
    {
      userEmail: user.email,
      resetLink: url,
    },
    overrides
  )
}

export async function sendOpenVolunteerWelcomeEmail(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    categories: ['volunteer welcome email'],
  }

  await SendEmail.toUser(
    user,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.openVolunteerWelcomeTemplate,
    { volunteerName: user.firstName },
    overrides
  )
}

export async function sendPartnerVolunteerWelcomeEmail(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    categories: ['partner volunteer welcome email'],
  }

  await SendEmail.toUser(
    user,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.partnerVolunteerWelcomeTemplate,
    { volunteerName: user.firstName },
    overrides
  )
}

export async function sendStudentOnboardingWelcomeEmail(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 1 - Welcome'],
  }
  await SendEmail.toUser(
    user,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingWelcomeTemplate,
    { firstName: user.firstName },
    overrides
  )
}

export async function sendStudentOnboardingHowItWorks(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 2 - How It Works'],
  }

  await SendEmail.toUser(
    user,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingHowItWorksTemplate,
    { firstName: user.firstName },
    overrides
  )
}

export async function sendMeetOurVolunteers(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 3 - Meet Our Volunteers'],
  }

  await SendEmail.toUser(
    user,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.meetOurVolunteersTemplate,
    { firstName: user.firstName },
    overrides
  )
}

export async function sendStudentOnboardingMission(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 4 - Mission'],
  }

  await SendEmail.toUser(
    user,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingMissionTemplate,
    { firstName: user.firstName },
    overrides
  )
}

export async function sendStudentOnboardingSurvey(
  user: UserEmailInfo
): Promise<void> {
  const overrides = {
    reply_to: {
      email: config.mail.receivers.students,
    },
    categories: ['Student Onboarding Email 5 - Survey'],
  }
  await SendEmail.toUser(
    user,
    config.mail.senders.students,
    'UPchieve Student Success Team',
    config.sendgrid.studentOnboardingSurveyTemplate,
    { firstName: user.firstName },
    overrides
  )
}

export async function sendStudentFirstSessionCongrats(
  user: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.studentOutreachManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['student cultivation email - first session congrats'],
  }
  await SendEmail.toUser(
    user,
    sender,
    `${config.mail.people.studentOutreachManager.firstName} ${config.mail.people.studentOutreachManager.lastName}`,
    config.sendgrid.studentFirstSessionCongratsTemplate,
    { firstName: user.firstName },
    overrides
  )
}

export async function sendReportedSessionAlert(
  sessionId: Ulid,
  reportedByEmail: string,
  reportReason: string,
  reportMessage: string
): Promise<void> {
  const sessionAdminLink = buildLink(`admin/sessions/${sessionId}`)
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }
  await SendEmail.toUpchieveStaff(
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
    referenceUrl: buildLink(`reference-form/${reference.id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
  }
  const overrides = {
    categories: ['reference form email'],
  }

  await SendEmail.toReference(
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
    referenceUrl: buildLink(`reference-form/${reference.id}`),
    referenceName: reference.firstName,
    volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
  }
  const overrides = {
    categories: ['reference form email'],
  }

  await SendEmail.toReference(
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

  await SendEmail.toUser(
    volunteer,
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

  await SendEmail.toUser(
    volunteer,
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
  const userAdminLink = buildLink(`admin/users/${userId}`)
  const sessionAdminLink = buildLink(`admin/sessions/${sessionId}`)
  const overrides = {
    mail_settings: { bypass_list_management: { enable: true } },
  }
  await SendEmail.toUpchieveStaff(
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

  await SendEmail.toUser(
    volunteer,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.rejectedPhotoSubmissionTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

// TODO: test this thoroughly
export async function sendReferenceFollowup(
  reference: UnsentReference,
  volunteer: Omit<VolunteerContactInfo, 'proxyEmail'>
): Promise<void> {
  const volunteerFirstName = capitalize(volunteer.firstName)
  const volunteerLastName = capitalize(volunteer.lastName)
  const emailData = {
    referenceUrl: buildLink(`reference-form/${reference.id}`),
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

  await SendEmail.toReference(
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

  await SendEmail.toUser(
    volunteer,
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

  await SendEmail.toUser(
    volunteer,
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
  volunteer: UserEmailInfo,
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
      groups_to_display: [
        config.sendgrid.unsubscribeGroup.newsletter,
        // TODO: for all volunteer recipient emails, show volunteer summary email preference in their unsubscribe preferences
        config.sendgrid.unsubscribeGroup.volunteerSummary,
      ],
    },
    categories: ['weekly hour summary email'],
  }

  const weeklyTemplate = customOrg
    ? config.sendgrid.customWeeklyHourSummaryEmailTemplate
    : config.sendgrid.weeklyHourSummaryEmailTemplate

  const introTemplate = customOrg
    ? config.sendgrid.customWeeklyHourSummaryIntroEmailTemplate
    : config.sendgrid.weeklyHourSummaryIntroEmailTemplate

  await SendEmail.toUser(
    volunteer,
    config.mail.senders.support,
    'UPchieve',
    sentHourSummaryIntroEmail ? weeklyTemplate : introTemplate,
    {
      firstName: capitalize(volunteer.firstName),
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
  volunteer: UserEmailInfo,
  fromDate: string,
  toDate: string
): Promise<void> {
  const overrides = {
    categories: ['weekly hour summary apology email'],
  }

  await SendEmail.toUser(
    volunteer,
    config.mail.senders.support,
    'UPchieve',
    config.sendgrid.weeklyHourSummaryApologyEmailTemplate,
    {
      firstName: capitalize(volunteer.firstName),
      fromDate,
      toDate,
    },
    overrides
  )
}

export async function sendOnboardingReminderOne(
  volunteer: UserEmailInfo,
  hasCompletedBackgroundInfo: boolean,
  hasCompletedUpchieve101: boolean,
  hasUnlockedASubject: boolean,
  hasSelectedAvailability: boolean
): Promise<void> {
  const overrides = {
    categories: ['onboarding reminder one email'],
  }

  await SendEmail.toUser(
    volunteer,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.onboardingReminderOneTemplate,
    {
      firstName: capitalize(volunteer.firstName),
      hasCompletedBackgroundInfo,
      hasCompletedUpchieve101,
      hasUnlockedASubject,
      hasSelectedAvailability,
    },
    overrides
  )
}

export async function sendOnboardingReminderTwo(
  volunteer: UserEmailInfo
): Promise<void> {
  const overrides = {
    categories: ['onboarding reminder two email'],
  }

  await SendEmail.toUser(
    volunteer,
    config.mail.senders.support,
    'The UPchieve Team',
    config.sendgrid.onboardingReminderTwoTemplate,
    {
      firstName: capitalize(volunteer.firstName),
    },
    overrides
  )
}

export async function sendOnboardingReminderThree(
  volunteer: UserEmailInfo
): Promise<void> {
  const teamMemberEmail = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: teamMemberEmail,
    },
    categories: ['onboarding reminder three email'],
  }

  await SendEmail.toUser(
    volunteer,
    teamMemberEmail,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.onboardingReminderThreeTemplate,
    {
      firstName: capitalize(volunteer.firstName),
    },
    overrides
  )
}

export async function sendFailedFirstAttemptedQuiz(
  category: string,
  volunteer: UserEmailInfo
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

  await SendEmail.toUser(
    volunteer,
    config.mail.senders.noreply,
    'The UPchieve Team',
    templateToSend,
    {
      firstName: capitalize(volunteer.firstName),
      category: formatMultiWordSubject(category),
    },
    overrides
  )
}

export async function sendVolunteerQuickTips(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: config.mail.receivers.support,
    },
    categories: ['volunteer - quick tips'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerQuickTipsTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendPartnerVolunteerLowHoursSelected(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.receivers.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['partner volunteer - low hours'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    'The UPchieve Team',
    config.sendgrid.partnerVolunteerLowHoursSelectedTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerFirstSessionCongrats(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - first session congrats'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerFirstSessionCongratsTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerTenSessionMilestone(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - ten session milestone'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    `${config.mail.people.volunteerManager.firstName} ${config.mail.people.volunteerManager.lastName}`,
    config.sendgrid.volunteerTenSessionMilestoneTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerGentleWarning(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - gentle warning'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.volunteerGentleWarningTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerInactiveThirtyDays(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.volunteerManager
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive thirty days'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    config.mail.people.volunteerManager.firstName,
    config.sendgrid.volunteerInactiveThirtyDaysTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerInactiveSixtyDays(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive sixty days'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveSixtyDaysTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerInactiveNinetyDays(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive ninety days'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveNinetyDaysTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendVolunteerInactiveBlackoutOver(
  volunteer: UserEmailInfo
): Promise<void> {
  const sender = config.mail.senders.support
  const overrides = {
    reply_to: {
      email: sender,
    },
    categories: ['volunteer - inactive blackout over'],
  }
  await SendEmail.toUser(
    volunteer,
    sender,
    'The UPchieve Team',
    config.sendgrid.volunteerInactiveBlackoutOverTemplate,
    { firstName: volunteer.firstName },
    overrides
  )
}

export async function sendStudentReported(
  student: UserEmailInfo,
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

  await SendEmail.toUser(
    student,
    sender,
    from,
    template,
    { firstName: student.firstName },
    overrides
  )
}

export async function sendStudentAbsentWarning(
  student: UserEmailInfo
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

  await SendEmail.toUser(
    student,
    sender,
    from,
    template,
    { firstName: student.firstName },
    overrides
  )
}

export async function sendStudentAbsentVolunteerApology(
  student: UserEmailInfo,
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

  await SendEmail.toUser(
    student,
    sender,
    from,
    template,
    {
      firstName: student.firstName,
      volunteerFirstName,
      sessionSubject,
      sessionDate,
    },
    overrides
  )
}

export async function sendStudentUnmatchedApology(
  student: UserEmailInfo,
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

  await SendEmail.toUser(
    student,
    sender,
    from,
    template,
    { firstName: student.firstName, sessionSubject, sessionDate },
    overrides
  )
}

export async function sendVolunteerAbsentWarning(
  volunteer: UserEmailInfo,
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

  await SendEmail.toUser(
    volunteer,
    sender,
    from,
    template,
    {
      firstName: volunteer.firstName,
      studentFirstName,
      sessionSubject,
      sessionDate,
    },
    overrides
  )
}

export async function sendVolunteerAbsentStudentApology(
  volunteer: UserEmailInfo,
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

  await SendEmail.toUser(
    volunteer,
    sender,
    from,
    template,
    {
      firstName: volunteer,
      studentFirstName,
      sessionSubject,
      sessionDate,
    },
    overrides
  )
}

export async function sendOnlyLookingForAnswersWarning(
  student: UserEmailInfo
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

  await SendEmail.toUser(
    student,
    sender,
    from,
    template,
    { firstName: student.firstName },
    overrides
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
