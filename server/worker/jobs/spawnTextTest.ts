import * as QueueService from '../../services/QueueService'
import {Jobs} from '.'
import { getClient } from "../../db";

export default async() => {
  const sessions = await getClient().query(
    `select * from sessions
    join subjects on sessions.subject_id = subjects.id
    join student_profiles on sessions.student_id = student_profiles.user_id
    where sessions.ended_at is not null and sessions.volunteer_id is null`)
  for (const session of sessions.rows) {
    await QueueService.add(Jobs.TextVolunteers, {
        notificationRound: 1,
        sessionId: session.id,
        subject: session.subject_id,
        subjectDisplayName: session.display_name,
        topic: session.topic_id,
        studentId: session.student_id,
        schoolId: session.school_id,
        studentPartnerOrg: session.student_partner_org,
    })
  }
}
