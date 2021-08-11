import AWS from 'aws-sdk'
import * as Sentry from '@sentry/node'
import config from '../config'

const s3 = new AWS.S3({
  accessKeyId: config.awsS3.accessKeyId,
  secretAccessKey: config.awsS3.secretAccessKey,
  region: config.awsS3.region,
  signatureVersion: 'v4'
})

export async function getObject(
  bucket: string,
  s3Key: string
): Promise<string> {
  const signedUrlParams = {
    Bucket: (config.awsS3 as {[key: string]: string})[bucket],
    Key: s3Key
  }

  try {
    return await s3.getSignedUrlPromise('getObject', signedUrlParams)
  } catch (error) {
    Sentry.captureException(error)
    return Promise.resolve('')
  }
}

export const getPhotoIdUploadUrl = async ({
  photoIdS3Key
}: {
  photoIdS3Key: string
}): Promise<string> => {
  const signedUrlParams = {
    Bucket: config.awsS3.photoIdBucket,
    Key: photoIdS3Key,
    Expires: 60 * 60, // link expiration
    ACL: 'bucket-owner-full-control'
  }

  try {
    return await s3.getSignedUrlPromise('putObject', signedUrlParams)
  } catch (error) {
    Sentry.captureException(error)
    return ''
  }
}

export const getPhotoIdUrl = async ({
  photoIdS3Key
}: {
  photoIdS3Key: string
}): Promise<string> => {
  const signedUrlParams = {
    Bucket: config.awsS3.photoIdBucket,
    Key: photoIdS3Key
  }

  try {
    return await s3.getSignedUrlPromise('getObject', signedUrlParams)
  } catch (error) {
    Sentry.captureException(error)
    return ''
  }
}

export const getSessionPhotoUploadUrl = async (
  sessionPhotoS3Key: string
): Promise<string> => {
  const signedUrlParams = {
    Bucket: config.awsS3.sessionPhotoBucket,
    Key: sessionPhotoS3Key,
    Expires: 60 * 60, // link expiration
    ACL: 'bucket-owner-full-control'
  }

  try {
    return await s3.getSignedUrlPromise('putObject', signedUrlParams)
  } catch (error) {
    Sentry.captureException(error)
    return ''
  }
}

export const getObjects = async ({
  bucket,
  s3Keys
}: {
  bucket: string
  s3Keys: string[]
}): Promise<string[]> => {
  const urls = []

  for (const s3Key of s3Keys) {
    urls.push(getObject({ bucket, s3Key }))
  }

  return Promise.all(urls)
}
