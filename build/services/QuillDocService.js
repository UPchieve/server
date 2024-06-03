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
exports.deleteDoc = exports.addDocumentUpdate = exports.getDocumentUpdates = exports.appendToDoc = exports.processDoc = exports.getQuillDocV1 = exports.lockAndGetDocCacheState = exports.getDoc = exports.createDoc = void 0;
const quill_delta_1 = __importDefault(require("quill-delta"));
const cache = __importStar(require("../cache"));
const redlock_1 = require("redlock");
const logger_1 = __importDefault(require("../logger"));
function sessionIdToKey(id) {
    return `quill-${id.toString()}`;
}
function getSessionDeltasKey(id) {
    return `${sessionIdToKey(id)}-deltas`;
}
function getSessionDocumentUpdatesKey(id) {
    return `${sessionIdToKey(id)}-document-updates`;
}
async function createDoc(sessionId) {
    const newDoc = new quill_delta_1.default();
    await cache.save(sessionIdToKey(sessionId), JSON.stringify(newDoc));
    return newDoc;
}
exports.createDoc = createDoc;
async function getDoc(sessionId) {
    try {
        const docString = await cache.get(sessionIdToKey(sessionId));
        return new quill_delta_1.default(JSON.parse(docString));
    }
    catch (err) {
        if (!(err instanceof cache.KeyNotFoundError))
            throw err;
    }
}
exports.getDoc = getDoc;
/**
 *
 * Locks the doc resource in the cache and retrieves the
 * updated doc and the last delta that was popped from
 * the queue
 *
 */
async function lockAndGetDocCacheState(sessionId) {
    try {
        const sessionCacheKey = sessionIdToKey(sessionId);
        const lock = await cache.lock(sessionCacheKey, 5000);
        const docString = await cache.get(sessionCacheKey);
        const result = await processDoc(sessionId, docString);
        await lock.unlock();
        return result;
    }
    catch (err) {
        if (!(err instanceof cache.KeyNotFoundError))
            throw err;
    }
}
exports.lockAndGetDocCacheState = lockAndGetDocCacheState;
/*
 * `lockAndGetDocCacheState` with retry
 */
async function getQuillDocV1(sessionId, retries = 0) {
    try {
        return await lockAndGetDocCacheState(sessionId);
    }
    catch (error) {
        if (error instanceof redlock_1.LockError && retries < 10)
            return getQuillDocV1(sessionId, retries + 1);
        else
            logger_1.default.error(`Failed to update and get document in the cache for session ${sessionId} - ${error}`);
        return;
    }
}
exports.getQuillDocV1 = getQuillDocV1;
/**
 *
 * Empties the queue of deltas for a session and then composes and saves
 * the updated doc delta if there were deltas inside the queue
 *
 * Returns the doc stored in the cache and the last delta that was popped
 * from the queue
 *
 */
async function processDoc(sessionId, docString) {
    const deltasCacheKey = getSessionDeltasKey(sessionId);
    let pendingDelta = await cache.lpop(deltasCacheKey);
    const isUpdateNeeded = !!pendingDelta;
    let doc = new quill_delta_1.default(JSON.parse(docString));
    let lastDeltaStored;
    while (pendingDelta) {
        const delta = new quill_delta_1.default(JSON.parse(pendingDelta));
        doc = doc.compose(delta);
        const prevDelta = pendingDelta;
        pendingDelta = await cache.lpop(deltasCacheKey);
        if (prevDelta && !pendingDelta)
            lastDeltaStored = JSON.parse(prevDelta);
    }
    if (isUpdateNeeded)
        await cache.save(sessionIdToKey(sessionId), JSON.stringify(doc));
    return { doc, lastDeltaStored };
}
exports.processDoc = processDoc;
async function appendToDoc(sessionId, delta) {
    await cache.rpush(getSessionDeltasKey(sessionId), JSON.stringify(delta));
}
exports.appendToDoc = appendToDoc;
/**
 *
 * The new version of our Quill editor is backed by Yjs CRDTs.
 * Updates to the document are represented as Uint8Arrays. We
 * store them in a Redis @set as a string of comma separated 8-bit integers
 *
 * example: "1,8,3,9,4"
 *
 * When we want to turn this into an actual document, we retrieve all members
 * of the Redis @set at a given key, convert them back to Uint8Arrays, then
 * apply them as updates to the Y.Doc.
 *
 */
async function getDocumentUpdates(sessionId) {
    return await cache.smembers(getSessionDocumentUpdatesKey(sessionId));
}
exports.getDocumentUpdates = getDocumentUpdates;
async function addDocumentUpdate(sessionId, update) {
    await cache.sadd(getSessionDocumentUpdatesKey(sessionId), update);
}
exports.addDocumentUpdate = addDocumentUpdate;
async function deleteDoc(sessionId) {
    await Promise.allSettled([
        cache.remove(sessionIdToKey(sessionId)),
        cache.remove(getSessionDeltasKey(sessionId)),
        cache.remove(getSessionDocumentUpdatesKey(sessionId)),
    ]);
}
exports.deleteDoc = deleteDoc;
