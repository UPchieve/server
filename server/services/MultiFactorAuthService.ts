import crypto from 'crypto'
import { totp } from 'notp'
import * as base32 from 'thirty-two'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import * as TotpRepo from '../models/Totp'
import { decrypt, encrypt } from '../utils/encryption'
import type { UserContactInfo } from '../models/User'
import logger from '../logger'
import { CustomError } from 'ts-custom-error'
import { CaughtError } from '../router/res-error'

export class AlreadyEnrolledTotp extends CaughtError {
  readonly httpStatus = 422
  readonly clientMessage = 'TOTP is already enrolled for this account'
}
export class TotpEnrollError extends CaughtError {
  readonly httpStatus = 500
  readonly clientMessage = 'Failed to enroll TOTP. Please try again later.'
}

// Recommended TOTP key length from RFC.
const TOTP_KEY_LENGTH = 20
// How many seconds are within each counter.
const TOTP_PERIOD_IN_SECONDS = 30
// Allow 1 period before and after the current counter to account for clock drift.
const TOTP_WINDOW_SIZE = 1

export async function generateTotpSecret(
  user: UserContactInfo
): Promise<string | undefined> {
  try {
    const existingTotp = await TotpRepo.getSecretForUser(user.id)
    if (existingTotp?.verified) {
      throw new AlreadyEnrolledTotp('TOTP already enrolled', {
        userId: user.id,
      })
    }

    const key = crypto.randomBytes(TOTP_KEY_LENGTH)

    const secret = encrypt(hexEncode(key), config.totpEncryptionKey)
    await TotpRepo.addSecretForUser(user.id, secret)

    const encoded = base32.encode(key).toString()
    const label = encodeURIComponent('upchieve:' + user.email)
    const qrUrl = `otpauth://totp/${label}?secret=${encoded}&issuer=${config.totpIssuer}&period=${TOTP_PERIOD_IN_SECONDS}`
    return qrUrl
  } catch (err) {
    if (err instanceof CustomError) {
      throw err
    }
    throw new TotpEnrollError('TOTP enroll failed', { userId: user.id }, err)
  }
}

export async function verifyTotpToken(
  userId: Ulid,
  token: string
): Promise<boolean> {
  try {
    if (!isValidToken(token)) {
      logger.warn(
        { userId, token },
        'User attempting to verify invalid TOTP token'
      )
      return false
    }

    const totpRecord = await TotpRepo.getSecretForUser(userId)
    if (!totpRecord) {
      logger.warn(
        { userId },
        'User attempting to verify TOTP token before enrollment'
      )
      return false
    }

    const hexKey = decrypt(totpRecord.secret, config.totpEncryptionKey)

    const result = totp.verify(token, hexDecode(hexKey), {
      time: TOTP_PERIOD_IN_SECONDS,
      window: TOTP_WINDOW_SIZE,
    })
    if (!result) {
      logger.warn({ userId }, 'Invalid TOTP token')
      return false
    }

    // To prevent a replay attack, make sure that the currently calculated counter
    // (calculated as number of TOTP_PERIOD_IN_SECONDS since Unix) is greater than
    // the counter last used for TOTP.
    const unixTimeInSeconds = Date.now() / 1000
    const currentCounter = Math.floor(
      unixTimeInSeconds / TOTP_PERIOD_IN_SECONDS
    )
    const usedCounter = currentCounter + result.delta
    const lastUsedCounter = totpRecord.lastUsedCounter ?? -1
    if (usedCounter <= lastUsedCounter) {
      return false
    }

    const options: TotpRepo.UpdateSecretForUserInput = {
      lastUsedCounter: usedCounter,
    }
    if (totpRecord.verified) {
      logger.info({ userId }, 'User verified TOTP')
    } else {
      logger.info({ userId }, 'User enrolled in TOTP')
      options.verified = true
    }
    await TotpRepo.updateSecretForUser(userId, options)

    return true
  } catch (err) {
    logger.error({ err, userId }, 'Failed to verify TOTP token')
    return false
  }
}

function hexEncode(b: Buffer): string {
  return b.toString('hex')
}

function hexDecode(s: string): Buffer {
  return Buffer.from(s, 'hex')
}

function isValidToken(token: string): boolean {
  return /^\d{6}$/.test(token)
}
