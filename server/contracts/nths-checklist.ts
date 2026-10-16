export type NTHSChecklistResource = {
  label: string
  url?: string
}

export type NTHSChecklistItem = {
  key: string
  order: number
  title: string
  description?: string
  daysToComplete?: number
  resources: NTHSChecklistResource[]
  checkable: boolean
  skippable: boolean
}

export type NTHSChecklistSection = {
  id: number
  title: string
  order: number
  items: NTHSChecklistItem[]
}

export type NTHSChecklist = {
  spreadsheetId: string
  sections: NTHSChecklistSection[]
}
