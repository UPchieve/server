import { validateVolunteerReportQuery } from '../../utils/reportUtils'
import { InputError } from '../../models/Errors'

describe('reportUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('validateVolunteerReportQuery', () => {
    it.each([
      ['13-32-2023', '01-01-2024'], // invalid start date format
      ['01-30-2023', '01-01-2023'], // start date > endDate
    ])(
      'Throws InputError for invalid dates (start=%s, end=%s)',
      async (startDate, endDate) => {
        await expect(() =>
          validateVolunteerReportQuery({
            partnerOrg: '123',
            startDate,
            endDate,
          })
        ).rejects.toThrow(InputError)
      }
    )
  })
})
