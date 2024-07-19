import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function signupSources(): Promise<NameToId> {
  const sources = [
    { name: 'Web search' },
    { name: 'Social media' },
    {
      name: 'Friend / Classmate',
    },
    {
      name: 'School / Teacher',
    },
    {
      name: 'Parent / Relative',
    },
    { name: 'Other' },
  ]
  const temp: NameToId = {}
  for (const source of sources) {
    temp[source.name] = await wrapInsert(
      'signup_sources',
      pgQueries.insertSignupSource.run,
      { ...source }
    )
  }
  return temp
}
