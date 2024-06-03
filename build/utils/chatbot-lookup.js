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
exports.lookupChatbotFromCache = void 0;
const cache = __importStar(require("../cache"));
const UserRepo = __importStar(require("../models/User/queries"));
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../logger"));
const type_utils_1 = require("./type-utils");
async function lookupChatbotFromCache() {
    try {
        return (0, type_utils_1.asString)(await cache.get(constants_1.CHATBOT_CACHE_KEY));
    }
    catch (err) {
        if (err instanceof cache.KeyNotFoundError) {
            try {
                const chatbot = await UserRepo.getUserIdByEmail(constants_1.CHATBOT_EMAIL);
                if (chatbot)
                    await cache.save(constants_1.CHATBOT_CACHE_KEY, chatbot.toString());
                return chatbot;
            }
            catch (error) {
                err = error;
            }
        }
        else
            logger_1.default.error(`Failed to lookup chatbot user: ${err.message}`);
    }
}
exports.lookupChatbotFromCache = lookupChatbotFromCache;
