import * as QueueService from '../../services/QueueService'
import { Jobs } from '.'
import { getClient } from '../../db'

export default async () => {
  // hi
  const sessions = await getClient().query(
    `select
    s.id,
    s.student_id,
    subjects.name as subject_name,
    t.name as topic_name,
    subjects.display_name as display_name,
    student_profiles.school_id,
    student_profiles.student_partner_org_id as student_partner_org_id
from sessions s
join subjects on s.subject_id = subjects.id
join topics t on t.id = subjects.topic_id
join student_profiles on s.student_id = student_profiles.user_id
where s.ended_at is null and s.volunteer_id is null`
  )
  for (const session of sessions.rows) {
    await QueueService.add(Jobs.TextVolunteers, {
      notificationRound: 1,
      sessionId: session.id,
      subject: session.subject_name,
      subjectDisplayName: session.display_name,
      topic: session.topic_name,
      studentId: session.student_id,
      schoolId: session.school_id,
      studentPartnerOrg: session.student_partner_org_id,
    })
  }
}
