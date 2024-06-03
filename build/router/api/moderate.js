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
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeModeration = void 0;
const ModerationCtrl = __importStar(require("../../controllers/ModerationCtrl"));
const res_error_1 = require("../res-error");
const type_utils_1 = require("../../utils/type-utils");
function routeModeration(router) {
    router.route('/moderate/message').post((req, res) => {
        try {
            const isClean = ModerationCtrl.moderateMessage((0, type_utils_1.asString)(req.body.content));
            res.json({ isClean });
        }
        catch (error) {
            (0, res_error_1.resError)(res, error);
        }
    });
}
exports.routeModeration = routeModeration;
