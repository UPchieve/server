import faker from 'faker'
import { v4 as uuid } from 'uuid'
import * as Cache from '../../cache'
import { KeyNotFoundError } from '../../cache'

test('Should save string content in the cache', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)
  await expect(Cache.save(testKey, testValue)).resolves.not.toThrow()

  await expect(Cache.get(testKey)).resolves.toEqual(testValue)

  // clean up
  await Cache.remove(testKey)
})

test('Should save json stringified content in the cache', async () => {
  const testKey = uuid()
  const testObj = {
    aKey: 'a value',
  }
  const jsonString = JSON.stringify(testObj)
  await expect(Cache.save(testKey, jsonString)).resolves.not.toThrow()

  await expect(Cache.get(testKey)).resolves.toEqual(jsonString)

  // clean up
  await Cache.remove(testKey)
})

test('Should retrieve parse-able json stringified content from the cache', async () => {
  const testKey = uuid()
  const testObj = {
    aKey: 'a value',
  }
  const jsonString = JSON.stringify(testObj)

  await expect(Cache.save(testKey, jsonString)).resolves.not.toThrow()

  const value = await Cache.get(testKey)
  const obj = JSON.parse(value)
  expect(obj).toStrictEqual(testObj)

  // clean up
  await Cache.remove(testKey)
})

test('Should throw KeyNotFoundError if non-existent key is passed', async () => {
  const badKey = uuid()
  await expect(Cache.get(badKey)).rejects.toBeInstanceOf(KeyNotFoundError)
})

test('Should remove a key from the cache', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)
  await expect(Cache.save(testKey, testValue)).resolves.not.toThrow()

  await expect(Cache.remove(testKey)).resolves.not.toThrow()

  await expect(Cache.get(testKey)).rejects.toBeInstanceOf(KeyNotFoundError)
})

test('Should insert key with custom expiry', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)

  await expect(
    Cache.saveWithExpiration(testKey, testValue, 1000)
  ).resolves.not.toThrow()

  const ttl = await Cache.getTimeToExpiration(testKey)
  expect(ttl).toBeGreaterThan(0)
  expect(ttl).toBeLessThan(1001)
})

test('Should insert key with default expiry', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)

  await expect(
    Cache.saveWithExpiration(testKey, testValue)
  ).resolves.not.toThrow()

  const ttl = await Cache.getTimeToExpiration(testKey)
  expect(ttl).toBeGreaterThan(10000)
  expect(ttl).toBeLessThan(86401)
})
