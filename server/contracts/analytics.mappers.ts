import type { AnalyticPersonPropertiesPublic } from './analytics'
import type { AnalyticPersonProperties } from '../services/AnalyticsService'

export function toAnalyticPersonPropertiesPublic(
  properties: Partial<AnalyticPersonProperties>
): Partial<AnalyticPersonPropertiesPublic> {
  const {
    certificationStats,
    createdAt,
    fallIncentiveEnrollmentAt,
    ...personProperties
  } = properties
  return {
    ...personProperties,
    ...certificationStats,
    ...(createdAt !== undefined ? { createdAt: createdAt.toISOString() } : {}),
    ...('fallIncentiveEnrollmentAt' in properties
      ? {
          fallIncentiveEnrollmentAt:
            fallIncentiveEnrollmentAt?.toISOString() ?? null,
        }
      : {}),
  }
}
