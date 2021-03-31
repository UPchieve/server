import createNewAvailability from '../../utils/create-new-availability'
import { noHoursSelected } from '../mocks/volunteer-availability'

test('Should create an empty availability object', async () => {
  expect(createNewAvailability()).toEqual(noHoursSelected)
})
