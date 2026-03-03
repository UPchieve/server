import crypto from 'crypto'
import logger from '../logger'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH_IN_BYTES = 12
const AUTH_TAG_LENGTH_IN_BYTES = 16

// For AES-256-GCM, this encryption key must be 32 bytes.
// When storing in config, stored as 64 hex characters.
type EncryptionKey = string
type Base64EncodedString = string
// A base64 encoded string with the following concatenated together in order:
// - initialization vector (aka IV) (12 bytes): acts as a nonce to the cipher, so the same plaintext doesn't produce the same ciphertext.
// - auth tag (16 bytes): essentially acts as a "checksum" to ensure the ciphertext wasn't tampered with.
// - ciphertext
type EncryptedPayload = Base64EncodedString

/**
  Encrypts plaintext using AES-256-GCM.

  Returns an `EncryptedPayload`, which is a base64 string containing (in order): IV, auth tag, ciphertext.
*/
export function encrypt(
  plaintext: string,
  encryptionKey: EncryptionKey
): EncryptedPayload {
  try {
    const key = hexToBuffer(encryptionKey)
    const iv = crypto.randomBytes(IV_LENGTH_IN_BYTES)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
  } catch (err) {
    logger.error({ err }, 'Encryption failed')
    throw new Error('Encryption failed')
  }
}

/**
  Decrypts an `EncryptedPayload` that was created by `encrypt()`, returning the original plaintext.

  Extracts the IV and auth tag from the payload, then decrypts the ciphertext.
  Throws if the auth tag doesn't match expected value.
*/
export function decrypt(
  encoded: EncryptedPayload,
  encryptionKey: EncryptionKey
): string {
  try {
    const data = Buffer.from(encoded, 'base64')
    const iv = data.subarray(0, IV_LENGTH_IN_BYTES)
    const authTag = data.subarray(
      IV_LENGTH_IN_BYTES,
      IV_LENGTH_IN_BYTES + AUTH_TAG_LENGTH_IN_BYTES
    )
    const encrypted = data.subarray(
      IV_LENGTH_IN_BYTES + AUTH_TAG_LENGTH_IN_BYTES
    )

    const key = hexToBuffer(encryptionKey)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])
    return decrypted.toString()
  } catch (err) {
    logger.error({ err }, 'Decryption failed')
    throw new Error('Decryption failed')
  }
}

function hexToBuffer(encryptionKey: EncryptionKey): Buffer {
  return Buffer.from(encryptionKey, 'hex')
}
