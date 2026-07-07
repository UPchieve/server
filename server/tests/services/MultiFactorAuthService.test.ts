import { mocked } from 'jest-mock'
import crypto from 'crypto'
import { totp } from 'notp'

import * as TotpRepo from '../../models/Totp'
import * as encryption from '../../utils/encryption'
import * as MultiFactorAuthService from '../../services/MultiFactorAuthService'
import {
  AlreadyEnrolledTotp,
  TotpEnrollError,
} from '../../services/MultiFactorAuthService'
import { buildUserContactInfo } from '../mocks/generate'
import { RepoReadError } from '../../models/Errors'

jest.mock('crypto')
const mockedCrypto = mocked(crypto)

jest.mock('notp')
const mockedTotp = mocked(totp)

jest.mock('../../models/Totp')
const mockedTotpRepo = mocked(TotpRepo)

jest.mock('../../utils/encryption')
const mockedEncryption = mocked(encryption)

const RANDOM_BYTES = Buffer.from('12345678901234567890')
const TOTP_PERIOD_IN_SECONDS = 30

function buildTotpRecord(
  overrides: Partial<TotpRepo.Totp> = {}
): TotpRepo.Totp {
  return {
    userId: 'test-user-id',
    secret: 'encrypted-secret',
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('MultiFactorAuthService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('generateTotpSecret', () => {
    beforeEach(() => {
      mockedEncryption.encrypt.mockReturnValue('encrypted-secret')
      // @ts-ignore
      mockedCrypto.randomBytes.mockReturnValue(RANDOM_BYTES)
    })

    test('generates and stores TOTP secret for user without existing TOTP', async () => {
      const mockUser = buildUserContactInfo({ id: 'totp-enroll-success' })
      const result = await MultiFactorAuthService.generateTotpSecret(mockUser)

      expect(result).toBeDefined()
      expect(result).toContain('otpauth://totp/')
      expect(result).toContain(encodeURIComponent(`upchieve:${mockUser.email}`))
      expect(result).toContain('issuer=upchieve-test')
      expect(result).toContain(`period=${TOTP_PERIOD_IN_SECONDS}`)
      expect(mockedTotpRepo.addSecretForUser).toHaveBeenCalledWith(
        mockUser.id,
        'encrypted-secret'
      )
      expect(mockedEncryption.encrypt).toHaveBeenCalledWith(
        RANDOM_BYTES.toString('hex'),
        'test-encryption-key'
      )
    })

    test('generates and stores TOTP secret for user with unverified TOTP', async () => {
      const mockUser = buildUserContactInfo({ id: 'totp-enroll-fail' })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(
        buildTotpRecord({ verified: false })
      )
      mockedTotpRepo.addSecretForUser.mockResolvedValue(undefined)

      const result = await MultiFactorAuthService.generateTotpSecret(mockUser)

      expect(result).toBeDefined()
      expect(result).toContain('otpauth://totp/')
      expect(mockedTotpRepo.addSecretForUser).toHaveBeenCalled()
    })

    test('throws AlreadyEnrolledTotp when user has verified TOTP', async () => {
      const mockUser = buildUserContactInfo({ id: 'totp-already-enrolled' })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(
        buildTotpRecord({ verified: true })
      )

      await expect(
        MultiFactorAuthService.generateTotpSecret(mockUser)
      ).rejects.toThrow(AlreadyEnrolledTotp)
      expect(mockedTotpRepo.addSecretForUser).not.toHaveBeenCalled()
    })

    test('throws TotpEnrollError on unexpected database error', async () => {
      const mockUser = buildUserContactInfo({ id: 'totp-unexpected-error' })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(undefined)
      mockedTotpRepo.addSecretForUser.mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(
        MultiFactorAuthService.generateTotpSecret(mockUser)
      ).rejects.toThrow(TotpEnrollError)
    })

    test('properly URL-encodes email with special characters', async () => {
      const mockUser = buildUserContactInfo({
        id: 'totp-special-email',
        email: 'user+tag@example.com',
      })
      const result = await MultiFactorAuthService.generateTotpSecret(mockUser)

      expect(result).toBeDefined()
      expect(result).toContain('upchieve%3Auser%2Btag%40example.com')
      expect(result).not.toContain('user+tag@')
    })

    test('throws TotpEnrollError when INSERT conflicts with existing verified record', async () => {
      const mockUser = buildUserContactInfo({ id: 'totp-conflict' })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(undefined)
      mockedTotpRepo.addSecretForUser.mockRejectedValue(new Error())

      await expect(
        MultiFactorAuthService.generateTotpSecret(mockUser)
      ).rejects.toThrow(TotpEnrollError)
    })
  })

  describe('verifyTotpToken', () => {
    const userId = 'test-user-id'
    const token = '123456'
    const decryptedHexKey = '3132333435363738393031323334353637383930'

    beforeEach(() => {
      mockedEncryption.decrypt.mockReturnValue(decryptedHexKey)
    })

    test('returns true and updates record for valid token', async () => {
      const totpRecord = buildTotpRecord({ lastUsedCounter: 100 })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue({ delta: 0 })
      const currentCounter = 150000
      const mockNow = TOTP_PERIOD_IN_SECONDS * currentCounter * 1000
      jest.spyOn(Date, 'now').mockReturnValue(mockNow)

      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(result).toBe(true)
      expect(mockedTotpRepo.updateSecretForUser).toHaveBeenCalledWith(userId, {
        lastUsedCounter: currentCounter,
        verified: true,
      })
    })

    test('returns false for invalid token', async () => {
      const totpRecord = buildTotpRecord()
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue(null)

      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(result).toBe(false)
      expect(mockedTotpRepo.updateSecretForUser).not.toHaveBeenCalled()
    })

    test('returns false when token counter has already been used (replay attack)', async () => {
      const mockNow = TOTP_PERIOD_IN_SECONDS * 1000 * 1000
      jest.spyOn(Date, 'now').mockReturnValue(mockNow)

      const currentCounter = Math.floor(mockNow / 1000 / TOTP_PERIOD_IN_SECONDS)
      const totpRecord = buildTotpRecord({ lastUsedCounter: currentCounter })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue({ delta: 0 })

      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(result).toBe(false)
      expect(mockedTotpRepo.updateSecretForUser).not.toHaveBeenCalled()
    })

    test('returns false when user has no TOTP enrolled', async () => {
      mockedTotpRepo.getSecretForUser.mockResolvedValue(undefined)
      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)
      expect(result).toBe(false)
    })

    test('returns false on decryption error', async () => {
      const totpRecord = buildTotpRecord()
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedEncryption.decrypt.mockImplementation(() => {
        throw new Error('Decryption failed')
      })

      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(result).toBe(false)
    })

    test('accepts token from previous period (window=1)', async () => {
      const totpRecord = buildTotpRecord({ lastUsedCounter: 100 })
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)

      mockedTotp.verify.mockReturnValue({ delta: -1 })

      const currentCounter = 150
      const mockNow = TOTP_PERIOD_IN_SECONDS * currentCounter * 1000
      jest.spyOn(Date, 'now').mockReturnValue(mockNow)

      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(result).toBe(true)
      expect(mockedTotpRepo.updateSecretForUser).toHaveBeenCalledWith(userId, {
        lastUsedCounter: currentCounter - 1,
        verified: true,
      })
    })

    test('passes correct options to totp.verify', async () => {
      const totpRecord = buildTotpRecord()
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue(null)

      await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(mockedTotp.verify).toHaveBeenCalledWith(
        token,
        expect.any(Buffer),
        {
          time: TOTP_PERIOD_IN_SECONDS,
          window: 1,
        }
      )
    })

    test('returns false for empty token string', async () => {
      const totpRecord = buildTotpRecord()
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue(null)

      const result = await MultiFactorAuthService.verifyTotpToken(userId, '')

      expect(result).toBe(false)
    })

    test('returns false for token with non-numeric characters', async () => {
      const totpRecord = buildTotpRecord()
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue(null)

      const result = await MultiFactorAuthService.verifyTotpToken(
        userId,
        'abc123'
      )

      expect(result).toBe(false)
    })

    test('returns false for token that is too long', async () => {
      const totpRecord = buildTotpRecord()
      mockedTotpRepo.getSecretForUser.mockResolvedValue(totpRecord)
      mockedTotp.verify.mockReturnValue(null)

      const result = await MultiFactorAuthService.verifyTotpToken(
        userId,
        '12345678901234567890'
      )

      expect(result).toBe(false)
    })

    test('returns false on database error', async () => {
      mockedTotpRepo.getSecretForUser.mockRejectedValue(
        new RepoReadError('Error')
      )

      const result = await MultiFactorAuthService.verifyTotpToken(userId, token)

      expect(result).toBe(false)
    })
  })
})
