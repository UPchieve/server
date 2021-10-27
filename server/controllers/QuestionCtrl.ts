import QuestionModel, { Question, QuestionDocument } from '../models/Question'

// TODO: repo pattern - whole file

// TODO: duck type validation
export async function list(
  filters: any // FilterQuery<QuestionDocument>[]
): Promise<QuestionDocument[]> {
  return await QuestionModel.find(filters).exec()
}

// TODO: duck type validation
export async function create(question: Question): Promise<Question> {
  return QuestionModel.create(question)
}

// TODO: duck type validation
export interface QuestionUpdateOptions {
  id: string
  question: Partial<Question>
}

export async function update(
  options: QuestionUpdateOptions
): Promise<QuestionDocument> {
  const { id, question } = options

  return QuestionModel.findOneAndUpdate(
    { _id: id },
    { $set: question },
    { new: true, upsert: true }
  )
}

export async function destroy(questionId: string): Promise<QuestionDocument> {
  const deletedQuestion = await QuestionModel.findByIdAndDelete(questionId)
  if (deletedQuestion) return deletedQuestion
  else throw new Error('Question to delete not found')
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
  const categories = await QuestionModel.aggregate([
    {
      $match: {},
    },
    {
      $project: {
        _id: 0,
        category: 1,
        subcategory: 1,
      },
    },
    {
      $group: {
        _id: '$subcategory',
        category: {
          $first: '$category',
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $group: {
        _id: '$category',
        subcategories: {
          $push: '$_id',
        },
      },
    },
    {
      $project: {
        category: '$_id',
        subcategories: 1,
      },
    },
    {
      $sort: {
        category: 1,
        subcategories: 1,
      },
    },
  ])
  // TODO: we are making this complex so we can reduce it on the other end,
  // refactor this to just be able to return categories
  const tuples = []
  for (const category of categories) {
    tuples.push([category.category, category.subcategories])
  }
  return tuples
}
