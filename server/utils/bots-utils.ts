import { MessageForFrontend, UserSessionsWithMessages } from '../models/Session'
import moment from 'moment'

export function formatTranscriptMessage(
  message: MessageForFrontend,
  userType: string
): string {
  return `${moment(message.createdAt).format('hh:mm:ss')} ${userType}: ${
    message.contents
  }\n`
}

export function formatScorecasterSession(
  session: UserSessionsWithMessages
): string {
  let transcript = ''
  for (const message of session.messages) {
    const userType = message.user === session.studentId ? 'Student' : 'Tutor'
    transcript += formatTranscriptMessage(message, userType)
  }

  return `
    Session:
    ${transcript}

    Editor:
    ${session.quillDoc}
    `
}

export function formatScorecasterSessionsToBotPrompt(
  sessions: UserSessionsWithMessages[]
): string {
  return sessions.map(formatScorecasterSession).join('\n')
}
