import {
  wrapInsert,
  NameToId,
  getDbUlid,
  ASSISTMENTS_STUDENT_ID,
} from '../utils'
import * as pgQueries from './pg.queries'
import moment from 'moment'
import faker from 'faker'

const QUILL = `{"ops":[{"attributes":{"background":"#ff9900","color":"#000000"},"insert":"This summary response is about the article “Living With Less. A Lot Less” written by Graham Hill."},{"attributes":{"color":"#e60000"},"insert":"The article \"Living with Less. A Lot Less\" by Garaham Hill, emphasized the point that"},{"attributes":{"background":"transparent","color":"#000000"},"insert":" money and items don’t bring great happiness. Money is thrown out to buy enormous houses and new gadgets "},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"like "},{"attributes":{"background":"transparent","color":"#000000"},"insert":"having money and things others want is the end goal. After reading Hill’s article about how items are not an indication of happiness, I concluded that his views support my belief that happiness comes from memories "},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"(memories of what?) "},{"attributes":{"background":"transparent","color":"#000000"},"insert":"and not items."},{"insert":"\n\t"},{"attributes":{"background":"#ff9900","color":"#000000"},"insert":"In the article “Living With Less. A Lot Less,” Graham Hill believes that items are not an indication of happiness"},{"attributes":{"background":"transparent","color":"#000000"},"insert":". "},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"(This is repetitive, you already used this in your intro) Throughout the article, "},{"attributes":{"background":"transparent","color":"#000000"},"insert":"Hill "},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"states that he"},{"attributes":{"background":"transparent","color":"#000000"},"insert":" believes that joy comes from memories, relationships, and experiences."},{"attributes":{"background":"#ff9900","color":"#000000"},"insert":" “Somehow this stuff ended up running my life” (par.3). “It didn’t take long before I started to wonder why my theoretically upgraded life didn’t feel any better and why I felt more anxious than before” (par.10)"},{"attributes":{"background":"transparent","color":"#000000"},"insert":"."},{"attributes":{"background":"#ff9900","color":"#000000"},"insert":" “The things I consumed ended up consuming me (par.3). Soon I was numb to it all (par.10). Hill believes that items and electronics are a gateway to stress and wasting money and more stress. "},{"insert":"\n"},{"attributes":{"background":"#ff9900","color":"#000000"},"insert":"\tThis article proves my thoughts that happiness comes from memories and not items. Hill states that “there isn’t any indication that any of these things makes anyone happier; in fact, it seems the reverse may be true” (par.5.)"},{"attributes":{"background":"transparent","color":"#000000"},"insert":" "},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"These quotes are just thrown in with little context and no elaboration. Use them as information to build off of, not your entire essay. Use one quote, reflect and elaborate on it and then use another, stacking them on top of each other one after another d ess'thow any of your own reflection. "},{"attributes":{"background":"transparent","color":"#000000"},"insert":"If "},{"attributes":{"background":"#ff9900","color":"#000000"},"insert":"you don’t have money to buy new things you aren’t happy. I believe that is not true concerning money. Y"},{"attributes":{"background":"transparent","color":"#000000"},"insert":"e"},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"(consider rewording, it is a little confusing as written) "},{"attributes":{"background":"transparent","color":"#000000"},"insert":"s, money is a great thing to have because, without it, many people struggle. Mo"},{"attributes":{"background":"#ff9900","color":"#000000"},"insert":"ney is not happiness; it is the memories with the people you love. M"},{"attributes":{"background":"transparent","color":"#000000"},"insert":"o"},{"attributes":{"background":"transparent","color":"#e60000"},"insert":"(The way this is worded makes it out to be that money is the m woiiesth family which does not make sense, try stating it in a way that makes the reader know what you are trying to say) "},{"attributes":{"background":"transparent","color":"#000000"},"insert":"n"},{"insert":", also use a comma here not a semicolon","attributes":{"background":"transparent","color":"#e60000"}},{"insert":"ey can come and go, but memories stay with you forever. I feel that's where many people struggle because they buy more than the bare minimum. ","attributes":{"background":"transparent","color":"#000000"}},{"insert":"\n"},{"attributes":{"background":"transparent","color":"#000000"},"insert":"\tI would recommend this article to anyone wondering how much money has control of them. I like to see people change their lifestyle and priorities, so suggesting this article, in my eyes, could help someone possibly gain a better relationship with a loved one. My family agrees with Hill’s point that money isn’t an indication of happiness; it is time you spend with someone. This article will help me prevent making these mistakes because I can see where they can lead someone in life. This article is a wake-up call to show that I don’t want to make this mistake. I hope everyone considers their choices in life and revises them for the better. "},{"insert":"\n\n\n"},{"retain":4},{"insert":"\n"},{"insert":"You talk a lot about \"memories\" and how they are \"good\" but it is not specific. Memories can be bad, good, stressful, or happy. Instead of \"memories\" maybe talk about what makes up good experiences. What makes those memories good? Family? Stress? Work? Things? Just saying \"memories\" insinuates living in the past, does th","attributes":{"color":"#0066cc"}},{"retain":1,"attributes":{"header":2}},{"insert":"t mean that the present or future cant make us happy? You have a good starting point but the second paragraph needs to be elaborated on there is little of your own reflection in it and just using quotes one after another means it is not your own r flectoonf the piece, you are just restating what the author already said. ","attributes":{"color":"#0066cc"}},{"retain":2},{"insert":"Just make those minor tweaks and you should be great! ","attributes":{"color":"#0066cc"}}]}`

