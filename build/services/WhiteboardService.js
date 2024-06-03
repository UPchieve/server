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
exports.getDocFromStorage = exports.uploadedToStorage = exports.deleteDoc = exports.appendToDoc = exports.getDocLength = exports.getDoc = exports.createDoc = void 0;
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const AzureService_1 = require("./AzureService");
const cache = __importStar(require("../cache"));
const sessionIdToKey = (id) => `zwibbler-${id}`;
const createDoc = async (sessionId) => {
    const newDoc = '';
    await cache.save(sessionIdToKey(sessionId), newDoc);
    return newDoc;
};
exports.createDoc = createDoc;
const getDoc = (sessionId) => {
    return cache.get(sessionIdToKey(sessionId));
};
exports.getDoc = getDoc;
const getDocLength = async (sessionId) => {
    const document = await cache.get(sessionIdToKey(sessionId));
    if (document === undefined)
        return 0;
    return Buffer.byteLength(document, 'utf8');
};
exports.getDocLength = getDocLength;
const appendToDoc = (sessionId, docAddition) => {
    if (docAddition === undefined)
        return Promise.resolve();
    return cache.append(sessionIdToKey(sessionId), docAddition);
};
exports.appendToDoc = appendToDoc;
const deleteDoc = (sessionId) => {
    return cache.remove(sessionIdToKey(sessionId));
};
exports.deleteDoc = deleteDoc;
const uploadedToStorage = async (sessionId, whiteboardDoc, attempts = 0) => {
    try {
        await (0, AzureService_1.uploadBlob)(config_1.default.whiteboardStorageContainer, sessionId.toString(), whiteboardDoc);
        return true;
    }
    catch (error) {
        if (attempts === 1) {
            logger_1.default.error(`Retry uploading of whiteboard failed ${sessionId}: ${error.message}`);
            return false;
        }
        logger_1.default.error(`Uploading of whiteboard failed ${sessionId}, retrying: ${error.message}`);
        attempts++;
        return (0, exports.uploadedToStorage)(sessionId, whiteboardDoc, attempts);
    }
};
exports.uploadedToStorage = uploadedToStorage;
const getDocFromStorage = async (sessionId) => {
    try {
        const whiteboardDoc = await (0, AzureService_1.getBlob)(config_1.default.whiteboardStorageContainer, sessionId.toString());
        return whiteboardDoc;
    }
    catch (error) {
        logger_1.default.error(`Getting the whiteboard failed ${sessionId}: ${error.message}`);
        return '';
    }
};
exports.getDocFromStorage = getDocFromStorage;
