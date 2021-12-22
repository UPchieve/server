function parseUnleashFeatureFlags(data, defaultFlags) {
  if (data && data.features && data.features.length) {
    const flags = data.features.reduce(
      (obj, flag) => ((obj[flag.name] = flag.enabled), obj),
      {}
    )
    return flags
  }
  return defaultFlags
}

export default parseUnleashFeatureFlags
