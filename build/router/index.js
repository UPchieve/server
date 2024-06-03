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
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importStar(require("../logger"));
const auth_utils_1 = require("../utils/auth-utils");
const session_store_1 = __importDefault(require("./api/session-store"));
const ContactFormRouter = __importStar(require("./contact"));
const AuthRouter = __importStar(require("./auth"));
const ApiRouter = __importStar(require("./api"));
const EligibilityRouter = __importStar(require("./eligibility"));
const WhiteboardRouter = __importStar(require("./whiteboard"));
const EduRouter = __importStar(require("./edu"));
const MobileRouter = __importStar(require("./mobile"));
const ReferenceRouter = __importStar(require("./reference"));
const ReferralRouter = __importStar(require("./referral"));
const SubjectsRouter = __importStar(require("./subjects"));
const TwimlRouter = __importStar(require("./twiml"));
const uuid_1 = require("uuid");
const FeatureFlagService_1 = require("../services/FeatureFlagService");
function default_1(app, io) {
    logger_1.default.info('initializing server routing');
    // initialize session store
    const sessionStore = (0, session_store_1.default)(app);
    // initialize passport AFTER session store (https://stackoverflow.com/a/30882574)
    auth_utils_1.authPassport.setupPassport();
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    WhiteboardRouter.routes(app);
    AuthRouter.routes(app);
    ApiRouter.routes(app, sessionStore, io);
    EduRouter.routes(app);
    EligibilityRouter.routes(app);
    TwimlRouter.routes(app);
    ContactFormRouter.routes(app);
    MobileRouter.routes(app);
    ReferenceRouter.routes(app);
    ReferralRouter.routes(app);
    SubjectsRouter.routes(app);
    app.get('/healthz', function (_req, res) {
        res.status(200).json({ version: config_1.default.version });
    });
    app.get('/api-public/feature-flags', async function (req, res) {
        const phCookie = req.cookies[`ph_${config_1.default.posthogToken}_posthog`];
        const distinctId = phCookie ? JSON.parse(phCookie).distinct_id : (0, uuid_1.v4)();
        try {
            const flags = await (0, FeatureFlagService_1.getAllFlagsForId)(distinctId);
            res.status(200).json({ id: distinctId, ...flags });
        }
        catch (e) {
            (0, logger_1.logError)(new Error(`Failed to bootstrap feature flags. ${e}`), {
                userId: distinctId,
            });
            res.status(200).json({ id: distinctId });
        }
    });
}
exports.default = default_1;
