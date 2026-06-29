import { z } from 'zod'
import * as CleverAPIService from '../../services/CleverAPIService'

/**
 * Contract test for the live Clever API our roster depends on. The roster logic
 * is unit-tested with Clever mocked; this is the piece mocks can't cover. See
 * README -> Testing -> Integration tests to run it.
 */

// "#DEMO UPchieve (Dev) Sandbox" — viewable in the Clever developer dashboard (dev.clever.com).
const SANDBOX_DISTRICT_ID = '659eeed5fed564311f823a2b'

const hasCleverCreds =
  !!process.env.CLEVER_CLIENT_ID && process.env.CLEVER_CLIENT_ID !== 'bogus'
const describeWithCreds = hasCleverCreds ? describe : describe.skip

// Each schema mirrors only the fields our roster code reads. Unknown keys Clever
// also returns are ignored (zod strips them), so the contract breaks only when a
// field we actually depend on changes type or disappears.
const cleverSchool = z.object({ id: z.string() })

const cleverStudent = z.object({
  id: z.string(),
  email: z.string().optional(), // findOrCreateUpchieveStudent tolerates a missing email
  name: z.object({ first: z.string(), last: z.string() }),
  roles: z.object({ student: z.object({ grade: z.string().optional() }) }),
})

const cleverTeacher = z.object({
  id: z.string(),
  email: z.string().optional(), // optional in Clever; only needed to create/match a new account
  name: z.object({ first: z.string(), last: z.string() }),
})

const cleverSection = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  students: z.array(z.string()),
})

describeWithCreds('Clever API', () => {
  jest.setTimeout(120_000)

  describe('authentication', () => {
    it('exchanges our credentials for a working district access token', async () => {
      const token =
        await CleverAPIService.getDistrictAccessToken(SANDBOX_DISTRICT_ID)
      // The token is usable: an authenticated call succeeds.
      await expect(
        CleverAPIService.getSchoolsInDistrict(token)
      ).resolves.toEqual(expect.any(Array))
    })
  })

  describe('roster data contract', () => {
    it('returns schools, students, teachers, and sections in the shapes our roster code reads', async () => {
      const token =
        await CleverAPIService.getDistrictAccessToken(SANDBOX_DISTRICT_ID)

      const schools = z
        .array(cleverSchool)
        .parse(await CleverAPIService.getSchoolsInDistrict(token))

      for (const school of schools) {
        z.array(cleverStudent).parse(
          await CleverAPIService.getStudentsInSchool(school.id, token)
        )
        const teachers = z
          .array(cleverTeacher)
          .parse(await CleverAPIService.getTeachersInSchool(school.id, token))

        for (const teacher of teachers) {
          z.array(cleverSection).parse(
            await CleverAPIService.getTeacherClasses(teacher.id, token)
          )
          z.array(cleverStudent).parse(
            await CleverAPIService.getTeacherStudents(teacher.id, token)
          )
        }
      }
    })
  })
})
