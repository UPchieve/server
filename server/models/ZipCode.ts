import { Document, model, Model, Schema, Types } from 'mongoose'

const MEDIUM_INCOME_THRESHOLD = 60000

export interface ZipCode {
  _id: Types.ObjectId
  zipCode: string
  medianIncome: number
  isEligible: boolean
}

export type ZipCodeDocument = ZipCode & Document

const zipCodeSchema = new Schema({
  zipCode: {
    type: String,
    unique: true,
    required: true
  },
  medianIncome: Number
})

zipCodeSchema.virtual('isEligible').get(function(): boolean {
  if (!this.medianIncome) return true

  return this.medianIncome < MEDIUM_INCOME_THRESHOLD
})

zipCodeSchema.statics.findByZipCode = function(
  zipCode: string
): Promise<ZipCodeDocument> {
  return this.findOne({ zipCode })
}

export interface ZipCodeStaticModel extends Model<ZipCodeDocument> {
  findByZipCode(zipCode: string): Promise<ZipCodeDocument>
}
const ZipCodeModel = model<ZipCodeDocument, ZipCodeStaticModel>(
  'ZipCode',
  zipCodeSchema
)

module.exports = ZipCodeModel
export default ZipCodeModel
