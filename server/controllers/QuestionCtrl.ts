import { Pgid } from '../models/pgUtils'
import {
  Question,
  getCategories,
  listQuestions,
  createQuestion,
  updateQuestion,
  destroy,
} from '../models/Question'

// TODO: duck type validation
export async function list(
  filters: any // FilterQuery<Question>[]
): Promise<Question[]> {
  return await listQuestions(filters)
}

// TODO: duck type validation
export async function create(question: Question): Promise<Question> {
  return await createQuestion(question)
}

// TODO: duck type validation
export interface QuestionUpdateOptions {
  id: Pgid
  question: Question & { id: Pgid }
}

export async function update(
  options: QuestionUpdateOptions
): Promise<Question> {
  return updateQuestion(options)
}

export async function destroyQuestion(questionId: number): Promise<void> {
  try {
    await destroy(questionId)
  } catch (err) {
    throw new Error('question to delete not found')
  }
}

// Return an array of tuples, with each tuple containing a category and array of
// subcategories.
//
// Example:
//
//      [
//         ['algebra', ['linear', 'rational']],
//         ['applications', ['LOR', 'basic']]
//      ]
//

export async function categories(): Promise<any[]> {
  const categories = await getCategories()
  const tuples = []
  for (const category of categories) {
    tuples.push([category.categories, category.subcategories])
  }
  return tuples
}
