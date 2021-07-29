import refiner from 'refiner-js'
import { events } from '../consts'

/**
 * Identifies a user with Refiner purely with userId and no other metadata.
 * @param {string} userId - The user's id to register with Refiner
 */
export function identify(userId) {
  refiner('identifyUser', {
    id: userId
  })
}

/**
 * Identifies a user with Refiner with the userType 'student'.
 * @param {string} userId - The user's id to register with Refiner as a student
 */
export function registerStudent(userId) {
  refiner('identifyUser', {
    id: userId,
    userType: 'student'
  })
}

/**
 * Identifies a user with Refiner with the userType 'volunteer'.
 * @param {string} userId - The user's id to register with Refiner as a student
 */
export function registerVolunteer(userId) {
  refiner('identifyUser', {
    id: userId,
    userType: 'volunteer'
  })
}

/**
 * Tracks an arbitrary event with Refiner by the string passed to it.
 * The event must be from the events list in consts.
 * @param {string} eventName
 * @return {boolean}
 */
export function trackEvent(eventName) {
  if (events[eventName]) {
    refiner('trackEvent', eventName)
    return true
  } else {
    throw new Error('survey event to track must come from events list')
  }
}
