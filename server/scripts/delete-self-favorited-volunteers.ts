import { deleteSelfFavoritedVolunteers } from '../models/Student'
import { deleteSelfFavoritedVolunteersActions } from '../models/UserAction'

/**
 *
 * This is a one-time script that removes volunteers who were able to favorite themselves
 * via a bug on the platform. This script also removes the associated user actions
 * that are created when a user is favorited.
 *
 */
export default async function main(): Promise<void> {
  await deleteSelfFavoritedVolunteers()
  await deleteSelfFavoritedVolunteersActions()
}
