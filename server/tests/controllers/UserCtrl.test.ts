import mongoose from 'mongoose'
import { createVolunteer } from '../../controllers/UserCtrl'
import { getVolunteer, resetDb } from '../db-utils'
import { buildVolunteer } from '../generate'
import { getAvailability } from '../../services/AvailabilityService'
import { createContact } from '../../services/MailService'
import { AccountActionCreator } from '../../controllers/UserActionCtrl'
jest.mock('../../services/MailService')
jest.mock('../../controllers/UserActionCtrl')

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
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
    await createVolunteer(newVolunteer)
    const einstein = await getVolunteer({ _id: newVolunteer._id })
    const newAvailability = await getAvailability({
      volunteerId: einstein._id
    })

    expect(einstein._id).toEqual(newVolunteer._id)
    expect(newAvailability.volunteerId).toEqual(newVolunteer._id)
    expect((createContact as jest.Mock).mock.calls.length).toBe(1)
    expect((AccountActionCreator as jest.Mock).mock.calls.length).toBe(1)
    expect(createdAccountMockMethod).toHaveBeenCalledTimes(1)
  })
})
