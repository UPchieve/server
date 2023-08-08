import { getStudentContactInfoById } from '../../models/Student'
import { Ulid } from 'id128'

test('Make a connection', async () => {
  const result = await getStudentContactInfoById(Ulid.generate().toRaw())
  expect(result).toBeUndefined()
})
