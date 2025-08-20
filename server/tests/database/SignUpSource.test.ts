import { getClient } from '../../db'

import * as SignupSourceRepo from '../../models/SignUpSource'

describe('getSignUpSources', () => {
  const client = getClient()
  beforeAll(async () => {
    await client.query(`INSERT INTO signup_sources (name) VALUES ('Youtube')`)
  })

  afterAll(async () => {
    await client.query(`DELETE FROM signup_sources WHERE name = 'Youtube'`)
  })

  it("Omits 'Roster' for all types of users (and when none is specified)", async () => {
    const generalResults = await SignupSourceRepo.getSignUpSources()
    const studentResults = await SignupSourceRepo.getSignUpSources('student')
    const volunteerResults =
      await SignupSourceRepo.getSignUpSources('volunteer')

    expect(generalResults.length).toBeGreaterThan(0)
    expect(studentResults.length).toBeGreaterThan(0)
    expect(volunteerResults.length).toBeGreaterThan(0)

    expect(
      generalResults.find((source) => source.name === 'Roster')
    ).toBeUndefined()
    expect(
      studentResults.find((source) => source.name === 'Roster')
    ).toBeUndefined()
    expect(
      volunteerResults.find((source) => source.name === 'Roster')
    ).toBeUndefined()
  })

  it("Omits 'Youtube' for volunteers but includes it for students", async () => {
    const generalResults = await SignupSourceRepo.getSignUpSources()
    const studentResults = await SignupSourceRepo.getSignUpSources('student')
    const volunteerResults =
      await SignupSourceRepo.getSignUpSources('volunteer')

    expect(
      generalResults.find((source) => source.name === 'Youtube')
    ).toBeDefined()
    expect(
      studentResults.find((source) => source.name === 'Youtube')
    ).toBeDefined()
    expect(
      volunteerResults.find((source) => source.name === 'Youtube')
    ).toBeUndefined()
  })
})
