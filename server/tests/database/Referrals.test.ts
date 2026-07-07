/**
 * @group database/parallel
 */

import { faker } from '@faker-js/faker'
import { getClient } from '../../db'
import { insertSingleRow } from '../db-utils'
import { buildUserRow, buildUserRole } from '../mocks/generate'
import { getReferredUsersWithFilter } from '../../models/Referrals'

const client = getClient()

test('getReferredUsersWithFilter', async () => {
  const referralCodes = [
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
  ]
  const referrer = await insertSingleRow(
    'users',
    buildUserRow({
      phoneVerified: true,
      emailVerified: true,
      referralCode: referralCodes[0],
    }),
    client
  )
  let actual = await getReferredUsersWithFilter(referrer.id)
  expect(actual.length).toEqual(0)

  // Volunteer
  const referredUser1 = await insertSingleRow(
    'users',
    buildUserRow({
      phoneVerified: false,
      emailVerified: false,
      referralCode: referralCodes[1],
    }),
    client
  )
  await insertSingleRow(
    'users_roles',
    buildUserRole(referredUser1.id, 'volunteer'),
    client
  )
  await insertSingleRow(
    'referrals',
    { referredBy: referrer.id, userId: referredUser1.id },
    client
  )

  // Student and volunteer
  const referredUser2 = await insertSingleRow(
    'users',
    buildUserRow({
      phoneVerified: false,
      emailVerified: true,
      referralCode: referralCodes[2],
    }),
    client
  )
  await insertSingleRow(
    'users_roles',
    buildUserRole(referredUser2.id, 'student'),
    client
  )
  await insertSingleRow(
    'users_roles',
    buildUserRole(referredUser2.id, 'volunteer'),
    client
  )
  await insertSingleRow(
    'referrals',
    { referredBy: referrer.id, userId: referredUser2.id },
    client
  )
  actual = await getReferredUsersWithFilter(referrer.id)
  expect(actual.length).toEqual(2)

  // Now test the filters
  const onlyStudents = await getReferredUsersWithFilter(referrer.id, {
    withRoles: ['student'],
  })
  const onlyStudentVolunteers = await getReferredUsersWithFilter(referrer.id, {
    withRoles: ['student', 'volunteer'],
  })
  const onlyVolunteers = await getReferredUsersWithFilter(referrer.id, {
    withRoles: ['volunteer'],
  })

  const onlyVerified = await getReferredUsersWithFilter(referrer.id, {
    withPhoneOrEmailVerified: true,
  })
  const onlyVerifiedVolunteers = await getReferredUsersWithFilter(referrer.id, {
    withPhoneOrEmailVerified: true,
    withRoles: ['volunteer'],
  })

  expect(onlyStudents.length).toEqual(1)
  expect(onlyStudentVolunteers.length).toEqual(1)
  expect(onlyVolunteers.length).toEqual(2)

  expect(onlyVerified.length).toEqual(1)
  expect(onlyVerifiedVolunteers.length).toEqual(1)
})
