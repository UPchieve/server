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
    throw new Error(`Could not read student partner orgs: ${(err as Error).message}`)
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
    throw new Error(`Could not read student partner orgs: ${(err as Error).message}`)
  }
}

async function insertAdminUser(mongoIds: string[]): Promise<void> {
  try {
    const result = await pgQueries.insertAdminUser.run({ mongoIds }, client)
    if (result.length !== mongoIds.length) console.error(`Did not insert admin for ${mongoIds.length - result.length} users due to duplicates`)
  } catch (err) {
    throw new Error(`Could not insert admin users: ${(err as Error).message}`)
  }
}

async function updateSchoolPartner(mongoIds: string[]): Promise<void> {
  try {
    const result = await pgQueries.updateSchoolPartner.run({ mongoIds }, client)
    const returnedIds = result.map(v => v.ok)
    const diff = mongoIds.filter(v => !returnedIds.includes(v))
    if (result.length !== mongoIds.length) console.error(`Did not update partrner status for schools due to missing mongoIds: ${diff}`)
  } catch (err) {
    throw new Error(`Could not update school partners: ${(err as Error).message}`)
  }
}

async function updateInGatesStudy(mongoIds: string[]): Promise<void> {
  try {
    const result = await pgQueries.updateInGatesStudy.run({ mongoIds }, client)
    const returnedIds = result.map(v => v.ok)
    const diff = mongoIds.filter(v => !returnedIds.includes(v))
    if (result.length !== mongoIds.length) console.error(`Did not update user in gates study for ${diff} users`)
  } catch (err) {
    throw new Error(`Could not user in gates study: ${(err as Error).message}`)
  }
}

async function fixVolunteerFeedbacks(): Promise<void> {
  try {
    const countResult = await pgQueries.countBadFeedbacks.run(undefined, client)
    const count = countResult[0].count || 0
    const result = await pgQueries.fixVolunteerFeedbacks.run(undefined, client)
    const returnedIds = result.map(v => v.ok)
    const diff = count - returnedIds.length
    if (diff) console.error(`Did not update fix ${diff} feedbacks`)
  } catch (err) {
    throw new Error(`Could not fix broken feedbacks: ${(err as Error).message}`)
  }
}


