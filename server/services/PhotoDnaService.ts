import axios from 'axios'
import * as AzureService from './AzureService'
import * as ModerationRepo from '../models/ModerationInfractions'
import config from '../config'
import { InfractionReasons } from '../models/ModerationInfractions'
import { PhotoDnaMatchError } from '../models/Errors'
import { getFileType } from '../utils/image-utils'
import logger from '../logger'

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
])

function getEndpoint(): string {
  const host = config.photoDNABaseHost
  return `https://${host}/photodna/v1.0/Match`
}

export interface PhotoDnaMatchFlag {
  Source: string
  Violations: string[]
  MatchDistance: number
  AdvancedInfo: Array<{ Key: string; Value: string }>
}

export interface PhotoDnaMatchResponse {
  Status: { Code: number; Description: string; Exception: string | null }
  ContentId: string | null
  IsMatch: boolean
  MatchDetails: {
    AdvancedInfo: unknown[]
    MatchFlags: PhotoDnaMatchFlag[]
  } | null
  TrackingId: string
}

export function photoDnaMatchToInfractionReasons(
  res: PhotoDnaMatchResponse
): InfractionReasons {
  const reasons: string[] = []

  if (res.ContentId) reasons.push(`contentId:${res.ContentId}`)
  reasons.push(`trackingId:${res.TrackingId}`)

  for (const flag of res.MatchDetails?.MatchFlags ?? []) {
    reasons.push(String(flag))
  }

  return { photoDna: reasons }
}

export async function scanImage(
  image: Express.Multer.File,
  mimeType: string,
  userId: string,
  sessionId?: string
): Promise<any> {
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    return
  }

  const key = config.photoDnaKey

  try {
    const response = await axios.post<PhotoDnaMatchResponse>(
      getEndpoint(),
      image.buffer,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': mimeType,
        },
      }
    )

    const data = response.data

    if (data.Status?.Code !== 3000) {
      logger.error(
        `PhotoDNA returned non-success status code ${data.Status?.Code}: ${data.Status?.Description}`
      )
      throw new PhotoDnaMatchError()
    }

    if (data.IsMatch) {
      const reasons = photoDnaMatchToInfractionReasons(data)
      const quarantinedOn = new Date()
      const result = await ModerationRepo.insertModerationInfraction(
        { userId, reason: reasons, sessionId },
        undefined,
        quarantinedOn
      )

      const moderationInfractionId = result.id

      await AzureService.uploadBlobFile(
        config.photoDnaStorageAccountName,
        config.photoDnaStorageContainer,
        moderationInfractionId,
        image
      )
    }

    return data
  } catch (err) {
    logger.error(err)
    throw new PhotoDnaMatchError()
  }
}

export async function checkAgainstPhotoDNA(
  file: Express.Multer.File,
  userId: string,
  sessionId?: string
): Promise<void> {
  const sniffed = getFileType(file.buffer)?.mime
  if (!sniffed?.startsWith('image/')) return

  const result = await scanImage(file, file.mimetype, userId, sessionId)
  if (result?.IsMatch) {
    throw new PhotoDnaMatchError()
  }
}
