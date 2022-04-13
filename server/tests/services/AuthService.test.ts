test.skip('postgres migration', () => 1)
/*import { mocked } from 'ts-jest/utils'
import { GRADES } from '../../constants'

import {
  buildStudent,
  buildStudentRegistrationForm,
  buildPartnerStudentRegistrationForm,
  buildVolunteer,
  buildVolunteerRegistrationForm,
  buildPartnerVolunteerRegistrationForm,
  buildSchool,
  getObjectId,
} from '../generate'

import { User } from '../../models/User'
import * as UserRepo from '../../models/User/queries'
import * as SchoolRepo from '../../models/School/queries'
import * as MailService from '../../services/MailService'
import * as IpAddressService from '../../services/IpAddressService'
import * as UserCtrl from '../../controllers/UserCtrl'

import * as AuthService from '../../services/AuthService'
import {
  RegistrationError,
  ResetError,
  checkPassword,
  hashPassword,
  verifyPassword,
} from '../../utils/auth-utils'
import { NotAllowedError, InputError, LookupError } from '../../models/Errors'

// Mocks
jest.mock('../../models/User/queries')
const mockedUserRepo = mocked(UserRepo, true)
jest.mock('../../models/School/queries')
const mockedSchoolRepo = mocked(SchoolRepo, true)
jest.mock('../../controllers/UserCtrl')
const mockedUserCtrl = mocked(UserCtrl, true)
jest.mock('../../services/IpAddressService')
const mockedIpAddressService = mocked(IpAddressService, true)

jest.mock('../../services/VolunteerService')
jest.mock('../../services/MailService')
jest.mock('../../services/AnalyticsService')

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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test objects
  const ip = { country_code: 'US', org: 'example' }
  const highSchool = buildSchool()
  const studentOpenOverrides = {
    zipCode: '11201',
    highSchoolId: '111111111111',
    currentGrade: GRADES.EIGHTH,
  }
  const studentPartnerOverrides = {
    studentPartnerOrg: 'example',
    studentPartnerSite: 'example.org',
    partnerUserId: '123',
    college: 'UPchieve University',
  }
  const studentOpen = buildStudent({
    ...studentOpenOverrides,
    approvedHighSchool: highSchool._id,
    highSchoolId: undefined,
  })
  const studentPartner = buildStudent(studentPartnerOverrides)

  const volunteerPartnerOverrides = {
    volunteerPartnerOrg: 'example',
  }
  const volunteerOpen = buildVolunteer()
  const volunteerPartner = buildVolunteer(volunteerPartnerOverrides)

  test('Check valid credentials', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined)
    const payload = {
      email: studentOpen.email,
      password: studentOpen.password,
    }

    const result = await AuthService.checkCredential(payload)
    expect(result).toBeTruthy()
  })

  test('Check invalid credentials via no email', async () => {
    const payload = {
      email: '',
      password: studentOpen.password,
    }

    const t = async <T>(p: T) => await AuthService.checkCredential(p)

    await expect(t(payload)).rejects.toThrow(
      new InputError('Must supply an email and password for registration')
    )
  })

  test('Check invalid credentials via no password', async () => {
    const payload = {
      email: studentOpen.email,
      password: '',
    }

    const t = async <T>(p: T) => await AuthService.checkCredential(p)

    await expect(t(payload)).rejects.toThrow(
      new InputError('Must supply an email and password for registration')
    )
  })

  test('Check invalid credentials via bad email', async () => {
    const payload = {
      email: 'bad email',
      password: studentOpen.password,
    }

    const t = async <T>(p: T) => await AuthService.checkCredential(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Must supply a valid email address')
    )
  })

  test('Register valid open student', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue(ip)
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValue(highSchool)
    mockedUserCtrl.checkReferral.mockResolvedValue(undefined)
    mockedUserCtrl.createStudent.mockResolvedValue(studentOpen)

    const serviceStudent = await AuthService.registerOpenStudent(
      buildStudentRegistrationForm(studentOpenOverrides)
    )

    expect(serviceStudent).toMatchObject(studentOpen)
  })

  test('Register valid partner student', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue(ip)
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValue(highSchool)
    mockedUserCtrl.checkReferral.mockResolvedValue(undefined)
    mockedUserCtrl.createStudent.mockResolvedValue(studentPartner)

    const serviceStudent = await AuthService.registerPartnerStudent(
      buildPartnerStudentRegistrationForm(studentPartnerOverrides)
    )

    expect(serviceStudent).toMatchObject(studentPartner)
  })

  test('Register invalid open student via existing email', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(getObjectId())

    const payload = buildStudentRegistrationForm({
      ...studentOpenOverrides,
      email: studentOpen.email,
    })
    const t = async <T>(p: T) => await AuthService.registerOpenStudent(p)

    await expect(t(payload)).rejects.toThrow(
      new LookupError('The email address you entered is already in use')
    )
  })

  test('Register invalid open student via bad school', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue(ip)
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValue(
      buildSchool({
        isApproved: false,
      })
    )

    const payload = buildStudentRegistrationForm({
      ...studentOpenOverrides,
      zipCode: '', // check for school not zip
    })
    const t = async <T>(p: T) => await AuthService.registerOpenStudent(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError(`School ${payload.highSchoolId} is not approved`)
    )
  })

  test('Register invalid partner student via bad org', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)

    const payload = buildPartnerStudentRegistrationForm({
      ...studentPartnerOverrides,
      studentPartnerOrg: 'bad org',
    })
    const t = async <T>(p: T) => await AuthService.registerPartnerStudent(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Invalid student partner organization')
    )
  })

  test('Register invalid open student via bad country', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue({
      country_code: 'RU',
      org: 'example',
    })

    const payload = buildStudentRegistrationForm({
      ...studentOpenOverrides,
    })
    const t = async <T>(p: T) => await AuthService.registerOpenStudent(p)

    await expect(t(payload)).rejects.toThrow(
      new NotAllowedError('Cannot register from an international IP address')
    )
  })

  test('Register invalid open student form via falsy terms', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue(ip)

    const payload = buildStudentRegistrationForm({
      ...studentOpenOverrides,
      terms: false,
    })
    const t = async <T>(p: T) => await AuthService.registerOpenStudent(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Must accept the user agreement')
    )
  })

  test('Register valid open student via working referral', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedIpAddressService.getIpWhoIs.mockResolvedValue(ip)
    mockedSchoolRepo.findSchoolByUpchieveId.mockResolvedValue(highSchool)
    const referrer = buildStudent({})
    const referree = buildStudent({
      ...studentOpenOverrides,
      referredBy: referrer._id,
      referredByCode: referrer._id.toString(),
      approvedHighSchool: highSchool._id,
      highSchoolId: undefined,
    })
    mockedUserCtrl.checkReferral.mockResolvedValue(referrer._id)
    mockedUserCtrl.createStudent.mockResolvedValue(referree)

    const serviceStudent = await AuthService.registerOpenStudent(
      buildStudentRegistrationForm({
        ...studentOpenOverrides,
        referredByCode: referrer._id.toString(),
      })
    )

    expect(serviceStudent).toMatchObject(referree)
  })

  test('Register valid open volunteer', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    mockedUserCtrl.checkReferral.mockResolvedValue(undefined)
    mockedUserCtrl.createVolunteer.mockResolvedValue(volunteerOpen)

    const serviceVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm()
    )
    expect(serviceVolunteer).toMatchObject(volunteerOpen)
  })

  test('Register valid partner volunteer', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    mockedUserCtrl.checkReferral.mockResolvedValue(undefined)
    mockedUserCtrl.createVolunteer.mockResolvedValue(volunteerPartner)

    const serviceVolunteer = await AuthService.registerPartnerVolunteer(
      buildPartnerVolunteerRegistrationForm(volunteerPartnerOverrides)
    )

    expect(serviceVolunteer).toMatchObject(volunteerPartner)
  })

  test('Register invalid open volunteer via existing phone', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(getObjectId())

    const payload = buildVolunteerRegistrationForm({
      phone: volunteerOpen.phone,
    })
    const t = async <T>(p: T) => await AuthService.registerVolunteer(p)

    await expect(t(payload)).rejects.toThrow(
      new LookupError('The phone number you entered is already in use')
    )
  })

  test('Register invalid partner volunteer via bad org', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)

    const payload = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      volunteerPartnerOrg: 'bad org',
    })
    const t = async <T>(p: T) => await AuthService.registerPartnerVolunteer(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Invalid volunteer partner organization')
    )
  })

  test('Register invalid partner volunteer via bad email domain', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)

    const payload = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      volunteerPartnerOrg: 'example2',
      email: 'email@baddomain.bad',
    })
    const t = async <T>(p: T) => await AuthService.registerPartnerVolunteer(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError(
        'Invalid email domain for volunteer partner organization'
      )
    )
  })

  test('Register invalid open volunteer form via falsy terms', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)

    const payload = buildVolunteerRegistrationForm({
      terms: false,
    })
    const t = async <T>(p: T) => await AuthService.registerVolunteer(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Must accept the user agreement')
    )
  })

  test('Register valid open volunteer via working referral', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    const referrer = buildVolunteer({})
    const referree = buildVolunteer({
      referredBy: referrer._id,
      referredByCode: referrer._id.toString(),
    })
    mockedUserCtrl.checkReferral.mockResolvedValue(referrer._id)
    mockedUserCtrl.createVolunteer.mockResolvedValue(referree)

    const serviceVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm({
        referredByCode: referrer._id.toString(),
      })
    )

    expect(serviceVolunteer).toMatchObject(referree)
  })

  test('Register invalid partner volunteer form via falsy terms', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)

    const payload = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      terms: false,
    })
    const t = async <T>(p: T) => await AuthService.registerPartnerVolunteer(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Must accept the user agreement')
    )
  })

  test('Register valid partner volunteer via working referral', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    const referrer = buildVolunteer({})
    const referree = buildVolunteer({
      ...volunteerPartnerOverrides,
      referredBy: referrer._id,
      referredByCode: referrer._id.toString(),
    })
    mockedUserCtrl.checkReferral.mockResolvedValue(referrer._id)
    mockedUserCtrl.createVolunteer.mockResolvedValue(referree)

    const serviceVolunteer = await AuthService.registerPartnerVolunteer(
      buildPartnerVolunteerRegistrationForm({
        ...volunteerPartnerOverrides,
        referredByCode: referrer._id.toString(),
      })
    )

    expect(serviceVolunteer).toMatchObject(referree)
  })
})

describe('Password reset tests', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  // test objects
  const user = buildStudent()

  test('Initiate valid reset', async () => {
    mockedUserRepo.getUserByEmail.mockResolvedValue(user as User)

    await AuthService.sendReset(user.email)

    expect(MailService.sendReset).toHaveBeenCalledWith(
      user.email,
      expect.anything()
    )
    expect(UserRepo.updateUserResetTokenById).toHaveBeenCalledWith(
      user._id,
      expect.anything()
    )
  })

  test('Confirm valid reset', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(user as User)
    const token = '0123456789abcdef0123456789abcdef'
    const newPassword = 'Password456'

    await AuthService.confirmReset({
      email: user.email,
      password: newPassword,
      token: token,
    })

    expect(UserRepo.updateUserPasswordById).toHaveBeenCalledWith(
      user._id,
      expect.anything()
    )
    const computedHash = mockedUserRepo.updateUserPasswordById.mock.calls[0][1]
    await expect(
      verifyPassword(newPassword, computedHash)
    ).resolves.toBeTruthy()
  })

  test('Initiate invalid reset via bad email', async () => {
    mockedUserRepo.getUserByEmail.mockResolvedValue(undefined)

    const badEmail = 'email@baddomain.bad'
    const t = async <T>(p: T) => await AuthService.sendReset(p)

    await expect(t(badEmail)).rejects.toThrow(
      new LookupError(`No account with ${badEmail} found`)
    )
  })

  // Redundant test of email typecheck due to a previous security vulnerability
  // that used an array of emails to have reset tokens sent to the attacker's email
  test('Initiate invalid reset via malformed email as array', async () => {
    mockedUserRepo.getUserByEmail.mockResolvedValue(undefined)

    const badEmail = ['victim@email.com', 'attacker@blackhat.bad']
    const t = async <T>(p: T) => await AuthService.sendReset(p)

    await expect(t(badEmail)).rejects.toThrow(InputError)
  })

  test('Confirm invalid reset via bad token', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(user as User)

    const payload = {
      email: user.email,
      password: 'Password456',
      token: 'bad token',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new ResetError('Invalid password reset token')
    )
  })

  test('Confirm invalid reset via unlisted token', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(undefined)

    const payload = {
      email: user.email,
      password: 'Password456',
      token: '0123456789abcdef0123456789abcdef',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new LookupError('No account found with provided password reset token')
    )
  })

  test('Confirm invalid reset via unmatched token', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(user as User)

    const payload = {
      email: 'different email',
      password: 'Password456',
      token: '0123456789abcdef0123456789abcdef',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new ResetError('Email did not match the password reset token')
    )
  })
})
*/
