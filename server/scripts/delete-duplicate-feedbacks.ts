import { removeDuplicateFeedbacks } from '../models/Feedback/queries'

export default async function DeleteDuplicateFeedbacks() {
  await removeDuplicateFeedbacks()
}
