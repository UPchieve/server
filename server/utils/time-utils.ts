export const secondsInMs = (second: number) => second * 1000
export const minutesInMs = (minute: number) => minute * secondsInMs(60)
export const hoursInMs = (hour: number) => hour * minutesInMs(60)
export const daysInMs = (days: number) => hoursInMs(24) * days
export const minutesInSeconds = (minutes: number) => minutes * 60
export const hoursInSeconds = (hour: number) => hour * minutesInSeconds(60)

export const startOfUtcYear = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
