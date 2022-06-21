import { removeDuplicateFeedbacks } from '../models/Feedback/queries'

export default async function DeleteDuplicateFeedbacks() {
  try {
    await removeDuplicateFeedbacks()
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
  }
}
