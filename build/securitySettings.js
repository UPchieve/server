"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeInsecureRequests = exports.styleSrc = exports.scriptSrcAttr = exports.objectSrc = exports.frameAncestors = exports.fontSrc = exports.blockAllMixedContent = exports.baseUri = exports.defaultSrc = exports.connectSrc = exports.imgSrc = exports.scriptSrc = void 0;
const config_1 = __importDefault(require("./config"));
// really great csp docs: https://content-security-policy.com/
// helmet docs: https://helmetjs.github.io/
// script sources
const googleUrls = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
];
const cdnUrl = 'https://cdn.upchieve.org';
const mathJaxScriptUrl = 'https://cdnjs.cloudflare.com';
const newrelicUrls = [
    'https://js-agent.newrelic.com',
    'https://bam.nr-data.net',
];
const gleapScriptUrl = 'https://widget.gleap.io';
// connect sources
const posthogUrl = 'https://p.upchieve.org';
const sentryUrl = 'https://*.ingest.sentry.io';
const mathJaxFetchUrl = 'https://api.cdnjs.com';
const gleapConnectUrls = [
    'https://uptime.gleap.io',
    'https://api.gleap.io',
    gleapScriptUrl,
];
// img srcs
const s3PhotoConnectUrls = [
    `${config_1.default.awsS3.photoIdBucket}.s3.us-east-2.amazonaws.com`,
    `${config_1.default.awsS3.sessionPhotoBucket}.s3.us-east-2.amazonaws.com`,
];
const s3PhotoImageUrls = [
    `${config_1.default.awsS3.photoIdBucket}.s3.amazonaws.com`,
    `${config_1.default.awsS3.photoIdBucket}.s3.us-east-2.amazonaws.com`,
    `${config_1.default.awsS3.sessionPhotoBucket}.s3.amazonaws.com`,
    `${config_1.default.awsS3.sessionPhotoBucket}.s3.us-east-2.amazonaws.com`,
];
const adminEduUrls = [
    'https://code.jquery.com',
    'https://stackpath.bootstrapcdn.com',
    'https://cdn.jsdelivr.net',
];
// default srcs
const vimeoUrl = 'https://player.vimeo.com';
const googleDocsUrl = 'https://docs.google.com';
const trainingMaterialsS3 = 'https://upc-training-materials.s3.us-east-2.amazonaws.com';
exports.scriptSrc = [
    "'self'",
    `https://${config_1.default.host}`,
    ...googleUrls,
    cdnUrl,
    mathJaxScriptUrl,
    posthogUrl,
    ...newrelicUrls,
    ...adminEduUrls,
    gleapScriptUrl,
    "'unsafe-eval'",
    "'unsafe-inline'",
    'blob:',
];
exports.imgSrc = [
    "'self'",
    ...googleUrls,
    ...s3PhotoImageUrls,
    cdnUrl,
    'data:',
    'blob:',
    `https://${config_1.default.host}`,
];
exports.connectSrc = [
    "'self'",
    posthogUrl,
    sentryUrl,
    mathJaxFetchUrl,
    ...s3PhotoConnectUrls,
    ...newrelicUrls,
    ...googleUrls,
    ...gleapConnectUrls,
    `wss://${config_1.default.host}`,
    `https://${config_1.default.host}`,
];
if (config_1.default.NODE_ENV !== 'production') {
    exports.connectSrc.push('http://localhost:3000');
    exports.connectSrc.push('http://localhost:3001');
    exports.connectSrc.push('ws://localhost:3001');
    exports.connectSrc.push('http://localhost:3002');
}
exports.defaultSrc = [
    "'self'",
    `https://${config_1.default.host}`,
    "'unsafe-inline'",
    vimeoUrl,
    googleDocsUrl,
    trainingMaterialsS3,
];
// the rest are defaults
exports.baseUri = ["'self'"];
exports.blockAllMixedContent = [];
exports.fontSrc = ["'self'", 'https:', 'data:'];
exports.frameAncestors = ["'self'", 'http://localhost'];
exports.objectSrc = ["'none'"];
exports.scriptSrcAttr = ["'none'"];
exports.styleSrc = ["'self'", 'https:', "'unsafe-inline'"];
if (config_1.default.NODE_ENV === 'production') {
    exports.upgradeInsecureRequests = [];
}
else {
    exports.upgradeInsecureRequests = null;
}
