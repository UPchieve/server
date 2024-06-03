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
const lodash_1 = require("lodash");
const logger_1 = require("../logger");
const Volunteer_1 = require("../../models/Volunteer");
const UserService = __importStar(require("../../services/UserService"));
const _1 = require(".");
exports.default = async () => {
    const volunteers = await (0, Volunteer_1.getVolunteersForEmailReferenceApology)();
    const alreadySent = (0, lodash_1.flatten)(volunteers.map(vol => {
        return vol.references.map(ref => ({
            reference: ref,
            volunteer: vol,
        }));
    }));
    if (alreadySent.length === 0)
        return (0, logger_1.log)('No references to email');
    const errors = [];
    let totalEmailed = 0;
    for (const s of alreadySent) {
        try {
            await UserService.notifyReferenceApology(s.reference, s.volunteer);
            totalEmailed += 1;
        }
        catch (error) {
            errors.push(`reference ${s.reference.id}: ${error}`);
        }
    }
    (0, logger_1.log)(`Sent ${_1.Jobs.EmailReferencesFormApology} to ${totalEmailed} references`);
    if (errors.length) {
        throw new Error(`Failed to send ${_1.Jobs.EmailReferences} to: ${errors}`);
    }
    process.exit(0);
};
