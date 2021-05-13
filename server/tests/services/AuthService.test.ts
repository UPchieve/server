import { mocked } from 'ts-jest/utils'
import mongoose from 'mongoose'
import { compareSync } from 'bcrypt'

import { insertStudent, insertVolunteer, resetDb } from '../db-utils'
import {
  buildStudent,
  buildStudentRegistrationForm,
  buildVolunteer,
  buildVolunteerRegistrationForm,
  buildPartnerVolunteerRegistrationForm
} from '../generate'

import UserModel from '../../models/User'
import SchoolModel from '../../models/School'
import MailService from '../../services/MailService'
import IpAddressService from '../../services/IpAddressService'
import UserService from '../../services/UserService'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as VolunteerService from '../../services/VolunteerService'
import * as UserCtrl from '../../controllers/UserCtrl'

import * as AuthService from '../../services/AuthService'
import {
  RegistrationError,
  ResetError,
  checkPassword
} from '../../utils/auth-utils'
import { InputError, LookupError } from '../../utils/type-utils'
import { USER_BAN_REASON } from '../../constants'

// Mocks
// TODO: fix typing issue with mockedUserCtrl.createStudent/Volunteer
jest.mock('../../controllers/UserCtrl', () => ({
  __esModule: true,
  checkReferral: jest.fn().mockImplementation(() => '111111111111'),
  createStudent: jest.fn(),
  createVolunteer: jest.fn()
}))
const mockedUserCtrl = mocked(UserCtrl)

jest.mock('../../services/IpAddressService')
const mockedIpAddressService = mocked(IpAddressService, true)
mockedIpAddressService.getIpWhoIs.mockImplementation(async () => {
  // eslint-disable-next-line
  return { country_code: 'US', org: 'example' }
})

jest.mock('../../services/VolunteerService')
const mockVolunteerService = mocked(VolunteerService, true)
mockVolunteerService.queueOnboardingReminderOneEmail.mockImplementationOnce(
  async () => {
    /* do nothing */
  }
)

jest.mock('../../services/MailService')
const mockedMailService = mocked(MailService, true)

jest.mock('../../services/AnalyticsService')
const mockedAnalyticsService = mocked(AnalyticsService, true)

// TODO: remove need for DB connection entirely using Repos
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

describe('Utils tests', () => {
  test('Check valid password', () => {
    function password() {
      return checkPassword('Password123')
    }
    expect(password).toBeTruthy()
  })

  test('Check invalid password via too short', () => {
    function password() {
      return checkPassword('Pass123')
    }
    expect(password).toThrowError(
      new RegistrationError('Password must be 8 characters or longer')
    )
  })

  test('Check invalid password via no uppercase', () => {
    function password() {
      return checkPassword('password123')
    }
    expect(password).toThrowError(
      new RegistrationError(
        'Password must contain at least one uppercase letter'
      )
    )
  })

  test('Check invalid password via no lowercase', () => {
    function password() {
      return checkPassword('PASSWORD123')
    }
    expect(password).toThrowError(
      new RegistrationError(
        'Password must contain at least one lowercase letter'
      )
    )
  })

  test('Check invalid password via no number', () => {
    function password() {
      return checkPassword('PasswordABC')
    }
    expect(password).toThrowError(
      new RegistrationError('Password must contain at least one number')
    )
  })
})

