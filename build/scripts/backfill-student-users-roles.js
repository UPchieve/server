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
exports.backfill = void 0;
const db = __importStar(require("../db"));
const UserRepo = __importStar(require("../models/User"));
const constants_1 = require("../constants");
const logger_1 = require("../worker/logger");
async function main() {
    try {
        await db.connect();
        await db.runInTransaction(async (tc) => {
            await backfill(tc);
        });
    }
    catch (e) {
        (0, logger_1.logError)(e);
    }
}
exports.default = main;
async function backfill(tc) {
    const userIdsResult = await tc.query(`
    SELECT u.id 
    FROM users u
    LEFT JOIN signup_sources ss 
      ON u.signup_source_id = ss.id
    LEFT JOIN users_roles ur
      ON u.id = ur.user_id
    WHERE test_user = false 
      AND ur.role_id IS NULL
      AND ss.name = 'Roster';
  `);
    const userIds = userIdsResult.rows.map(r => r.id);
    // Cache the id mapping of school to student partner org
    // so we don't need to access db for all 1500 students.
    const schoolIdToSpoId = {};
    for (const id of userIds) {
        await UserRepo.insertUserRoleByUserId(id, constants_1.USER_ROLES.STUDENT, tc);
        // We need to fill in the student_partner_org_id on the student_profile.
        //   1. Get the school_id from the student_profile.
        //   2. Find the student_partner_org with that school_id.
        //   3. Update the student_profile with the id of that student_partner_org.
        const studentResult = await tc.query(`
        SELECT school_id
        FROM student_profiles
        WHERE user_id = $1
      `, [id]);
        if (studentResult.rows.length !== 1)
            throw new Error('unexpected student result length');
        const studentSchoolId = studentResult.rows[0].school_id;
        let studentSpoId;
        if (schoolIdToSpoId[studentSchoolId]) {
            studentSpoId = schoolIdToSpoId[studentSchoolId];
        }
        else {
            const spoResult = await tc.query(`
          SELECT id
          FROM student_partner_orgs
          WHERE school_id = $1
        `, [studentSchoolId]);
            if (spoResult.rows.length !== 1)
                throw new Error('unexpected spo result length');
            studentSpoId = spoResult.rows[0].id;
            schoolIdToSpoId[studentSchoolId] = studentSpoId;
        }
        await tc.query(`
          UPDATE student_profiles
          SET student_partner_org_id = $1
          WHERE user_id = $2;
        `, [studentSpoId, id]);
    }
}
exports.backfill = backfill;
