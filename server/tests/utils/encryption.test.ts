import { encrypt, decrypt } from '../../utils/encryption'

jest.mock('../../worker/logger')

describe('encryption utils', () => {
  const validKey = 'a'.repeat(64)
  const alternateKey = 'b'.repeat(64)

  describe('encrypt', () => {
    test('returns a base64 encoded string', () => {
      const plaintext = 'hello world'
      const result = encrypt(plaintext, validKey)

      expect(() => Buffer.from(result, 'base64')).not.toThrow()
      expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    test('produces different ciphertext for same plaintext due to IV', () => {
      const plaintext = 'hello world'
      const result1 = encrypt(plaintext, validKey)
      const result2 = encrypt(plaintext, validKey)

      expect(result1).not.toBe(result2)
    })

    test('encrypted payload has correct length (IV + auth tag + ciphertext)', () => {
      const plaintext = 'test'
      const result = encrypt(plaintext, validKey)
      const decoded = Buffer.from(result, 'base64')

      // Minimum size: 12 bytes IV + 16 bytes auth tag + at least 1 byte ciphertext
      expect(decoded.length).toBeGreaterThanOrEqual(12 + 16 + 1)
    })

    test('handles empty string', () => {
      const plaintext = ''
      const result = encrypt(plaintext, validKey)

      expect(result).toBeTruthy()
    })

    test('handles unicode characters', () => {
      const plaintext = 'Héllo, World'
      const result = encrypt(plaintext, validKey)

      expect(result).toBeTruthy()
      expect(() => Buffer.from(result, 'base64')).not.toThrow()
    })

    test('handles long strings', () => {
      const plaintext = 'x'.repeat(10000)
      const result = encrypt(plaintext, validKey)

      expect(result).toBeTruthy()
    })

    test('throws on invalid key length', () => {
      const plaintext = 'hello'
      const shortKey = 'a'.repeat(32) // Only 16 bytes, needs 32.

      expect(() => encrypt(plaintext, shortKey)).toThrow('Encryption failed')
    })

    test('throws on invalid hex key', () => {
      const plaintext = 'hello'
      const invalidHexKey = 'g'.repeat(64) // 'g' is not valid hex.

      expect(() => encrypt(plaintext, invalidHexKey)).toThrow(
        'Encryption failed'
      )
    })
  })

  describe('decrypt', () => {
    test('decrypts encrypted data back to original plaintext', () => {
      const plaintext = 'hello world'
      const encrypted = encrypt(plaintext, validKey)
      const decrypted = decrypt(encrypted, validKey)

      expect(decrypted).toBe(plaintext)
    })

    test('handles empty string roundtrip', () => {
      const plaintext = ''
      const encrypted = encrypt(plaintext, validKey)
      const decrypted = decrypt(encrypted, validKey)

      expect(decrypted).toBe(plaintext)
    })

    test('handles unicode characters roundtrip', () => {
      const plaintext = 'Héllo, World'
      const encrypted = encrypt(plaintext, validKey)
      const decrypted = decrypt(encrypted, validKey)

      expect(decrypted).toBe(plaintext)
    })

    test('handles special characters roundtrip', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~\n\t\r'
      const encrypted = encrypt(plaintext, validKey)
      const decrypted = decrypt(encrypted, validKey)

      expect(decrypted).toBe(plaintext)
    })

    test('handles long strings roundtrip', () => {
      const plaintext = 'x'.repeat(10000)
      const encrypted = encrypt(plaintext, validKey)
      const decrypted = decrypt(encrypted, validKey)

      expect(decrypted).toBe(plaintext)
    })

    test('throws when using wrong key', () => {
      const plaintext = 'hello world'
      const encrypted = encrypt(plaintext, validKey)

      expect(() => decrypt(encrypted, alternateKey)).toThrow(
        'Decryption failed'
      )
    })

    test('throws on tampered ciphertext', () => {
      const plaintext = 'hello world'
      const encrypted = encrypt(plaintext, validKey)

      const decoded = Buffer.from(encrypted, 'base64')
      decoded[decoded.length - 1] ^= 0xff // Flip bits in the ciphertext.
      const tampered = decoded.toString('base64')

      expect(() => decrypt(tampered, validKey)).toThrow('Decryption failed')
    })

    test('throws on tampered auth tag', () => {
      const plaintext = 'hello world'
      const encrypted = encrypt(plaintext, validKey)

      const decoded = Buffer.from(encrypted, 'base64')
      decoded[15] ^= 0xff // Flip bits in the auth tag.
      const tampered = decoded.toString('base64')

      expect(() => decrypt(tampered, validKey)).toThrow('Decryption failed')
    })

    test('throws on invalid base64 input', () => {
      const invalidBase64 = '!!!invalid!!!'

      expect(() => decrypt(invalidBase64, validKey)).toThrow(
        'Decryption failed'
      )
    })

    test('throws on empty string input', () => {
      expect(() => decrypt('', validKey)).toThrow('Decryption failed')
    })

    test('encrypted data from different keys cannot be decrypted by each other', () => {
      const plaintext = 'secret message'
      const encrypted1 = encrypt(plaintext, validKey)
      const encrypted2 = encrypt(plaintext, alternateKey)

      expect(decrypt(encrypted1, validKey)).toBe(plaintext)
      expect(decrypt(encrypted2, alternateKey)).toBe(plaintext)
      expect(() => decrypt(encrypted1, alternateKey)).toThrow(
        'Decryption failed'
      )
      expect(() => decrypt(encrypted2, validKey)).toThrow('Decryption failed')
    })
  })
})
