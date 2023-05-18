import { titlecaseSchoolNames } from '../services/SchoolService'

/**
 * This is a one-time script to titlecase any school names that are
 * all uppercased.
 */
export default async function main() {
  await titlecaseSchoolNames()
}
