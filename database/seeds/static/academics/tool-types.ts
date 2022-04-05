import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function toolTypes(): Promise<NameToId> {
  const tools = ['whiteboard', 'documenteditor']
  const temp: NameToId = {}
  for (const tool of tools) {
    temp[tool] = await wrapInsert('tool_types', pgQueries.insertToolType.run, {
      name: tool,
    })
  }
  return temp
}
