/**
 * Converts a threshold value to percentage (0-100) if it's in decimal format (0-1).
 * This is needed because AWS Rekognition and OpenAI return confidence as percentages (0-100),
 * while our database stores thresholds as decimals (0-1).
 * @param threshold - The threshold value to convert
 * @returns The threshold as a percentage (0-100)
 */
export function convertThresholdToPercentage(threshold: number): number {
  return threshold <= 1 ? threshold * 100 : threshold
}
