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
const db = __importStar(require("../db"));
const auth_utils_1 = require("../utils/auth-utils");
const file_utils_1 = require("../utils/file-utils");
async function main() {
    let exitCode = 0;
    try {
        await db.connect();
        const filePath = `update-roster-students.csv`;
        const students = (0, file_utils_1.readCsvFromFilePath)(filePath, ['gradeLevel', 'email', 'password']);
        const failedUsers = [];
        for (const student of students) {
            try {
                await db.runInTransaction(async (tc) => {
                    const password = await (0, auth_utils_1.hashPassword)(student.password);
                    const userResult = await tc.query('UPDATE users SET password = $1, password_reset_token = null, created_at = NOW(), updated_at = NOW(), last_activity_at = NOW() WHERE email = $2 RETURNING id', [password, student.email.toLowerCase()]);
                    const userId = userResult.rows[0].id;
                    const gradeLevelResult = await tc.query('SELECT id FROM grade_levels WHERE name = $1', [parseInt(student.gradeLevel).toFixed(0) + 'th']);
                    const gradeLevelId = gradeLevelResult.rows[0].id;
                    await tc.query('UPDATE student_profiles SET grade_level_id = $1, created_at = NOW(), updated_at = NOW() WHERE user_id = $2', [gradeLevelId, userId]);
                    await tc.query('UPDATE user_actions SET created_at = NOW(), updated_at = NOW() WHERE user_id = $1', [userId]);
                });
            }
            catch {
                failedUsers.push({
                    email: student.email,
                });
            }
        }
        console.log(`Completed with ${failedUsers.length} errors.`);
        if (failedUsers.length) {
            console.log(`Failed user emails: ${failedUsers.join(', ')}`);
        }
    }
    catch (error) {
        console.log(`Uncaught error: ${error}`);
        exitCode = 1;
    }
    finally {
        await db.closeClient();
        process.exit(exitCode);
    }
}
main();
