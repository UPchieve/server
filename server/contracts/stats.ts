import type { HeatMap } from '../utils/session-utils'

export type WaitTimeHeatMapResponse = {
  heatMap: HeatMap
}

export type VolunteerStatsResponse = {
  ongoingSessions: number
  studentsOnline: number
}