describe('Registration tests', () => {
  beforeEach(async () => {
    await resetDb()
    jest.clearAllMocks()
  })

  // Spy on models
  jest.spyOn(UserModel, 'find')
  jest.spyOn(SchoolModel, 'findOne')
  // TODO: mock UserService
  jest.spyOn(UserService, 'getUser')

  // Test objects
  const studentOpenOverrides = {
    studentPartnerOrg: '',
    studentPartnerSite: '',
    partnerUserId: '',
    zipCode: '11201',
    highSchoolId: '111111111111'
  }
  const studentPartnerOverrides = {
    zipCode: '',
    highSchoolId: '',
    studentPartnerOrg: 'example',
    studentPartnerSite: 'example.org',
    partnerUserId: '123'
  }
  const studentOpen = buildStudent(studentOpenOverrides)
  const studentPartner = buildStudent(studentPartnerOverrides)

  const volunteerPartnerOverrides = {
    volunteerPartnerOrg: 'example'
  }
  const volunteerOpen = buildVolunteer()
  const volunteerPartner = buildVolunteer(volunteerPartnerOverrides)

  test('Check valid credentials', async () => {
    const payload = {
      email: studentOpen.email,
      password: studentOpen.password
    }

    const result = await AuthService.checkCredential(payload)

    expect(UserModel.find).toHaveBeenCalledTimes(1)
    expect(result).toBeTruthy()
  })

  test('Check invalid credentials via no email', async () => {
    const payload = {
      email: '',
      password: studentOpen.password
    }

    let err: InputError
    try {
      await AuthService.checkCredential(payload)
      expect(true).toEqual(false)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(InputError)
    expect(err.message).toEqual(
      'Must supply an email and password for registration'
    )
  })

  test('Check invalid credentials via no password', async () => {
    const payload = {
      email: studentOpen.email,
      password: ''
    }

    let err: InputError
    try {
      await AuthService.checkCredential(payload)
      expect(true).toEqual(false)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(InputError)
    expect(err.message).toEqual(
      'Must supply an email and password for registration'
    )
  })

  test('Check invalid credentials via bad email', async () => {
    const payload = {
      email: 'bad email',
      password: studentOpen.password
    }

    let err: RegistrationError
    try {
      await AuthService.checkCredential(payload)
      expect(true).toEqual(false)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual('Must supply a valid email address')
  })

  test('Register valid open student', async () => {
    mockedUserCtrl.createStudent.mockImplementation(() =>
      // @ts-expect-error
      Promise.resolve(studentOpen)
    )

    // Test payload
    const serviceStudent = await AuthService.registerStudent(
      buildStudentRegistrationForm(studentOpenOverrides)
    )

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(IpAddressService.getIpWhoIs).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createStudent).toHaveBeenCalledTimes(1)

    // return student object
    expect(serviceStudent).toMatchObject(studentOpen)
  })

  test('Register valid partner student', async () => {
    mockedUserCtrl.createStudent.mockImplementation(() =>
      // @ts-expect-error
      Promise.resolve(studentPartner)
    )

    // Test payload
    const serviceStudent = await AuthService.registerStudent(
      buildStudentRegistrationForm(studentPartnerOverrides)
    )

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(IpAddressService.getIpWhoIs).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createStudent).toHaveBeenCalledTimes(1)

    // return student object
    expect(serviceStudent).toMatchObject(studentPartner)
  })

  test('Register invalid open student via existing email', async () => {
    await insertStudent({
      email: studentOpen.email
    })

    // Test payload
    let err: LookupError
    try {
      await AuthService.registerStudent(
        buildStudentRegistrationForm({
          ...studentOpenOverrides,
          email: studentOpen.email
        })
      )
      expect(true).toEqual(false) // fail assertion if registerStudent doesn't throw
    } catch (error) {
      err = error
    }
    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1)

    expect(err).toBeInstanceOf(LookupError)
    expect(err.message).toEqual(
      'The email address you entered is already in use'
    )
  })

  test('Register invalid open student via bad school', async () => {
    // Test payload
    const form = buildStudentRegistrationForm({
      ...studentOpenOverrides,
      zipCode: '' // check for school not zip
    })
    let err: RegistrationError
    try {
      await AuthService.registerStudent(form)
      expect(true).toEqual(false) // fail assertion if registerStudent doesn't throw
    } catch (error) {
      err = error
    }

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1)
    expect(SchoolModel.findOne).toHaveBeenCalledTimes(1)

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual(`School ${form.highSchoolId} is not approved`)
  })

  test('Register invalid partner student via bad org', async () => {
    // Test payload
    const form = buildStudentRegistrationForm({
      ...studentPartnerOverrides,
      studentPartnerOrg: 'bad org'
    })
    let err: RegistrationError
    try {
      await AuthService.registerStudent(form)
      expect(true).toEqual(false) // fail assertion if registerStudent doesn't throw
    } catch (error) {
      err = error
    }

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1)

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual('Invalid student partner organization')
  })

  test('Register valid banned student via bad country', async () => {
    const bannedStudent = buildStudent({
      ...studentOpenOverrides,
      isBanned: true,
      banReason: USER_BAN_REASON.NON_US_SIGNUP
    })
    mockedUserCtrl.createStudent.mockImplementation(() =>
      // @ts-expect-error
      Promise.resolve(bannedStudent)
    )
    mockedIpAddressService.getIpWhoIs.mockImplementationOnce(async () => {
      // eslint-disable-next-line
      return { country_code: 'RU', org: 'example' }
    })

    // Test payload
    const serviceStudent = await AuthService.registerStudent(
      buildStudentRegistrationForm(studentOpenOverrides)
    )

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(IpAddressService.getIpWhoIs).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createStudent).toHaveBeenCalledTimes(1)
    expect(MailService.sendBannedUserAlert).toHaveBeenCalledTimes(1)

    // return student object
    expect(serviceStudent.isBanned).toBeTruthy()
    expect(serviceStudent.banReason).toEqual(USER_BAN_REASON.NON_US_SIGNUP)
  })

  test('Register valid banned student via bad ISP', async () => {
    const bannedStudent = buildStudent({
      ...studentOpenOverrides,
      isBanned: true,
      banReason: USER_BAN_REASON.BANNED_SERVICE_PROVIDER
    })
    mockedUserCtrl.createStudent.mockImplementation(() =>
      // @ts-expect-error
      Promise.resolve(bannedStudent)
    )
    mockedIpAddressService.getIpWhoIs.mockImplementationOnce(async () => {
      // eslint-disable-next-line
      return { country_code: 'US', org: 'Example' }
    })

    // Test payload
    const serviceStudent = await AuthService.registerStudent(
      buildStudentRegistrationForm(studentOpenOverrides)
    )

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(IpAddressService.getIpWhoIs).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createStudent).toHaveBeenCalledTimes(1)
    expect(MailService.sendBannedUserAlert).toHaveBeenCalledTimes(1)

    // return student object
    expect(serviceStudent.isBanned).toBeTruthy()
    expect(serviceStudent.banReason).toEqual(
      USER_BAN_REASON.BANNED_SERVICE_PROVIDER
    )
  })

  test('Register invalid student form via falsy terms', async () => {
    let err: RegistrationError
    try {
      await AuthService.registerStudent(
        buildStudentRegistrationForm({
          ...studentOpenOverrides,
          terms: false
        })
      )
      expect(true).toEqual(false)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual('Must accept the user agreement')
  })

  test('Register valid open student via working referral', async () => {
    const firstStudent = buildStudent(studentOpenOverrides)
    const code = firstStudent._id.toString()
    await insertStudent(studentOpenOverrides)

    const secondStudent = buildStudent({
      ...studentPartnerOverrides,
      referredByCode: code,
      referredBy: firstStudent._id
    })

    mockedUserCtrl.createStudent.mockImplementationOnce(
      // @ts-expect-error
      async () => secondStudent
    )
    mockedUserCtrl.checkReferral.mockImplementationOnce(async () => code)
    mockedAnalyticsService.captureEvent.mockImplementationOnce(async () => {
      /* do nothing */
    })

    const postStudent = await AuthService.registerStudent(
      buildStudentRegistrationForm({
        ...studentPartnerOverrides,
        referredByCode: code
      })
    )

    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(IpAddressService.getIpWhoIs).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createStudent).toHaveBeenCalledTimes(1)

    expect(postStudent.referredBy).toEqual(firstStudent._id)
  })

  test('Register valid open volunteer', async () => {
    mockedUserCtrl.createVolunteer.mockImplementation(() =>
      // @ts-expect-error
      Promise.resolve(volunteerOpen)
    )

    // Test payload
    const serviceVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm()
    )

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(UserService.getUser).toHaveBeenCalledTimes(1) // validate fresh phone
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createVolunteer).toHaveBeenCalledTimes(1)

    // return student object
    expect(serviceVolunteer).toMatchObject(volunteerOpen)
  })

  test('Register valid partner volunteer', async () => {
    mockedUserCtrl.createVolunteer.mockImplementation(() =>
      // @ts-expect-error
      Promise.resolve(volunteerPartner)
    )

    // Test payload
    const serviceVolunteer = await AuthService.registerPartnerVolunteer(
      buildPartnerVolunteerRegistrationForm(volunteerPartnerOverrides)
    )

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(UserService.getUser).toHaveBeenCalledTimes(1) // validate fresh phone
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createVolunteer).toHaveBeenCalledTimes(1)

    // return student object
    expect(serviceVolunteer).toMatchObject(volunteerPartner)
  })

  test('Register invalid open volunteer via existing phone', async () => {
    await insertVolunteer({
      phone: volunteerOpen.phone
    })

    // Test payload
    let err: LookupError
    try {
      await AuthService.registerVolunteer(
        buildVolunteerRegistrationForm({
          phone: volunteerOpen.phone
        })
      )
      expect(true).toEqual(false) // fail assertion if registerVolunteer doesn't throw
    } catch (error) {
      err = error
    }
    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(UserService.getUser).toHaveBeenCalledTimes(1) // validate fresh phone - fails

    expect(err).toBeInstanceOf(LookupError)
    expect(err.message).toEqual(
      'The phone number you entered is already in use'
    )
  })

  test('Register invalid partner volunteer via bad org', async () => {
    // Test payload
    const form = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      volunteerPartnerOrg: 'bad org'
    })
    let err: RegistrationError
    try {
      await AuthService.registerPartnerVolunteer(form)
      expect(true).toEqual(false) // fail assertion if registerPartnerVolunteer doesn't throw
    } catch (error) {
      err = error
    }

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1)
    expect(UserService.getUser).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual('Invalid volunteer partner organization')
  })

  test('Register invalid partner volunteer via bad email domain', async () => {
    // Test payload
    const form = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      volunteerPartnerOrg: 'example2',
      email: 'email@baddomain.bad'
    })
    let err: RegistrationError
    try {
      await AuthService.registerPartnerVolunteer(form)
      expect(true).toEqual(false) // fail assertion if registerPartnerVolunteer doesn't throw
    } catch (error) {
      err = error
    }

    // assert callstack expectations
    expect(UserModel.find).toHaveBeenCalledTimes(1)
    expect(UserService.getUser).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual(
      'Invalid email domain for volunteer partner organization'
    )
  })

  test('Register invalid open volunteer form via falsy terms', async () => {
    let err: RegistrationError
    try {
      await AuthService.registerVolunteer(
        buildVolunteerRegistrationForm({
          terms: false
        })
      )
      expect(true).toEqual(false)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual('Must accept the user agreement')
  })

  test('Register valid open volunteer via working referral', async () => {
    const firstVolunteer = buildVolunteer(volunteerPartnerOverrides)
    const code = firstVolunteer._id.toString()
    await insertVolunteer()

    const secondVolunteer = buildVolunteer({
      referredByCode: code,
      referredBy: firstVolunteer._id
    })

    mockedUserCtrl.createVolunteer.mockImplementationOnce(
      // @ts-expect-error
      async () => secondVolunteer
    )
    mockedUserCtrl.checkReferral.mockImplementationOnce(async () => code)
    mockedAnalyticsService.captureEvent.mockImplementationOnce(async () => {
      /* do nothing */
    })

    const postVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm({
        referredByCode: code
      })
    )

    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(UserService.getUser).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createVolunteer).toHaveBeenCalledTimes(1)

    expect(postVolunteer.referredBy).toEqual(firstVolunteer._id)
  })

  test('Register invalid partner volunteer form via falsy terms', async () => {
    let err: RegistrationError
    try {
      await AuthService.registerPartnerVolunteer(
        buildPartnerVolunteerRegistrationForm({
          ...volunteerPartnerOverrides,
          terms: false
        })
      )
      expect(true).toEqual(false)
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(RegistrationError)
    expect(err.message).toEqual('Must accept the user agreement')
  })

  test('Register valid partner volunteer via working referral', async () => {
    const firstVolunteer = buildVolunteer()
    const code = firstVolunteer._id.toString()
    await insertVolunteer()

    const secondVolunteer = buildVolunteer({
      ...volunteerPartnerOverrides,
      referredByCode: code,
      referredBy: firstVolunteer._id
    })

    mockedUserCtrl.createVolunteer.mockImplementationOnce(
      // @ts-expect-error
      async () => secondVolunteer
    )
    mockedUserCtrl.checkReferral.mockImplementationOnce(async () => code)
    mockedAnalyticsService.captureEvent.mockImplementationOnce(async () => {
      /* do nothing */
    })

    const postVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm({
        ...volunteerPartnerOverrides,
        referredByCode: code
      })
    )

    expect(UserModel.find).toHaveBeenCalledTimes(1) // validate fresh email
    expect(UserService.getUser).toHaveBeenCalledTimes(1)
    expect(UserCtrl.checkReferral).toHaveBeenCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledTimes(1)
    expect(UserCtrl.createVolunteer).toHaveBeenCalledTimes(1)

    expect(postVolunteer.referredBy).toEqual(firstVolunteer._id)
  })
})

