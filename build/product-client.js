"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const config_1 = __importDefault(require("./config"));
const posthog_node_1 = require("posthog-node");
const ONE_MINUTE_IN_MS = 1000 * 60;
// TODO: Handle local dev instance better.
exports.client = isValidConfigToken(config_1.default.posthogToken)
    ? new posthog_node_1.PostHog(config_1.default.posthogToken, {
        host: 'https://app.posthog.com',
        personalApiKey: isValidConfigToken(config_1.default.posthogPersonalApiToken)
            ? config_1.default.posthogPersonalApiToken
            : undefined,
        featureFlagsPollingInterval: ONE_MINUTE_IN_MS,
    })
    : {
        isFeatureEnabled: async () => false,
        getFeatureFlagPayload: async () => '',
        getFeatureFlag: async () => '',
        getAllFlagsAndPayloads: async () => {
            return Promise.resolve({ featureFlags: {}, featureFlagPayloads: {} });
        },
        identify: async () => {
            /* no-op */
        },
        capture: async () => {
            /* no-op */
        },
        shutdownAsync: async () => {
            /* no-op */
        },
    };
function isValidConfigToken(token) {
    return token !== 'bogus';
}
