import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function schools(cityIds: NameToId): Promise<NameToId> {
  const schools = [
    {
      id: getDbUlid(),
      name: 'Unapproved School',
      approved: false,
      partner: false,
      cityId: cityIds['Denver'] as number,
    },
    {
      id: getDbUlid(),
      name: 'Approved School',
      approved: true,
      partner: false,
      cityId: cityIds['Denver'] as number,
    },
    {
      id: getDbUlid(),
      name: 'Approved Partner School',
      approved: true,
      partner: true,
      cityId: cityIds['Brooklyn'] as number,
    },
    {
      id: getDbUlid(),
      name: 'Another Approved Partner School',
      approved: true,
      partner: true,
      cityId: cityIds['Brooklyn'] as number,
    },
  ]
  const temp: NameToId = {}
  for (const school of schools) {
    temp[school.name] = await wrapInsert(
      'schools',
      pgQueries.insertSchool.run,
      { ...school }
    )
    if (school.partner)
      await wrapInsert(
        'student_partner_orgs',
        pgQueries.insertSchoolStudentPartners.run,
        { schoolName: school.name }
      )
  }
  return temp
}
