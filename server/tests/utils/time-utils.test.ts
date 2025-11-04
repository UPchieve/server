import {
  hoursInMs,
  hoursInSeconds,
  minutesInMs,
  minutesInSeconds,
  secondsInMs,
} from '../../utils/time-utils'

describe('secondsInMs', () => {
  it.each([
    [0, 0],
    [1, 1000],
    [2, 2000],
  ])('Gives the correct value', (seconds, ms) => {
    expect(secondsInMs(seconds)).toEqual(ms)
  })
})

describe('minutesInMs', () => {
  it.each([
    [0, 0],
    [1, 1 * 60 * 1000],
    [2, 2 * 60 * 1000],
    [3, 3 * 60 * 1000],
  ])('Gives the correct value', (minutes, ms) => {
    expect(minutesInMs(minutes)).toEqual(ms)
  })
})

describe('hoursInMs', () => {
  it.each([
    [0, 0],
    [1, 1 * 60 * 60 * 1000],
    [2, 2 * 60 * 60 * 1000],
    [3, 3 * 60 * 60 * 1000],
  ])('Gives the correct value', (hours, ms) => {
    expect(hoursInMs(hours)).toEqual(ms)
  })
})

describe('minutesInSeconds', () => {
  it.each([
    [0, 0],
    [1, 1 * 60],
    [2, 2 * 60],
    [3, 3 * 60],
  ])('Gives the correct value', (minutes, seconds) => {
    expect(minutesInSeconds(minutes)).toEqual(seconds)
  })
})

describe('hoursInSeconds', () => {
  it.each([
    [0, 0],
    [1, 1 * 60 * 60],
    [2, 2 * 60 * 60],
  ])('Gives the correct value', (hours, seconds) => {
    expect(hoursInSeconds(hours)).toEqual(seconds)
  })
})
