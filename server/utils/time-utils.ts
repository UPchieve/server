export const secondsInMs = (second: number) => second * 1000
export const minutesInMs = (minute: number) => minute * secondsInMs(60)
export const hoursInMs = (hour: number) => hour * minutesInMs(60)
export const minutesInSeconds = (minutes: number) => minutes * 60
export const hoursInSeconds = (hour: number) => hour * minutesInSeconds(60)
