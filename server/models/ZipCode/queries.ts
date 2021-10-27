import ZipCodeModel, { ZipCode } from './index'
import { RepoReadError } from '../Errors'

export async function getZipCodeByZipCode(
  zipCode: string
): Promise<ZipCode | undefined> {
  try {
    const zc = await ZipCodeModel.findOne({ zipCode })
      .lean()
      .exec()
    if (zc) return zc as ZipCode
  } catch (err) {
    throw new RepoReadError(err)
  }
}
