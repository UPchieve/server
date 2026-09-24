export type SchoolYear = {
  label: string
  startsAt: Date
  endsAt: Date
}

/**
 * Locate the school year containing `instant`: July 1 through June 30.
 *
 * endsAt is exclusive. All arithmetic is UTC.
 */
export function schoolYearFor(instant: Date): SchoolYear {
  // Month index 6 is July.
  const startYear =
    instant.getUTCMonth() >= 6
      ? instant.getUTCFullYear()
      : instant.getUTCFullYear() - 1
  const endYear = startYear + 1
  return {
    label: `${startYear}–${String(endYear).slice(2)}`,
    startsAt: new Date(Date.UTC(startYear, 6, 1)),
    endsAt: new Date(Date.UTC(endYear, 6, 1)),
  }
}
