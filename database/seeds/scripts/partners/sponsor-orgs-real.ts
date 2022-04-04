import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'
import pgClient from '../../pgClient'

export async function sponsorOrgsReal(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'vils',
      name: 'Verizon Innovative Learning Schools',
    },
    {
      id: getDbUlid(),
      key: 'pfed',
      name: 'Project FoundED',
    },
  ]
  const temp: NameToId = {}
  for (const org of orgs) {
    temp[org.key] = await wrapInsert(
      'sponsor_orgs',
      pgQueries.insertSponsorOrg.run,
      { ...org }
    )
  }
  return temp
}

export async function schoolsSponsorOrgsReal(
  sponsorOrgIds: NameToId
) {
  const schoolMongoIds = [
    '5d6466d4cd70635841b2d3f1',
    '5d64671acd70635841b2dc7e',
    '5d64671acd70635841b2dc7d',
    '5d6466d4cd70635841b2d3f7',
    '617b21be39c1830023cdb89c',
    '5d64676bcd70635841b2e59f',
    '5d6466d4cd70635841b2d3f3',
    '5d646667cd70635841b2c475',
    '5d64682ecd70635841b2fad4',
    '5d646976cd70635841b31741',
    '5d6467c1cd70635841b2efa5',
    '5d646976cd70635841b31747',
    '5d646976cd70635841b31742',
    '5d646976cd70635841b31743',
    '5d64686acd70635841b300a4',
    '5d646839cd70635841b2fbc8',
    '5d646739cd70635841b2e01c',
    '5d646964cd70635841b315e0',
    '5d6466b7cd70635841b2cfea',
    '5d6466b7cd70635841b2cfdf',
  ]
  schoolMongoIds.forEach(async (mongoId) => {
    const result = await pgQueries.getSchoolIdByMongoId.run({mongo_id: mongoId}, pgClient)
    if (!result[0]) return
    const id = result[0].id
    await pgQueries.insertSchoolsSponsorOrgs.run({sponsorOrgId: (sponsorOrgIds['vils'] as string), schoolId: id}, pgClient)
  })
}

export async function studentPartnerOrgsSponsorOrgsReal(
  sponsorOrgIds: NameToId,
  studentPartnerOrgIds: NameToId,
) {
  const partnerOrgs = [
    studentPartnerOrgIds['chinatown-cdc'],
    studentPartnerOrgIds['cyc'],
    studentPartnerOrgIds['nac'],
  ]

  partnerOrgs.forEach(async (org) => {
    await pgQueries.insertStudentPartnerOrgsSponsorOrgs.run({studentPartnerOrgId: (org as string), sponsorOrgId: (sponsorOrgIds['pfed'] as string)}, pgClient)
  })
}
