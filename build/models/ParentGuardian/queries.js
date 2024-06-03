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
exports.linkParentGuardianToStudent = exports.createParentGuardian = void 0;
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const Errors_1 = require("../Errors");
async function createParentGuardian(email, tc) {
    try {
        const id = (0, pgUtils_1.getDbUlid)();
        const result = await pgQueries.createParentGuardian.run({
            id,
            email,
        }, tc);
        if (!result.length)
            throw new Errors_1.RepoCreateError('createParentGuardian returned 0 rows.');
        return (0, pgUtils_1.makeRequired)(result[0]);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.createParentGuardian = createParentGuardian;
async function linkParentGuardianToStudent(parent_guardian_id, student_id, tc) {
    try {
        await pgQueries.linkParentGuardianToStudent.run({
            parent_guardian_id,
            student_id,
        }, tc);
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.linkParentGuardianToStudent = linkParentGuardianToStudent;
