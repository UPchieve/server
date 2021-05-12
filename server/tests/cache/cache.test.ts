import faker from 'faker'
import { v4 as uuid } from 'uuid'
import * as Cache from '../../cache'
import { KeyNotFoundError } from '../../cache'

test('Should save string content in the cache', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)
  try {
    await Cache.save(testKey, testValue)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  let value
  try {
    value = await Cache.get(testKey)
  } catch (err) {
    expect(err).toBeUndefined()
  }
  expect(value).toEqual(testValue)

  // clean up
  await Cache.remove(testKey)
})

test('Should save json stringified content in the cache', async () => {
  const testKey = uuid()
  const testObj = {
    aKey: 'a value'
  }
  const jsonString = JSON.stringify(testObj)

  try {
    await Cache.save(testKey, jsonString)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  let value
  try {
    value = await Cache.get(testKey)
  } catch (err) {
    expect(err).toBeUndefined()
  }
  expect(value).toEqual(jsonString)

  // clean up
  await Cache.remove(testKey)
})

test('Should retrieve parse-able json stringified content from the cache', async () => {
  const testKey = uuid()
  const testObj = {
    aKey: 'a value'
  }
  const jsonString = JSON.stringify(testObj)

  try {
    await Cache.save(testKey, jsonString)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  let value
  try {
    value = await Cache.get(testKey)
  } catch (err) {
    expect(err).toBeUndefined()
  }
  const obj = JSON.parse(value)
  expect(obj).toStrictEqual(testObj)

  // clean up
  await Cache.remove(testKey)
})

test('Should throw KeyNotFoundError if non-existent key is passed', async () => {
  const badKey = uuid()

  try {
    await Cache.get(badKey)
  } catch (err) {
    expect(err).toBeInstanceOf(KeyNotFoundError)
  }
})

test('Should remove a key from the cache', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)
  try {
    await Cache.save(testKey, testValue)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  try {
    await Cache.remove(testKey)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  let value
  try {
    value = await Cache.get(testKey)
  } catch (err) {
    expect(err).toBeDefined()
  }
  expect(value).toBeUndefined()
})

test('Should insert key with custom expiry', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)

  try {
    await Cache.saveWithExpiration(testKey, testValue, 1000)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  let ttl
  try {
    ttl = await Cache.getTimeToExpiration(testKey)
  } catch (err) {
    expect(err).toBeUndefined()
  }
  expect(ttl).toBeGreaterThan(0)
  expect(ttl).toBeLessThan(1001)
})

test('Should insert key with default expiry', async () => {
  const testKey = uuid()
  const testValue = faker.lorem.words(10)

  try {
    await Cache.saveWithExpiration(testKey, testValue)
  } catch (err) {
    expect(err).toBeUndefined()
  }

  let ttl
  try {
    ttl = await Cache.getTimeToExpiration(testKey)
  } catch (err) {
    expect(err).toBeUndefined()
  }
  expect(ttl).toBeGreaterThan(10000)
  expect(ttl).toBeLessThan(86401)
})