type Session = {
  id: string
  studentId: string
  volunteerId: string | null
  subjectId: number
  hasWhiteboardDoc: boolean
  quillDoc: string | null
  volunteerJoinedAt: Date | null
  endedAt: Date
  endedByRoleId: number
  reviewed: boolean
  toReview: boolean
  studentBanned: boolean | null
  timeTutored: string
  createdAt: Date
}

type Message = {
  id: string
  sessionId: string
  senderId: string
  contents: string
  createdAt: Date
  updatedAt: Date
}

function generateMessages(session: Session, n: number): Message[] {
  const start = moment(session.createdAt)
  const end = moment(session.endedAt)
  const delta = moment.duration(end.diff(start)).asMinutes()
  const messages: Message[] = []
  for (let i = 0; i < n; i++) {
    const sentAt = moment(start)
      .add(delta * i, 'minutes')
      .toDate()
    messages.push({
      id: getDbUlid(),
      sessionId: session.id,
      senderId:
        i % 2 === 0
          ? session.volunteerId
            ? session.volunteerId
            : session.studentId
          : session.studentId,
      contents: faker.lorem.sentence(),
      createdAt: sentAt,
      updatedAt: sentAt,
    })
  }
  return messages
}

export async function sessions(
  volunteerIds: NameToId,
  studentIds: NameToId,
  subjectIds: NameToId,
  roleIds: NameToId,
  reportIds: NameToId
): Promise<NameToId> {
  const session1 = getDbUlid() // success
  const session1Start = moment('1/1/22')
    .hour(22)
    .minute(22)
    .toDate()
  const session2 = getDbUlid() // unmatched
  const session2Start = moment(session1Start)
    .add(1, 'day')
    .toDate()
  const session3 = getDbUlid() // reported -> banned
  const session3Start = moment(session2Start)
    .add(1, 'day')
    .toDate()
  const session4 = getDbUlid() // absent student
  const session4Start = moment(session3Start)
    .add(1, 'day')
    .toDate()
  const session5 = getDbUlid() // assistments
  const session5Start = moment(session4Start)
    .add(1, 'day')
    .toDate()
  const session6 = getDbUlid() // positive feedback
  const session6Start = moment(session5Start)
    .add(1, 'day')
    .toDate()
  const session7 = getDbUlid() // negative feedback
  const session7Start = moment(session6Start)
    .add(1, 'day')
    .toDate()
  const session8 = getDbUlid() // quill doc
  const session8Start = moment(session7Start)
    .add(1, 'day')
    .toDate()

  const sessions: Session[] = [
    {
      id: session1,
      studentId: studentIds['Student 1'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: moment(session1Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session1Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(50 * 60 * 1000),
      createdAt: session1Start,
    },
    {
      id: session2,
      studentId: studentIds['Student 1'] as string,
      volunteerId: null,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: null,
      endedAt: moment(session2Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['admin'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(0),
      createdAt: session2Start,
    },
    {
      id: session3,
      studentId: studentIds['Student 2'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: moment(session3Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session3Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: true,
      studentBanned: true,
      timeTutored: String(50 * 60 * 1000),
      createdAt: session3Start,
    },
    {
      id: session4,
      studentId: studentIds['Student 1'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: moment(session4Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session4Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(0),
      createdAt: session4Start,
    },
    {
      id: session5,
      studentId: studentIds['Student 5'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: moment(session5Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session5Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(50 * 60 * 1000),
      createdAt: session5Start,
    },
    {
      id: session6,
      studentId: studentIds['Student 1'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: moment(session6Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session6Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(50 * 60 * 1000),
      createdAt: session6Start,
    },
    {
      id: session7,
      studentId: studentIds['Student 1'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: true,
      quillDoc: null,
      volunteerJoinedAt: moment(session7Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session7Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(50 * 60 * 1000),
      createdAt: session7Start,
    },
    {
      id: session8,
      studentId: studentIds['Student 1'] as string,
      volunteerId: volunteerIds['Volunteer 1'] as string,
      subjectId: subjectIds['Prealgebra'] as number,
      hasWhiteboardDoc: false,
      quillDoc: QUILL,
      volunteerJoinedAt: moment(session8Start)
        .add(5, 'minutes')
        .toDate(),
      endedAt: moment(session8Start)
        .add(50, 'minutes')
        .toDate(),
      endedByRoleId: roleIds['volunteer'] as number,
      reviewed: false,
      toReview: false,
      studentBanned: false,
      timeTutored: String(50 * 60 * 1000),
      createdAt: session8Start,
    },
  ]

  const assistments = [
    {
      id: getDbUlid(),
      problemId: 1,
      assignmentId: getDbUlid(),
      studentId: ASSISTMENTS_STUDENT_ID,
      sessionId: session5,
      sent: true,
      sentAt: moment(session5Start)
        .add(1, 'hour')
        .toDate(),
      createdAt: moment(session5Start)
        .add(1, 'hour')
        .toDate(),
      updatedAt: moment(session5Start)
        .add(1, 'hour')
        .toDate(),
    },
  ]

  const messages: Message[] = [
    {
      id: getDbUlid(),
      sessionId: session4,
      senderId: sessions[3].volunteerId as string,
      contents: faker.lorem.sentence(),
      createdAt: moment(sessions[3].volunteerJoinedAt)
        .add(1, 'minute')
        .toDate(),
      updatedAt: moment(sessions[3].volunteerJoinedAt)
        .add(1, 'minute')
        .toDate(),
    },
    ...generateMessages(sessions[0], 1000),
    ...generateMessages(sessions[2], 25),
    ...generateMessages(sessions[4], 25),
    ...generateMessages(sessions[5], 25),
    ...generateMessages(sessions[6], 25),
    ...generateMessages(sessions[7], 25),
  ]

  const reports = [
    {
      id: getDbUlid(),
      reportReasonId: reportIds[
        'This student was extremely rude or inappropriate'
      ] as number,
      reportMessage: faker.lorem.sentence(),
      reportingUserId: volunteerIds['Volunteer 1'] as string,
      sessionId: session3,
      reportedUserId: studentIds['Student 2'] as string,
      createdAt: sessions[3].endedAt,
      updatedAt: sessions[3].endedAt,
    },
  ]

  const temp: any = {}
  for (const session of sessions) {
    temp[session.id] = await wrapInsert(
      'sessions',
      pgQueries.insertSession.run,
      { ...session }
    )
  }

  await wrapInsert('assistments_data', pgQueries.insertAssistmentsData.run, {
    assistment: assistments,
  })

  await wrapInsert('session_messages', pgQueries.insertMessages.run, {
    message: messages,
  })

  await wrapInsert('session_reports', pgQueries.insertSessionReport.run, {
    report: reports,
  })

  return temp
}
