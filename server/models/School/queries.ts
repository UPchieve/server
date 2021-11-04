import { RepoReadError } from '../Errors'
import SchoolModel, { School } from './index'

export async function findSchoolByUpchieveId(
  id: string
): Promise<School | undefined> {
  try {
    const school = await SchoolModel.findOne({ upchieveId: id })
      .lean()
      .exec()
    if (school) return school as School
  } catch (err) {
    throw new RepoReadError(err)
  }
}
