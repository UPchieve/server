import { Types } from 'mongoose'
import ContactFormSubmissionModel, { ContactFormSubmission } from './index'
import { getUserById } from '../User/queries'
import { RepoCreateError } from '../Errors'

export async function createContactFormByUser(
  message: string,
  topic: string,
  userId: Types.ObjectId
): Promise<ContactFormSubmission> {
  // validate that the user exists
  const user = await getUserById(userId)
  if (!user) throw new RepoCreateError(`User ${userId} does not exist`)
  try {
    const data = await ContactFormSubmissionModel.create({
      message,
      topic,
      userId: user._id,
      userEmail: user.email,
    })
    if (data) return data.toObject() as ContactFormSubmission
    else throw new RepoCreateError('Create query did not return created object')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}

export async function createContactFormByEmail(
  message: string,
  topic: string,
  userEmail: string
): Promise<ContactFormSubmission> {
  try {
    const data = await ContactFormSubmissionModel.create({
      message,
      topic,
      userEmail,
    })
    if (data) return data.toObject() as ContactFormSubmission
    else throw new RepoCreateError('Create query did not return created object')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}
