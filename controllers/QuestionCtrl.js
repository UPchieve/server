const Question = require('../models/Question')

const list = async (filters, cb) => {
  return Question.find(filters)
}

const create = async attrs => {
  return Question.create(attrs)
}

const update = async options => {
  const { id, question } = options

  return Question.findOneAndUpdate(
    { _id: id },
    { $set: question },
    { new: true, upsert: true }
  )
}

const destroy = async questionId => {
  return Question.findByIdAndDelete(questionId)
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
const categories = async () => {
  const categories = await Question.aggregate([
    {
      $match: {}
    },
    {
      $project: {
        _id: 0,
        category: 1,
        subcategory: 1
      }
    },
    {
      $group: {
        _id: '$subcategory',
        category: {
          $first: '$category'
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    },
    {
      $group: {
        _id: '$category',
        subcategories: {
          $push: '$_id'
        }
      }
    },
    {
      $project: {
        category: '$_id',
        subcategories: 1
      }
    },
    {
      $sort: {
        category: 1,
        subcategories: 1
      }
    }
  ])
  // TODO: we are making this complex so we can reduce it on the other end,
  // refactor this to just be able to return categories
  const tuples = []
  for (const category of categories) {
    tuples.push([category.category, category.subcategories])
  }
  return tuples
}

module.exports = {
  list,
  create,
  update,
  destroy,
  categories
}
