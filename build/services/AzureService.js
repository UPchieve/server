"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBlob = exports.getBlob = void 0;
const identity_1 = require("@azure/identity");
const storage_blob_1 = require("@azure/storage-blob");
const config_1 = __importDefault(require("../config"));
const whiteboardStorageAccount = config_1.default.whiteboardStorageAccountName;
const whiteboardStorageCredential = new identity_1.ClientSecretCredential(config_1.default.whiteboardStorageTenantId, config_1.default.whiteboardStorageAppId, config_1.default.whiteboardStorageSecret);
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${whiteboardStorageAccount}.blob.core.windows.net`, whiteboardStorageCredential);
// a helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream) {
    // TODO: is there a way to do this async?
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}
async function getBlob(containerName, blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blobClient.download();
    const blobContent = (await streamToBuffer(
    // readableStreamBody always available within Node
    downloadBlockBlobResponse.readableStreamBody)).toString();
    return blobContent;
}
exports.getBlob = getBlob;
async function uploadBlob(containerName, blobName, content) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, content.length);
}
exports.uploadBlob = uploadBlob;
