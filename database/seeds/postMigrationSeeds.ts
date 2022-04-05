import { schoolsSponsorOrgsReal, studentPartnerOrgsSponsorOrgsReal } from './scripts/partners/sponsor-orgs-real'
import { ExpectedErrors, NameToId } from './scripts/utils'
import * as pgQueries from './scripts/partners/pg.queries'
import client from './pgClient'

async function getStudentPartnerOrgIds(): Promise<NameToId> {
  try {
    const result = await pgQueries.getStudentPartnerOrgs.run(undefined, client)
    const map: NameToId = {}
    for (const row of result) {
      map[row.key] = row.id
    }
    return map
  } catch (err) {
    throw new Error('Could not read student partner orgs')
  }
}

async function getSponsorOrgIds(): Promise<NameToId> {
  try {
    const result = await pgQueries.getSponsorOrgs.run(undefined, client)
    const map: NameToId = {}
    for (const row of result) {
      map[row.key] = row.id
    }
    return map
  } catch (err) {
    throw new Error('Could not read student partner orgs')
  }
}

async function insertAdminUser(mongoIds: string[]): Promise<void> {
  try {
    const result = await pgQueries.insertAdminUser.run({ mongoIds }, client)
    if (result.length !== mongoIds.length) console.error(`Did not insert mongo id for ${mongoIds.length - result.length} users`)
  } catch (err) {
    throw new Error('Could not insert admin users')
  }
}

async function updateSchoolPartner(mongoIds: string[]): Promise<void> {
  try {
    const result = await pgQueries.updateSchoolPartner.run({ mongoIds }, client)
    const returnedIds = result.map(v => v.ok)
    const diff = mongoIds.filter(v => !returnedIds.includes(v))
    if (result.length !== mongoIds.length) console.error(`Did not insert mongo id for ${diff} users`)
  } catch (err) {
    throw new Error('Could not update school partners')
  }
}

async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    const spoIds = await getStudentPartnerOrgIds()
    const ssoIds = await getSponsorOrgIds()
    await schoolsSponsorOrgsReal(ssoIds)
    await studentPartnerOrgsSponsorOrgsReal(ssoIds, spoIds)

    await insertAdminUser([
      '5bccb58aa73c02792c0e8657',
      '5dae943493647c3dcb604f36',
      '5c08a91cd073905a783aeba2',
      '5d891b842714c063774dc665',
      '5dd58f9581667532a91543b2',
      '5eaf7e7c20a5f0299a8e2b0f',
      '5ebab14ed5efa701da8f1faa',
      '600c51252bfea9002304c5a7',
      '6086fcf17d36d80026624b77',
      '60906fc18b925400233b003c',
      '60918a5a8b925400233b35d2',
      '5afa39a232aa6cdf09089084',
      '60d7b4568a1e290023041855',
      '60e3c8852acf2d00210388ef',
      '612e927df7d6af0021935637',
      '616f12b639c1830023cbcfca',
      '618aa37aabbcc20021d64b1d',
      '62017fc293a3b48a0373096f',
      '6202e81809ba6e074f86b9ad',
    ])
    await updateSchoolPartner([
      '5d646639cd70635841b2bd22',
      '5d646667cd70635841b2c475',
      '5d646658cd70635841b2c254',
      '5d646651cd70635841b2c173',
      '5d6466a9cd70635841b2cdcd',
      '5d6466a9cd70635841b2cdd2',
      '5d6466b7cd70635841b2cfea',
      '5d6466d4cd70635841b2d3f7',
      '5d6466d4cd70635841b2d3f3',
      '5d6466b7cd70635841b2cfdf',
      '5d6466aecd70635841b2cea9',
      '5d6466dccd70635841b2d4e4',
      '5d6466d4cd70635841b2d3f1',
      '5d64671acd70635841b2dc7e',
      '5d64671acd70635841b2dc7d',
      '5d646730cd70635841b2df1b',
      '5d646726cd70635841b2ddab',
      '5d64672ccd70635841b2de73',
      '5d646728cd70635841b2ddfa',
      '5d64672bcd70635841b2de5a',
      '5d646728cd70635841b2ddf9',
      '5d64672dcd70635841b2de9c',
      '5d64672fcd70635841b2dee1',
      '5d646731cd70635841b2df34',
      '5d646731cd70635841b2df3c',
      '5d646739cd70635841b2e01c',
      '5d646731cd70635841b2df33',
      '5d646730cd70635841b2df19',
      '5d646731cd70635841b2df35',
      '5d64672bcd70635841b2de6c',
      '5d64672bcd70635841b2de67',
      '5d64672acd70635841b2de3b',
      '5d64676bcd70635841b2e59f',
      '5d6467c1cd70635841b2efa5',
      '5d64680dcd70635841b2f787',
      '5d646836cd70635841b2fbad',
      '5d646836cd70635841b2fbb0',
      '5d646828cd70635841b2fa59',
      '5d646833cd70635841b2fb56',
      '5d64682ecd70635841b2fad4',
      '5d646839cd70635841b2fbc8',
      '5d64686acd70635841b300a4',
      '5d6468ddcd70635841b30b8d',
      '5d646964cd70635841b315e0',
      '5d646976cd70635841b31741',
      '5d646976cd70635841b31747',
      '5d646976cd70635841b31742',
      '5d646976cd70635841b31743',
      '5d6469f8cd70635841b3219b',
      '5f500394495734018dd3eb6d',
      '5eecb387ebf9b70253712741',
      '5f68a201fd7936288fb38912',
      '5e9f5b48a2ede51e579a25cc',
      '5f2b0551746b3362bfee1ae8',
      '617b21be39c1830023cdb89c',
      '6189891eabbcc20021d4dba8',
      '61898953abbcc20021d4dc21',
      '6189896cabbcc20021d4dc43',
      '618989ababbcc20021d4dcb2',
      '61a7bb1a90b034002367d62a',
      '61a800bd31d40500229346ce',
      '61b7bd9c801a630022b218a5',
      '61b7bdd5801a630022b21908',
      '61b7be06801a630022b21960',
    ])

    console.log('All data is seeded!')
    if (ExpectedErrors.length)
      console.log(
        `Tried to re-seed ${ExpectedErrors.length} objects already in database`
      )
  } catch (err) {
    exitCode = 1
    console.log(err as Error)
  } finally {
    process.exit(exitCode)
  }
}

seedData()
