export type EditorActivitySource = 'whiteboard' | 'quill'

export type SessionEditorActivity = {
  id: string
  sessionId: string
  userId: string
  source: EditorActivitySource
  createdAt: Date
}

export type InsertSessionEditorActivityArgs = Pick<
  SessionEditorActivity,
  'sessionId' | 'userId' | 'source'
>
