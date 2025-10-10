import { mocked } from 'jest-mock'

import * as UserRepo from '../../models/User/queries'
import * as VolunteerPartnerOrgRepo from '../../models/VolunteerPartnerOrg/queries'
import * as MailService from '../../services/MailService'
import * as UserCtrl from '../../controllers/UserCtrl'
import * as NotificationsRepo from '../../models/Notification/queries'
import * as ReferralService from '../../services/ReferralService'

import * as AuthService from '../../services/AuthService'
import {
  RegistrationError,
  ResetError,
  checkPassword,
  verifyPassword,
} from '../../utils/auth-utils'
import { InputError, LookupError } from '../../models/Errors'
import {
  buildUserRow,
  buildUserContactInfo,
  buildVolunteerPartnerOrg,
  buildVolunteer,
} from '../mocks/generate'
import {
  buildVolunteerRegistrationForm,
  buildPartnerVolunteerRegistrationForm,
} from '../mocks/services/AuthService.mock'
import { getDbUlid } from '../../models/pgUtils'

// Mocks
jest.mock('../../models/User/queries')
const mockedUserRepo = mocked(UserRepo)
jest.mock('../../models/School/queries')
jest.mock('../../models/ZipCode/queries')
jest.mock('../../models/StudentPartnerOrg/queries')
jest.mock('../../models/VolunteerPartnerOrg/queries')
const mockedVolunteerPartnerOrgRepo = mocked(VolunteerPartnerOrgRepo)
jest.mock('../../controllers/UserCtrl')
const mockedUserCtrl = mocked(UserCtrl)
jest.mock('../../services/IpAddressService')
const mockedNotificationsRepo = mocked(NotificationsRepo)
jest.mock('../../models/Notification/queries')
const mockedReferralService = mocked(ReferralService)
jest.mock('../../services/ReferralService')

jest.mock('../../services/VolunteerService')
jest.mock('../../services/MailService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../services/QueueService', () => ({
  add: jest.fn(),
}))

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
    expect(password).toThrow(
      new RegistrationError('Password must be 8 characters or longer')
    )
  })

  test('Check invalid password via no uppercase', () => {
    function password() {
      return checkPassword('password123')
    }
    expect(password).toThrow(
      new RegistrationError(
        'Password must contain at least one uppercase letter'
      )
    )
  })

  test('Check invalid password via no lowercase', () => {
    function password() {
      return checkPassword('PASSWORD123')
    }
    expect(password).toThrow(
      new RegistrationError(
        'Password must contain at least one lowercase letter'
      )
    )
  })

  test('Check invalid password via no number', () => {
    function password() {
      return checkPassword('PasswordABC')
    }
    expect(password).toThrow(
      new RegistrationError('Password must contain at least one number')
    )
  })
})

