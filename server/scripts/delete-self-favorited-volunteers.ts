import { deleteSelfFavoritedVolunteers } from '../models/Student'
import { deleteSelfFavoritedVolunteersActions } from '../models/UserAction'

export default async function main(): Promise<void> {
  await deleteSelfFavoritedVolunteers()
  await deleteSelfFavoritedVolunteersActions()
}
