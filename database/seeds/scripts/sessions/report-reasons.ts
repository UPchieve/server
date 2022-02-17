import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function reportReasons(): Promise<NameToId> {
  const reasons = [
    {
      reason: 'This student was extremely rude or inappropriate',
    },
    {
      reason: 'I am worried for the immediate safety of this student',
    },
    {
      reason: 'LEGACY: Student was unresponsive',
    },
    {
      reason: 'LEGACY: Student was rude',
    },
    {
      reason: 'LEGACY: Technical issue',
    },
    {
      reason: 'LEGACY: Student was misusing platform',
    },
  ]
  const temp: NameToId = {}
  for (const reason of reasons) {
    temp[reason.reason] = await wrapInsert(
      'report_reasons',
      pgQueries.insertReportReason.run,
      { ...reason }
    )
  }
  return temp
}
