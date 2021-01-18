import { DocumentQuery, FilterQuery } from 'mongoose';
import QuestionModel, { Question, QuestionDocument } from '../models/Question';

export async function list(
  filters: FilterQuery<QuestionDocument>[]
): Promise<DocumentQuery<QuestionDocument[], QuestionDocument>> {
  return QuestionModel.find(filters);
}

export async function create(question: Question): Promise<Question> {
  return QuestionModel.create(question);
}

export interface QuestionUpdateOptions {
  id: string;
  question: Partial<Question>;
}

export async function update(
  options: QuestionUpdateOptions
): Promise<DocumentQuery<QuestionDocument, QuestionDocument>> {
  const { id, question } = options;

  return QuestionModel.findOneAndUpdate(
    { _id: id },
    { $set: question },
    { new: true, upsert: true }
  );
}

export async function destroy(
  questionId: string
): Promise<DocumentQuery<QuestionDocument, QuestionDocument>> {
  return QuestionModel.findByIdAndDelete(questionId);
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

export async function categories(): any[] {
  const categories = await QuestionModel.find(
    {},
    { _id: 0, category: 1, subcategory: 1 },
    { $group: 'category' }
  );

  const groupedCategories = {};
  categories.forEach(({ category, subcategory }) => {
    if (!groupedCategories[category]) {
      groupedCategories[category] = new Set();
    }
    groupedCategories[category].add(subcategory);
  });

  const tuples = Object.keys(groupedCategories)
    .sort()
    .map(categoryName => [categoryName, [...groupedCategories[categoryName]]]);

  return tuples;
}
