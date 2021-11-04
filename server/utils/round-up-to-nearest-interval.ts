const roundUpToNearestInterval = (num: number, interval: number): number => {
  return Math.ceil(num / interval) * interval
}

export default roundUpToNearestInterval
