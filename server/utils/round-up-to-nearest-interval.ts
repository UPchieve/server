const roundUpToNearestInterval = (num, interval): number => {
  return Math.ceil(num / interval) * interval
}

export default roundUpToNearestInterval
