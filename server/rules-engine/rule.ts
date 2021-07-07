import { 
  RuleProperties,
  Event,
  ConditionProperties,
} from 'json-rules-engine'
import { USER_FACT, getUser } from './fact'

const BANNED_USER_EVENT = {
  type: 'bannedUserEvent',
} as Event

const USER_IS_BANNED = {
  fact: USER_FACT.id,
  path: '$.isBanned',
  operator: 'equal',
  value: true
} as ConditionProperties

export const EMAIL_BANNED_USER = {
  name: 'emailBannedUser',
  conditions: {
    all: [USER_IS_BANNED],
  },
  event: BANNED_USER_EVENT,
  onSuccess: async function(event, almanac): Promise<void> {
    const user = await getUser(almanac)
    console.log(`Sent email to ${user.firstname}`)
  },
  onFailure: async function(event, almanac): Promise<void> {
    const user = await getUser(almanac)
    console.log(`${user.firstname} is not banned`)
  }
} as RuleProperties