import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function reportReasons(): Promise<NameToId> {
  const reasons = [
    {
      reason: '[Immediate ban] Student extremely rude/inappropriate',
    },
    {
      reason: 'I am worried for the immediate safety of this student',
    },
    {
      reason: 'LEGACY: Student was unresponsive',
    },
    {
      reason: 'LEGACY: Technical issue',
    },
    {
      reason: 'LEGACY: Other',
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
