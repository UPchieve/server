import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3,
  ObjectCannedACL,
} from '@aws-sdk/client-s3'
import * as Sentry from '@sentry/node'
import config from '../config'
import logger, { logError } from '../logger'

const s3 = new S3({
  credentials: {
    accessKeyId: config.awsS3.accessKeyId,
    secretAccessKey: config.awsS3.secretAccessKey,
  },
  region: config.awsS3.region,
})

// TODO: we should error or return undefined instead of empty string on failure

export async function getObject(
  bucket: keyof typeof config.awsS3,
  s3Key: string
): Promise<string> {
  const signedUrlParams = {
    Bucket: config.awsS3[bucket],
    Key: s3Key,
  }

  try {
    const objectUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(signedUrlParams)
    )
    return objectUrl
  } catch (error) {
    Sentry.captureException(error)
    logError(error as Error)
    return ''
  }
}

export async function getPhotoIdUploadUrl(
  photoIdS3Key: string
): Promise<string> {
  const signedUrlParams = {
    Bucket: config.awsS3.photoIdBucket,
    Key: photoIdS3Key,
    ACL: ObjectCannedACL.bucket_owner_full_control,
  }

  try {
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand(signedUrlParams),
      {
        expiresIn: 60 * 60, // link expiration
      }
    )
    return uploadUrl
  } catch (error) {
    Sentry.captureException(error)
    logError(error as Error)
    return ''
  }
}

export async function getPhotoIdUrl(photoIdS3Key: string): Promise<string> {
  const signedUrlParams = {
    Bucket: config.awsS3.photoIdBucket,
    Key: photoIdS3Key,
  }

  try {
    const photoUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(signedUrlParams)
    )
    return photoUrl
  } catch (error) {
    Sentry.captureException(error)
    logError(error as Error)
    return ''
  }
}

export async function getSessionPhotoUploadUrl(
  sessionPhotoS3Key: string
): Promise<string> {
  const signedUrlParams = {
    Bucket: config.awsS3.sessionPhotoBucket,
    Key: sessionPhotoS3Key,
    ACL: ObjectCannedACL.bucket_owner_full_control,
  }

  try {
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand(signedUrlParams),
      {
        expiresIn: 60 * 60, // link expiration
      }
    )
    return uploadUrl
  } catch (error) {
    Sentry.captureException(error)
    logError(error as Error)
    return ''
  }
}

export async function getObjects(
  bucket: keyof typeof config.awsS3,
  s3Keys: string[]
): Promise<string[]> {
  const urls: Promise<string>[] = []

  for (const s3Key of s3Keys) {
    urls.push(getObject(bucket, s3Key))
  }

  return Promise.all(urls)
}

export async function putObject(bucket: string, s3Key: string, body: Buffer) {
  const signedUrlParams = {
    Body: body,
    Bucket: bucket,
    Key: s3Key,
    ACL: ObjectCannedACL.bucket_owner_full_control,
  }
  const command = new PutObjectCommand(signedUrlParams)
  const response = await s3.send(command)
  const location = `https://${bucket}.s3.amazonaws.com/${s3Key}`
  logger.info(`TEST: putObject response ${JSON.stringify(response, null, 2)}`)
  return { response, location }
}
