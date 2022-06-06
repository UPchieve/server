import { removeOnboardedStatusForUnqualifiedVolunteers } from '../models/Volunteer'

/**
 *
 * The purpose of this script is to remove the onboarding status
 * for volunteers from 2022 who were able to become onboarded without completing
 * the UPchieve 101 quiz.
 *
 **/

export default async function(): Promise<void> {
  await removeOnboardedStatusForUnqualifiedVolunteers()
}
