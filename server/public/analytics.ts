import type { AnalyticPersonPropertiesPublic } from '../contracts/analytics'
import type { AnalyticPersonProperties } from '../services/AnalyticsService'

export function toAnalyticPersonPropertiesPublic(
  properties: AnalyticPersonProperties
): AnalyticPersonPropertiesPublic {
  const {
    certificationStats,
    createdAt,
    fallIncentiveEnrollmentAt,
    ...personProperties
  } = properties

  return {
    ...personProperties,
    ...certificationStats,
    createdAt: createdAt.toISOString(),
    fallIncentiveEnrollmentAt: fallIncentiveEnrollmentAt?.toISOString() ?? null,
  }
}
