"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjects = exports.getSessionPhotoUploadUrl = exports.getPhotoIdUrl = exports.getPhotoIdUploadUrl = exports.getObject = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Sentry = __importStar(require("@sentry/node"));
const config_1 = __importDefault(require("../config"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: config_1.default.awsS3.accessKeyId,
    secretAccessKey: config_1.default.awsS3.secretAccessKey,
    region: config_1.default.awsS3.region,
    signatureVersion: 'v4',
});
// TODO: we should error or return undefined instead of empty string on failure
async function getObject(bucket, s3Key) {
    const signedUrlParams = {
        Bucket: config_1.default.awsS3[bucket],
        Key: s3Key,
    };
    try {
        const objectUrl = await s3.getSignedUrlPromise('getObject', signedUrlParams);
        return objectUrl;
    }
    catch (error) {
        Sentry.captureException(error);
        return '';
    }
}
exports.getObject = getObject;
async function getPhotoIdUploadUrl(photoIdS3Key) {
    const signedUrlParams = {
        Bucket: config_1.default.awsS3.photoIdBucket,
        Key: photoIdS3Key,
        Expires: 60 * 60,
        ACL: 'bucket-owner-full-control',
    };
    try {
        const uploadUrl = await s3.getSignedUrlPromise('putObject', signedUrlParams);
        return uploadUrl;
    }
    catch (error) {
        Sentry.captureException(error);
        return '';
    }
}
exports.getPhotoIdUploadUrl = getPhotoIdUploadUrl;
async function getPhotoIdUrl(photoIdS3Key) {
    const signedUrlParams = {
        Bucket: config_1.default.awsS3.photoIdBucket,
        Key: photoIdS3Key,
    };
    try {
        const photoUrl = await s3.getSignedUrlPromise('getObject', signedUrlParams);
        return photoUrl;
    }
    catch (error) {
        Sentry.captureException(error);
        return '';
    }
}
exports.getPhotoIdUrl = getPhotoIdUrl;
async function getSessionPhotoUploadUrl(sessionPhotoS3Key) {
    const signedUrlParams = {
        Bucket: config_1.default.awsS3.sessionPhotoBucket,
        Key: sessionPhotoS3Key,
        Expires: 60 * 60,
        ACL: 'bucket-owner-full-control',
    };
    try {
        const uploadUrl = await s3.getSignedUrlPromise('putObject', signedUrlParams);
        return uploadUrl;
    }
    catch (error) {
        Sentry.captureException(error);
        return '';
    }
}
exports.getSessionPhotoUploadUrl = getSessionPhotoUploadUrl;
async function getObjects(bucket, s3Keys) {
    const urls = [];
    for (const s3Key of s3Keys) {
        urls.push(getObject(bucket, s3Key));
    }
    return Promise.all(urls);
}
exports.getObjects = getObjects;
