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
exports.io = void 0;
const Sentry = __importStar(require("@sentry/node"));
const body_parser_1 = __importDefault(require("body-parser"));
const connect_timeout_1 = __importDefault(require("connect-timeout"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_cache_controller_1 = __importDefault(require("express-cache-controller"));
const express_ws_1 = __importDefault(require("express-ws"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const util_1 = require("util");
const yaml_1 = __importDefault(require("yaml"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const pino_http_1 = __importDefault(require("pino-http"));
const router_1 = __importDefault(require("./router"));
const socket_server_1 = __importDefault(require("./socket-server"));
const securitySettings_1 = require("./securitySettings");
const TwilioService_1 = require("./services/TwilioService");
const environments_1 = require("./utils/environments");
function haltOnTimedout(req, res, next) {
    var _a;
    if (!req.timedout)
        next();
    else {
        logger_1.default.error({
            reqId: req.id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            method: req.method,
            path: req.path,
            url: req.url,
            originalUrl: req.originalUrl,
        }, 'Request timed out');
    }
}
// Set up Sentry error tracking
Sentry.init({
    dsn: config_1.default.sentryDsn,
    environment: config_1.default.NODE_ENV,
    release: `uc-server@${config_1.default.version}`,
});
// Express App
const app = (0, express_1.default)();
/**
 * @note: must typecast many handlers with express.RequestHandler
 * due to @types/node >=15.9.x and @types/express <14.7.1
 * see https://github.com/helmetjs/helmet/issues/325
 * see https://github.com/expressjs/express/issues/4618
 */
app.use((0, pino_http_1.default)({
    logger: logger_1.default,
}));
app.use((0, connect_timeout_1.default)('300000'));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            baseUri: securitySettings_1.baseUri,
            blockAllMixedContent: securitySettings_1.blockAllMixedContent,
            connectSrc: securitySettings_1.connectSrc,
            defaultSrc: securitySettings_1.defaultSrc,
            fontSrc: securitySettings_1.fontSrc,
            // frameAncestors,
            imgSrc: securitySettings_1.imgSrc,
            objectSrc: securitySettings_1.objectSrc,
            scriptSrc: securitySettings_1.scriptSrc,
            scriptSrcAttr: securitySettings_1.scriptSrcAttr,
            styleSrc: securitySettings_1.styleSrc,
            upgradeInsecureRequests: securitySettings_1.upgradeInsecureRequests,
        },
    },
}));
/**
 * Account for nginx proxy when getting client's IP address
 * http://expressjs.com/en/guide/behind-proxies.html
 */
app.set('trust proxy', true);
// Setup middleware
app.use(Sentry.Handlers.requestHandler()); // The Sentry request handler must be the first middleware on the app
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(config_1.default.sessionSecret));
let originRegex;
if (config_1.default.additionalAllowedOrigins !== '') {
    originRegex = new RegExp(`^(${config_1.default.host}|${config_1.default.additionalAllowedOrigins})$`);
}
else {
    originRegex = new RegExp(`^(${config_1.default.host})$`);
}
app.use((0, cors_1.default)({
    origin: originRegex,
    credentials: true,
    exposedHeaders: config_1.default.NODE_ENV === 'dev' ? ['Date'] : undefined,
}));
// for now, send directive to never cache to prevent Zwibbler issues
// until we figure out a caching strategy
app.use((0, express_cache_controller_1.default)({
    noCache: true,
}));
app.use(haltOnTimedout);
// see https://stackoverflow.com/questions/51023943/nodejs-getting-username-of-logged-in-user-within-route
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});
// Make req.login async
app.use((req, res, next) => {
    // Wrapper around promise to allow for no callback when using with await
    req.asyncLogin = (arg1, arg2) => (0, util_1.promisify)(req.login.bind(req))(arg1);
    next();
});
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
// Swagger docs
if ((0, environments_1.isDevEnvironment)()) {
    const swaggerDoc = fs_1.default.readFileSync(`${__dirname}/swagger/swagger.yaml`, 'utf8');
    const swaggerYaml = yaml_1.default.parse(swaggerDoc);
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerYaml));
}
// initialize Express WebSockets
(0, express_ws_1.default)(app);
// Start socket server
exports.io = (0, socket_server_1.default)(app);
// Load server router
(0, router_1.default)(app, exports.io);
app.use(haltOnTimedout);
function defaultErrorHandler(err, req, res, next) {
    logger_1.default.error(err);
    res.status(err.httpStatus || 500).json({ err: err.message || err });
    next();
}
// Send error responses to API requests after they are passed to Sentry
app.use(['/api', '/auth', '/contact', '/school', '/twiml', '/whiteboard'], defaultErrorHandler, haltOnTimedout);
app.use(haltOnTimedout);
(0, TwilioService_1.fetchOrCreateRateLimit)()
    .then(() => {
    logger_1.default.info('Successfully loaded Twilio rate limit');
})
    .catch(error => {
    logger_1.default.warn(`Error occurred while attempting to fetch or create Twilio rate limit`, error.message);
});
exports.default = app;
