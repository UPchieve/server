import { UserSessionMetrics } from '../../models/UserSessionMetrics'
import { Session, MessageForFrontend } from '../../models/Session'
import { getEnumKeyByEnumValue } from '../../utils/enum-utils'
import { USER_SESSION_METRICS } from '../../constants'
import { PostsessionSurveyResponse } from '../../models/Survey'

export interface UpdateValueData {
  session: Session // a completed session
  messages: MessageForFrontend[]
  surveyResponses?: PostsessionSurveyResponse[]
}

export interface ProcessorData {
  session: Session
  studentUSM: UserSessionMetrics
  volunteerUSM?: UserSessionMetrics
  value: number
}

type MetricUpdateQuery = { [key: string]: number }

export interface MetricProcessor {
  key: USER_SESSION_METRICS // metric name
  requiresFeedback: boolean
  // computes value to update metric based on uvd.session
  computeUpdateValue(uvd: UpdateValueData): number
  // computes list of review reasons to be set on session
  computeReviewReason(pd: ProcessorData): USER_SESSION_METRICS[]
  // computes list of flags to set on session
  computeFlag(pd: ProcessorData): USER_SESSION_METRICS[]
  // compiles list of side-effect promises to execute on behalf of this metric
  triggerActions(pd: ProcessorData): Promise<void>[]
  computeStudentUpdateQuery(pd: ProcessorData): MetricUpdateQuery
  computeVolunteerUpdateQuery(pd: ProcessorData): MetricUpdateQuery
}

export abstract class CounterMetricProcessor implements MetricProcessor {
  protected computeFinalValue = (
    usm: UserSessionMetrics,
    value: number
  ): number => {
    if (!usm) return 0
    const key = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    // Do nothing if one of these keys shows
    if (key === 'coachReportedStudentDm' || key === 'studentReportedCoachDm')
      return 0
    if (key) return usm[key] + value
    throw new Error(`Counter metric processor key ${this.key} is invalid`)
  }

  // must be implemented by subclasses
  public abstract key: USER_SESSION_METRICS
  public abstract requiresFeedback: boolean
  public abstract computeUpdateValue(uvd: UpdateValueData): number
  public abstract computeReviewReason(pd: ProcessorData): USER_SESSION_METRICS[]
  public abstract computeFlag(pd: ProcessorData): USER_SESSION_METRICS[]
  public abstract triggerActions(pd: ProcessorData): Promise<void>[]
  public computeStudentUpdateQuery = (pd: ProcessorData): MetricUpdateQuery => {
    const metric = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    if (!metric) throw new Error(`Metric for ${this.key} undefined`)
    const finalValue = this.computeFinalValue(pd.studentUSM, pd.value)
    return { [metric]: finalValue }
  }
  public computeVolunteerUpdateQuery = (
    pd: ProcessorData
  ): MetricUpdateQuery => {
    if (!pd.volunteerUSM) return {}
    const metric = getEnumKeyByEnumValue(USER_SESSION_METRICS, this.key)
    if (!metric) throw new Error(`Metric for ${this.key} undefined`)
    const finalValue = this.computeFinalValue(pd.volunteerUSM, pd.value)
    return { [metric]: finalValue }
  }
}

export const NO_FLAGS = [] as USER_SESSION_METRICS[]

export const NO_ACTIONS = []
