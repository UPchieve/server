import type { ISODateString } from './shared.js'

export type NTHSChecklistItemStatus = 'complete' | 'incomplete' | 'skipped'

export type NTHSChecklistResourcePublic = {
  label: string
  url?: string
}

export type NTHSChecklistItemPublic = {
  key: string
  order: number
  title: string
  description?: string
  dueDate?: ISODateString
  resources: NTHSChecklistResourcePublic[]
  checkable: boolean
  skippable: boolean
  status: NTHSChecklistItemStatus
}

export type NTHSChecklistSectionPublic = {
  id: number
  title: string
  order: number
  items: NTHSChecklistItemPublic[]
}

export type NTHSChecklistPublic = {
  sections: NTHSChecklistSectionPublic[]
}

export type NTHSChecklistResponse = {
  checklist: NTHSChecklistPublic
}

export type UpdateNTHSChecklistItemProgressRequest = {
  status: NTHSChecklistItemStatus
}

export type UpdateNTHSChecklistItemProgressResponse = {
  itemKey: string
  status: NTHSChecklistItemStatus
}
