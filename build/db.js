"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInTransaction = exports.closeClient = exports.getAnalyticsClient = exports.getRoClient = exports.getClient = exports.connect = exports.setupDbConnection = exports.buildAnalyticsClient = exports.buildReadOnlyClient = exports.buildClient = void 0;
const utils_1 = require("@sentry/utils");
const pg_1 = require("pg");
const config_1 = __importDefault(require("./config"));
// TODO: exponential backoff, reconnect strategy
function buildClient() {
    return new pg_1.Pool({
        // connectionString
        host: config_1.default.postgresHost,
        port: config_1.default.postgresPort,
        user: config_1.default.postgresUser,
        password: config_1.default.postgresPassword,
        database: config_1.default.postgresDatabase,
        ssl: config_1.default.postgresRequireSSL ? { rejectUnauthorized: false } : false,
    });
}
exports.buildClient = buildClient;
function buildReadOnlyClient() {
    return new pg_1.Pool({
        // connectionString
        host: config_1.default.postgresRoHost,
        port: config_1.default.postgresPort,
        user: config_1.default.postgresUser,
        password: config_1.default.postgresPassword,
        database: config_1.default.postgresDatabase,
        ssl: config_1.default.postgresRequireSSL ? { rejectUnauthorized: false } : false,
    });
}
exports.buildReadOnlyClient = buildReadOnlyClient;
function buildAnalyticsClient() {
    return new pg_1.Pool({
        // connectionString
        host: config_1.default.postgresAnalyticsHost,
        port: config_1.default.postgresPort,
        user: config_1.default.postgresUser,
        password: config_1.default.postgresPassword,
        database: config_1.default.postgresDatabase,
        ssl: config_1.default.postgresRequireSSL ? { rejectUnauthorized: false } : false,
    });
}
exports.buildAnalyticsClient = buildAnalyticsClient;
let client;
let roClient;
let analyticsClient;
async function setupDbConnection() {
    getClient().on('error', err => console.error(`PG ERROR: ${err}`));
    getRoClient().on('error', err => console.error(`PG ERROR: ${err}`));
    getAnalyticsClient().on('error', err => console.error(`PG ERROR: ${err}`));
    try {
        getClient()
            .connect()
            .then(v => v.release());
        getRoClient()
            .connect()
            .then(v => v.release());
        getAnalyticsClient()
            .connect()
            .then(v => v.release());
    }
    catch (err) {
        utils_1.logger.error(`Could not connect to db with error ${err}`);
        process.exit(1);
    }
}
exports.setupDbConnection = setupDbConnection;
async function connect() {
    try {
        getClient()
            .connect()
            .then(v => v.release());
    }
    catch (err) {
        utils_1.logger.error(`Could not connect to db with error ${err}`);
        process.exit(1);
    }
}
exports.connect = connect;
function getClient() {
    if (!client) {
        client = buildClient();
    }
    return client;
}
exports.getClient = getClient;
function getRoClient() {
    if (!roClient) {
        roClient = buildReadOnlyClient();
    }
    return roClient;
}
exports.getRoClient = getRoClient;
function getAnalyticsClient() {
    if (!analyticsClient) {
        analyticsClient = buildAnalyticsClient();
    }
    return analyticsClient;
}
exports.getAnalyticsClient = getAnalyticsClient;
async function closeClient() {
    await (client === null || client === void 0 ? void 0 : client.end());
}
exports.closeClient = closeClient;
async function runInTransaction(cb) {
    const tc = await getClient().connect();
    try {
        await tc.query('BEGIN');
        const result = await cb(tc);
        await tc.query('COMMIT');
        return result;
    }
    catch (err) {
        await tc.query('ROLLBACK');
        throw err;
    }
    finally {
        tc.release();
    }
}
exports.runInTransaction = runInTransaction;
