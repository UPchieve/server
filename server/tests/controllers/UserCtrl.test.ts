test.todo('postgres migration')
/*import mongoose from 'mongoose'
import { createVolunteer } from '../../controllers/UserCtrl'
import { getVolunteer, resetDb } from '../db-utils'
import { buildVolunteer } from '../generate'
import { getSnapshotByVolunteerId } from '../../models/Availability'
import { createContact } from '../../services/MailService'
import { AccountActionCreator } from '../../controllers/UserActionCtrl'
import { createUSMByUserId } from '../../models/UserSessionMetrics'
jest.mock('../../services/MailService')
jest.mock('../../controllers/UserActionCtrl')
jest.mock('../../models/UserSessionMetrics')
jest.mock('../../models/UserSessionMetrics/queries')

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
  jest.clearAllMocks()
})

describe('createVolunteer', () => {
  test('Should create a volunteer and availability', async () => {
    const newVolunteer = buildVolunteer()
    const createdAccountMockMethod = (AccountActionCreator.prototype.createdAccount = jest.fn())
    await createVolunteer(newVolunteer, '0.0.0.0')
    const einstein = await getVolunteer({ _id: newVolunteer._id })
    const newAvailability = await getSnapshotByVolunteerId(einstein._id!)

    expect(einstein._id).toEqual(newVolunteer._id)
    expect(newAvailability!.volunteerId).toEqual(newVolunteer._id)
    expect((createUSMByUserId as jest.Mock).mock.calls.length).toBe(1)
    expect((createContact as jest.Mock).mock.calls.length).toBe(1)
    expect((AccountActionCreator as jest.Mock).mock.calls.length).toBe(1)
    expect(createdAccountMockMethod).toHaveBeenCalledTimes(1)
  })
})
*/
