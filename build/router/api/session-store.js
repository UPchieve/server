"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const config_1 = __importDefault(require("../../config"));
const db_1 = require("../../db");
const csrf_sync_1 = require("csrf-sync");
const auth_utils_1 = require("../../utils/auth-utils");
const PgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
function default_1(app) {
    const store = new PgStore({
        pool: (0, db_1.getClient)(),
        schemaName: 'auth',
        tableName: 'session',
    });
    app.use((0, express_session_1.default)({
        resave: false,
        saveUninitialized: false,
        secret: config_1.default.sessionSecret,
        store: store,
        cookie: {
            httpOnly: false,
            maxAge: config_1.default.sessionCookieMaxAge,
        },
    }));
    // CSRF middleware - must be registered after session middleware
    const { generateToken, csrfSynchronisedProtection } = (0, csrf_sync_1.csrfSync)();
    app.get('/api/csrftoken', (req, res) => {
        const csrfToken = generateToken(req);
        return res.json({ csrfToken });
    });
    app.use((req, res, next) => {
        const exclusions = [
            '/auth/login',
            '/auth/register',
            '/auth/reset',
            '/api-public/eligibility',
            '/api-public/contact',
            '/api/verify',
        ];
        const apiKey = (0, auth_utils_1.getApiKeyFromHeader)(req);
        if (exclusions.some(ex => req.url.indexOf(ex) !== -1) ||
            (apiKey && apiKey === config_1.default.subwayApiCredentials)) {
            next();
        }
        else {
            csrfSynchronisedProtection(req, res, next);
        }
    });
    return store;
}
exports.default = default_1;