describe('Password reset tests', () => {
  beforeEach(async () => {
    await resetDb()
    jest.clearAllMocks()
  })

  // Spy on models
  jest.spyOn(UserModel, 'findOne')

  // test objects
  const user = buildStudent()

  test('Initiate valid reset', async () => {
    mockedMailService.sendReset.mockImplementationOnce(() => {
      /* do nothing */
    })
    await insertStudent({
      email: user.email
    })

    await AuthService.sendReset(user.email)

    // assert callstack expectations
    expect(UserModel.findOne).toHaveBeenCalledTimes(1)
    expect(MailService.sendReset).toHaveBeenCalledWith(
      expect.objectContaining({ email: user.email })
    )
    const postReset = await UserModel.findOne(
      { email: user.email },
      { passwordResetToken: 1 }
    )
      .lean()
      .exec()
    expect(postReset.passwordResetToken).toBeDefined()
  })

  test('Confirm valid reset', async () => {
    mockedMailService.sendReset.mockImplementationOnce(() => {
      /* do nothing */
    })
    const token = '0123456789abcdef0123456789abcdef'
    const newPassword = 'Password456'

    await insertStudent({
      email: user.email,
      passwordResetToken: token
    })

    await AuthService.confirmReset({
      email: user.email,
      password: newPassword,
      token: token
    })

    expect(UserModel.findOne).toHaveBeenCalledTimes(1)
    const postConfirm = await UserModel.findOne(
      { email: user.email },
      { passwordResetToken: 1, password: 1 }
    )
      .lean()
      .exec()

    expect(postConfirm.passwordResetToken).toBeUndefined()
    expect(compareSync(newPassword, postConfirm.password)).toBeTruthy()
  })

  test('Initiate invalid reset via bad email', async () => {
    const badEmail = 'email@baddomain.bad'

    let err: LookupError
    try {
      await AuthService.sendReset(badEmail)
      expect(true).toBe(false) // fail assertion if sendReset doesn't throw
    } catch (error) {
      err = error
    }

    // assert callstack expectations
    expect(UserModel.findOne).toHaveBeenCalledTimes(1)

    expect(err).toBeInstanceOf(LookupError)
    expect(err.message).toEqual(`No account with ${badEmail} found`)
  })

  // Redundant test of email typecheck due to a previous security vulnerability
  // that used an array of emails to have reset tokens sent to the attacker's email
  test('Initiate invalid reset via malformed email as array', async () => {
    const badEmail = ['victim@email.com', 'attacker@blackhat.bad']

    let err: InputError
    try {
      await AuthService.sendReset(badEmail)
      expect(true).toBe(false) // fail assertion if sendReset doesn't throw
    } catch (error) {
      err = error
    }

    // assert callstack expectations
    expect(UserModel.findOne).toHaveBeenCalledTimes(0)

    expect(err).toBeInstanceOf(InputError)
    expect(err.message).toContain('is not a string')
  })

  test('Confirm invalid reset via bad token', async () => {
    const badToken = ''

    let err: ResetError
    try {
      await AuthService.confirmReset({
        email: '',
        password: '',
        token: badToken
      })
      expect(true).toBe(false) // fail assertion if sendReset doesn't throw
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(ResetError)
    expect(err.message).toBe('Invalid password reset token')
  })

  test('Confirm invalid reset via unlisted token', async () => {
    const unlistedToken = '0123456789abcdef0123456789abcdef'

    let err: LookupError
    try {
      await AuthService.confirmReset({
        email: '',
        password: '',
        token: unlistedToken
      })
      expect(true).toBe(false) // fail assertion if sendReset doesn't throw
    } catch (error) {
      err = error
    }

    expect(UserModel.findOne).toHaveBeenCalledTimes(1)
    expect(err).toBeInstanceOf(LookupError)
    expect(err.message).toBe(
      'No account found with provided password reset token'
    )
  })

  test('Confirm invalid reset via unmatched token', async () => {
    const badEmail = 'email@baddomain.bad'
    const unmatchedToken = '0123456789abcdef0123456789abcdef'

    await insertStudent({
      email: user.email, // good email
      passwordResetToken: unmatchedToken
    })

    let err: ResetError
    try {
      await AuthService.confirmReset({
        email: badEmail,
        password: '',
        token: unmatchedToken
      })
      expect(true).toBe(false) // fail assertion if sendReset doesn't throw
    } catch (error) {
      err = error
    }

    expect(UserModel.findOne).toHaveBeenCalledTimes(1)
    expect(err).toBeInstanceOf(ResetError)
    expect(err.message).toBe('Email did not match the password reset token')
  })
})