describe('Registration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test objects
  const mockedVolunteerPartnerOrg = buildVolunteerPartnerOrg()
  const plainUser = buildUserRow()

  const volunteerPartnerOverrides = {
    volunteerPartnerOrg: mockedVolunteerPartnerOrg.key,
  }
  const volunteerOpen = buildVolunteer()
  const volunteerPartner = buildVolunteer(volunteerPartnerOverrides)

  test('Check valid credentials', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValueOnce(undefined)
    const payload = {
      email: plainUser.email,
      password: plainUser.password,
    }

    const result = await AuthService.checkCredential(payload)
    expect(result).toBeTruthy()
  })

  test('Check invalid credentials via no email', async () => {
    const payload = {
      email: '',
      password: plainUser.password,
    }

    const t = async <T>(p: T) => await AuthService.checkCredential(p)

    await expect(t(payload)).rejects.toThrow(
      new InputError('Must supply an email and password for registration')
    )
  })

  test('Check invalid credentials via no password', async () => {
    const payload = {
      email: plainUser.email,
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
      password: plainUser.password,
    }

    const t = async <T>(p: T) => await AuthService.checkCredential(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Must supply a valid email address')
    )
  })

  test('Register valid open volunteer', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    mockedReferralService.getReferrerIdByCode.mockResolvedValue(undefined)
    mockedUserCtrl.createVolunteer.mockResolvedValue({
      ...volunteerOpen,
      userType: 'volunteer',
    })

    const serviceVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm()
    )
    expect(serviceVolunteer).toMatchObject(volunteerOpen)
  })

  test('Register valid partner volunteer', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    mockedReferralService.getReferrerIdByCode.mockResolvedValue(undefined)
    mockedUserCtrl.createVolunteer.mockResolvedValue({
      ...volunteerPartner,
      userType: 'volunteer',
    })
    mockedVolunteerPartnerOrgRepo.getVolunteerPartnerOrgForRegistrationByKey.mockResolvedValueOnce(
      mockedVolunteerPartnerOrg
    )

    const serviceVolunteer = await AuthService.registerPartnerVolunteer(
      buildPartnerVolunteerRegistrationForm(volunteerPartnerOverrides)
    )

    expect(serviceVolunteer).toMatchObject(volunteerPartner)
  })

  test('Register invalid open volunteer via existing phone', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(getDbUlid())

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
    const badPartnerOrg = 'bad-org'
    const errorMsg = `no volunteer partner org found with key ${badPartnerOrg}`
    mockedVolunteerPartnerOrgRepo.getVolunteerPartnerOrgForRegistrationByKey.mockRejectedValueOnce(
      errorMsg
    )

    const payload = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      volunteerPartnerOrg: badPartnerOrg,
    })
    const t = async <T>(p: T) => await AuthService.registerPartnerVolunteer(p)

    await expect(t(payload)).rejects.toThrow(
      new RegistrationError('Invalid volunteer partner organization')
    )
  })

  test('Register invalid partner volunteer via bad email domain', async () => {
    mockedUserRepo.getUserIdByEmail.mockResolvedValue(undefined)
    mockedUserRepo.getUserIdByPhone.mockResolvedValue(undefined)
    mockedVolunteerPartnerOrgRepo.getVolunteerPartnerOrgForRegistrationByKey.mockResolvedValueOnce(
      { ...mockedVolunteerPartnerOrg, domains: ['bogus'] }
    )

    const payload = buildPartnerVolunteerRegistrationForm({
      ...volunteerPartnerOverrides,
      volunteerPartnerOrg: mockedVolunteerPartnerOrg.key,
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
    const referrer = buildVolunteer()
    const referree = buildVolunteer({ referredBy: referrer.id })
    mockedReferralService.getReferrerIdByCode.mockResolvedValue(referrer.id)
    mockedUserCtrl.createVolunteer.mockResolvedValue({
      ...referree,
      userType: 'volunteer',
    })
    mockedUserRepo.countReferredUsers.mockResolvedValue(0)
    mockedNotificationsRepo.getEmailNotificationsByTemplateId.mockResolvedValue(
      []
    )

    const serviceVolunteer = await AuthService.registerVolunteer(
      buildVolunteerRegistrationForm({
        referredByCode: referrer.id,
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
    mockedVolunteerPartnerOrgRepo.getVolunteerPartnerOrgForRegistrationByKey.mockResolvedValueOnce(
      mockedVolunteerPartnerOrg
    )
    const referrer = buildVolunteer()
    const referree = buildVolunteer({ referredBy: referrer.id })
    mockedReferralService.getReferrerIdByCode.mockResolvedValue(referrer.id)
    mockedUserCtrl.createVolunteer.mockResolvedValue({
      ...referree,
      userType: 'volunteer',
    })

    const serviceVolunteer = await AuthService.registerPartnerVolunteer(
      buildPartnerVolunteerRegistrationForm({
        ...volunteerPartnerOverrides,
        referredByCode: referrer.id,
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
  const user = buildUserRow()
  const userContactInfo = buildUserContactInfo()

  test('Initiate valid reset for email', async () => {
    mockedUserRepo.getUserForPassport.mockResolvedValue(user)

    await AuthService.sendReset(user.email)

    expect(MailService.sendReset).toHaveBeenCalledWith(
      user.email,
      expect.anything()
    )
    expect(UserRepo.updateUserResetTokenById).toHaveBeenCalledWith(
      user.id,
      expect.anything()
    )
  })

  test('Confirm valid reset', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(userContactInfo)
    const token = '0123456789abcdef0123456789abcdef'
    const newPassword = 'Password456'

    await AuthService.confirmReset({
      email: userContactInfo.email,
      password: newPassword,
      newpassword: newPassword,
      token: token,
    })

    expect(UserRepo.updateUserPasswordById).toHaveBeenCalledWith(
      userContactInfo.id,
      expect.anything()
    )
    const computedHash = mockedUserRepo.updateUserPasswordById.mock.calls[0][1]
    await expect(
      verifyPassword(newPassword, computedHash)
    ).resolves.toBeTruthy()
  })

  test('Initiate invalid reset via bad email', async () => {
    mockedUserRepo.getUserForPassport.mockResolvedValue(undefined)

    const badEmail = 'email@baddomain.bad'
    const t = async <T>(p: T) => await AuthService.sendReset(p)

    await expect(t(badEmail)).rejects.toThrow(
      new LookupError(`No account with ${badEmail} found`)
    )
  })

  // Redundant test of email typecheck due to a previous security vulnerability
  // that used an array of emails to have reset tokens sent to the attacker's email
  test('Initiate invalid reset via malformed email as array', async () => {
    mockedUserRepo.getUserForPassport.mockResolvedValue(undefined)

    const badEmail = ['victim@email.com', 'attacker@blackhat.bad']
    const t = async <T>(p: T) => await AuthService.sendReset(p)

    await expect(t(badEmail)).rejects.toThrow(InputError)
  })

  test('Confirm invalid reset via bad token', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(userContactInfo)

    const payload = {
      email: user.email,
      password: 'Password456',
      newpassword: 'Password456',
      token: 'bad token',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new ResetError(
        'Invalid password reset token. Please use the link provided in the latest password reset email you received from UPchieve.'
      )
    )
  })

  test('Confirm invalid reset via unlisted token', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(undefined)

    const payload = {
      email: user.email,
      password: 'Password456',
      newpassword: 'Password456',
      token: '0123456789abcdef0123456789abcdef',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new LookupError(
        'No account found with provided password reset token. Please use the link provided in the latest password reset email you received from UPchieve.'
      )
    )
  })

  test('Confirm invalid reset via unmatched token', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(userContactInfo)

    const payload = {
      email: 'different email',
      password: 'Password456',
      newpassword: 'Password456',
      token: '0123456789abcdef0123456789abcdef',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new ResetError('Email did not match the password reset token.')
    )
  })

  test('Confirm mismatch passwords', async () => {
    mockedUserRepo.getUserByResetToken.mockResolvedValue(userContactInfo)

    const payload = {
      email: 'different email',
      password: 'Password123',
      newpassword: 'Password456',
      token: '0123456789abcdef0123456789abcdef',
    }

    const t = async <T>(p: T) => await AuthService.confirmReset(p)

    await expect(t(payload)).rejects.toThrow(
      new ResetError('The passwords you entered do not match.')
    )
  })
})