async function seedData(): Promise<void> {
  let exitCode = 0
  try {
    const spoIds = await getStudentPartnerOrgIds()
    const ssoIds = await getSponsorOrgIds()
    await schoolsSponsorOrgsReal(ssoIds)
    await studentPartnerOrgsSponsorOrgsReal(ssoIds, spoIds)
    await fixVolunteerFeedbacks()

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
    await updateInGatesStudy([
      "5f49b1c8495734018dd3d03e",
      "5f862b6c9b07ce7fda7ca219",
      "5f7cffbfb56320061bd6f042",
      "5fb7da400bf80c627ae4cd2c",
      "5fda34882d7e6138ca330df7",
      "600cc4cc2bfea9002304d3f1",
      "602295d66beb1700212fe2e6",
      "603154dc0a15ca0022dd48ae",
      "6021a5692df17a002188df35",
      "6025627f20b7210020190163",
      "6033b45856c343002188f034",
      "602b3dfa3fd95f0028a19b7a",
      "60403cf417b3f100213ec81a",
      "603263c934843100238048e6",
      "60411da8847cc50024b31d4b",
      "6041095f847cc50024b31c45",
      "604aa547dc672a00203e6db0",
      "60493d36c44a0f0024b19e18",
      "60526659e8e4090023bdc25e",
      "6052b6d8e8e4090023bdc412",
      "605e331125b6f10023a4ab16",
      "606f09035030350023e17930",
      "607f58a3268572002172ef13",
      "608165d38113bb00235fe09b",
      "608173348113bb00235fe0e6",
      "60830ca57d36d8002661c56a",
      "60872e937d36d80026625c28",
      "609c0e705af32e00229027fb",
      "60a1c3aec3b4a40024fed03f",
      "60b7d1b2cdcce10022a7d0b6",
      "60c235d653f8c90022511dc1",
      "60c36d00a1580b0021b846a1",
      "60ce64b7994d3900216e5981",
      "60da71618a1e2900230434e1",
      "60f70fb9803b3b0023248ed4",
      "6126c2d760945b00229664f1",
      "6127ebd560945b0022967838",
      "612d6903f7d6af0021933abc",
      "612d7891f7d6af0021933e5a",
      "612d8982f7d6af00219341dc",
      "6133aef9c431c200233fb644",
      "6138139df2bac40024037968",
      "613e288c8175d700234a8ecb",
      "614630468175d700234bbf51",
      "614652dc8175d700234bc78b",
      "614d0bee3a5c9200219fc6de",
      "614d261b3a5c9200219fd043",
      "615296e350dafc002237fda9",
      "6158fd1e50dafc002238d86f",
      "6161fe38480df00022008199",
      "616205e9480df000220083dd",
      "6168d69965180a0021ada9b4",
      "616df5fe39c1830023cb9fec",
      "616dfae539c1830023cba1a8",
      "616ed35f39c1830023cbc676",
      "6170721239c1830023cc0ccf",
      "617099ed39c1830023cc151a",
      "6179fc8439c1830023cd8cb4",
      "618a73b3abbcc20021d61542",
      "618dc229abbcc20021da511a",
      "618efd5babbcc20021dbad9a",
      "6193f017c8479800239ba6d7",
      "61940265c8479800239bc976",
      "6195090fc8479800239db16c",
      "61952729c8479800239dcee4",
      "6195dcc6c8479800239f3340",
      "6196732ac8479800239f8d63",
      "6196a87ac8de5100221ddb45",
      "6196acc8c8de5100221de214",
      "6196ae62c8de5100221de4ab",
      "6196b9a1c8de5100221df72a",
      "6197a97ec8de5100221f2874",
      "6197ade4c8de5100221f29f3",
      "6197b5efc8de5100221f2fbb",
      "6197c43fc8de5100221f4c64",
      "6197faf7c8de5100221f8caa",
      "619936623dd9e90021eae66a",
      "619aa5aa3dd9e90021ebe622",
      "619bf4413dd9e90021ed4e04",
      "619bf9133dd9e90021ed57af",
      "619bf9493dd9e90021ed5873",
      "619bf9643dd9e90021ed58e0",
      "619c30e33dd9e90021edd7c4",
      "619d4999ca4aa7002165d728",
      "619d8129ca4aa700216626dd",
      "619d8515ca4aa70021662baf",
      "619d88bbca4aa70021663230",
      "619e95cfca4aa7002167431f",
      "61a2dbb390b034002361db68",
      "61a2dccf90b034002361dc9a",
      "61a440aa90b0340023631f71",
      "61a442f590b03400236322be",
      "61a56e8590b034002364a2b5",
      "61a640ae90b034002365c67e",
      "61a6751790b034002366219e",
      "61a69cc890b0340023665e6b",
      "61a78b5190b0340023679710",
      "61a7fa1031d4050022932f54",
      "61a820e931d405002293a952",
      "61a8fa0931d405002294ae83",
      "61a8fe2f31d405002294b4ed",
      "61a951788b0b1b002332cf26",
      "61aa2d2d989d7b0023ddf761",
      "61aa5572989d7b0023de8c10",
      "61aa83a4989d7b0023decef2",
      "61ac0874989d7b0023e04fa1",
      "61ac0c8b989d7b0023e0554e",
      "61ac1c8e989d7b0023e06cd7",
      "61ad344c989d7b0023e15740",
      "61ad89bc989d7b0023e21897",
      "61ae76fe989d7b0023e2e704",
      "61ae9964989d7b0023e332e0",
      "61ae99be989d7b0023e33371",
      "61aeb42b989d7b0023e37bd2",
      "61af52fc989d7b0023e44cbb",
      "61af6198989d7b0023e45302",
      "61af689b989d7b0023e459c9",
      "61af8f38989d7b0023e4d3c9",
      "61afb704989d7b0023e52760",
      "61b1682048350900229894af",
      "61b171f6483509002298b311",
      "61b20bb148350900229925e8",
      "61b38d30801a630022ad01e7",
      "61b7b664801a630022b20460",
      "61b7bc2e801a630022b2140e",
      "61b95f04801a630022b468e7",
      "61c2966d5b0ecf00210c5e88",
      "61d4558736a11f002104b237",
      "61d4559f36a11f002104b272",
      "61d46b5a36a11f002104c610",
      "61d4c3ec36a11f0021055e41",
      "61d7042f75a1b10021d986e2",
      "61d708a375a1b10021d9c832",
      "61d70af075a1b10021d9e0cd",
      "61d70c4675a1b10021d9e486",
      "61d7332f75a1b10021da1f17",
      "61d74d1575a1b10021da57d4",
      "61d7523a75a1b10021da6320",
      "61d752cd75a1b10021da64f7",
      "61d7539a75a1b10021da67e7",
      "61d7627475a1b10021da8d01",
      "61d76f6375a1b10021daa648",
      "61d7844975a1b10021dacc83",
      "61d7be4175a1b10021db3bf5",
      "61d86c1575a1b10021dbb13c",
      "61d8818175a1b10021dbd7c9",
      "61d89c9375a1b10021dc1311",
      "61d8b8b175a1b10021dc53d9",
      "61d8c12575a1b10021dc6127",
      "61d8ecac75a1b10021dca10d",
      "61dc5ee575a1b10021dfdcd9",
      "61dc5fa575a1b10021dfec79",
      "61dc602a75a1b10021e00257",
      "61dc60a375a1b10021e0185b",
      "61dc612275a1b10021e02f5c",
      "61dc612875a1b10021e030e3",
      "61dc613f75a1b10021e03571",
      "61dd923675a1b10021e2ca33",
      "61dd926e75a1b10021e2cb05",
      "61dd92a175a1b10021e2cb71",
      "61dd930b75a1b10021e2cc51",
      "61dd936275a1b10021e2cd1b",
      "61dd944675a1b10021e2cf02",
      "61ddac7875a1b10021e2fbec",
      "61ddad0075a1b10021e2ff53",
      "61ddad5575a1b10021e30133",
      "61ddad7775a1b10021e301ee",
      "61ddad9275a1b10021e30244",
      "61ddada375a1b10021e3029f",
      "61ddada775a1b10021e302eb",
      "61ddb12075a1b10021e30b8c",
      "61ddb43875a1b10021e3126d",
      "61ddcff1d0670a0020b01101",
      "61ddcffad0670a0020b01132",
      "61ddd029d0670a0020b011be",
      "61ddd047d0670a0020b01229",
      "61ddd062d0670a0020b01270",
      "61ddd133d0670a0020b015b7",
      "61ddd17cd0670a0020b01683",
      "61ddd18bd0670a0020b0171a",
      "61de1da7d0670a0020b0cf04",
      "61dee7c2d0670a0020b1d0cd",
      "61dee7c7d0670a0020b1d101",
      "61dee7cad0670a0020b1d13c",
      "61dee7cbd0670a0020b1d155",
      "61dee7ebd0670a0020b1d2af",
      "61dee7ecd0670a0020b1d2c5",
      "61dee7f1d0670a0020b1d30b",
      "61dee7f6d0670a0020b1d349",
      "61dee7f7d0670a0020b1d366",
      "61dee823d0670a0020b1d416",
      "61defa5ed0670a0020b1f0e7",
      "61defce7d0670a0020b1f560",
      "61defd1bd0670a0020b1f6a1",
      "61defd1fd0670a0020b1f6f5",
      "61defd2cd0670a0020b1f737",
      "61defd3ed0670a0020b1f7b1",
      "61defd49d0670a0020b1f7fd",
      "61defd53d0670a0020b1f86b",
      "61defd5bd0670a0020b1f89e",
      "61defd6fd0670a0020b1f8ec",
      "61defd72d0670a0020b1f912",
      "61defda0d0670a0020b1f9b5",
      "61defda3d0670a0020b1f9d3",
      "61defdb5d0670a0020b1fa13",
      "61defdcad0670a0020b1fa4c",
      "61defdf7d0670a0020b1fa9c",
      "61df08fed0670a0020b20d72",
      "61df1cd0d0670a0020b22cc4",
      "61df1d18d0670a0020b22e73",
      "61df1d5bd0670a0020b23071",
      "61df1d70d0670a0020b2310e",
      "61df1d84d0670a0020b23173",
      "61df1d86d0670a0020b23190",
      "61df1d94d0670a0020b231f1",
      "61df1db6d0670a0020b232af",
      "61df1dc9d0670a0020b232f0",
      "61df1dd0d0670a0020b2334c",
      "61df1dd5d0670a0020b2336b",
      "61df1f8bd0670a0020b23855",
      "61df2587d0670a0020b2430e",
      "61df3455d0670a0020b25da3",
      "61df3751d0670a0020b2e4c7",
      "61df3cd9d0670a0020b33c05",
      "61df442ed0670a0020b35376",
      "61e0395bd0670a0020b4d6b7",
      "61e04df1d0670a0020b50645",
      "61e04e9fd0670a0020b5084b",
      "61e04eb7d0670a0020b508d5",
      "61e04f39d0670a0020b50a7d",
      "61e06344d0670a0020b54ebc",
      "61e070e9d0670a0020b575f4",
      "61e073b1d0670a0020b57ffd",
      "61e6fe9952834e0023d57ecc",
      "61e73d87d56799d4cb51b5d8",
      "61e7401d834070096b3d6a3e",
      "61e79cc2d56799d4cb525ec1",
      "61e850617d7122b27268f6ad",
      "61f004b0e4ef6fc612f3c4d1",
      "620c49b809ba6e074f8f1d05",
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
