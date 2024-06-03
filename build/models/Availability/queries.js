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
exports.saveLegacyAvailability = exports.clearAvailabilityForVolunteer = exports.updateAvailabilityByVolunteerId = exports.getAvailabilityForVolunteerByDate = exports.saveAvailabilityAsHistoryByDate = exports.saveCurrentAvailabilityAsHistory = exports.getLegacyAvailabilityHistoryForDatesByVolunteerId = exports.getAvailabilityHistoryForDatesByVolunteerId = exports.getAvailabilityForVolunteerHeatmap = exports.getAvailabilityForVolunteer = exports.getAvailabilityDay = void 0;
const db_1 = require("../../db");
const pgQueries = __importStar(require("./pg.queries"));
const pgUtils_1 = require("../pgUtils");
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const constants_1 = require("../../constants");
const Errors_1 = require("../Errors");
const type_utils_1 = require("../../utils/type-utils");
function createNewAvailability() {
    const availability = {};
    for (const day of constants_1.DAYS) {
        const temp = {};
        for (const hour of constants_1.HOURS) {
            temp[hour] = false;
        }
        availability[day] = temp;
    }
    return availability;
}
function getAvailabilityHour(rawHour) {
    let baseHour = rawHour;
    let hour;
    if (baseHour >= 12) {
        if (baseHour > 12) {
            baseHour -= 12;
        }
        hour = `${baseHour}p`;
    }
    else {
        if (baseHour === 0) {
            baseHour = 12;
        }
        hour = `${baseHour}a`;
    }
    return hour;
}
const day_array = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
function getAvailabilityDay(baseDay) {
    return day_array[baseDay];
}
exports.getAvailabilityDay = getAvailabilityDay;
/**
 * All database rows are currently saved in EST regardless of the user's actual timezone
 * TODO: save rows (and backfill) in user's actual timezone and do conversion server side
 * @param rows availability rows straight form postgres
 * @returns an Availability object model
 */
function buildAvailabilityModel(rows) {
    const availability = createNewAvailability();
    for (const row of rows) {
        for (let i = row.availableStart; i < row.availableEnd; i++) {
            const hour = getAvailabilityHour(i);
            availability[row.weekday][hour] = true;
        }
    }
    return availability;
}
async function getAvailabilityForVolunteer(userId, poolClient) {
    const client = poolClient ? poolClient : (0, db_1.getClient)();
    try {
        const result = await pgQueries.getAvailabilityForVolunteer.run({
            userId: (0, type_utils_1.isPgId)(userId) ? userId : undefined,
            mongoUserId: (0, type_utils_1.isPgId)(userId) ? undefined : userId,
        }, client);
        return buildAvailabilityModel(result.map(v => (0, pgUtils_1.makeRequired)(v)));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAvailabilityForVolunteer = getAvailabilityForVolunteer;
async function getAvailabilityForVolunteerHeatmap(subject) {
    try {
        const result = await pgQueries.getAvailabilityForVolunteerHeatmap.run({ subject }, (0, db_1.getClient)());
        const availabilities = [];
        const groups = lodash_1.default.groupBy(result.map(v => (0, pgUtils_1.makeRequired)(v)), row => row.userId);
        for (const user in groups) {
            const rows = groups[user];
            availabilities.push({
                volunteerId: user,
                availability: buildAvailabilityModel(rows),
            });
        }
        return availabilities;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAvailabilityForVolunteerHeatmap = getAvailabilityForVolunteerHeatmap;
async function getAvailabilityHistoryForDatesByVolunteerId(userId, start, end) {
    try {
        const result = await pgQueries.getAvailabilityHistoryForDatesByVolunteerId.run({ userId, start, end }, (0, db_1.getClient)());
        const rows = result.map(row => (0, pgUtils_1.makeRequired)(row));
        const rowsByDate = lodash_1.default.groupBy(rows, 'recordedAt');
        const histories = [];
        for (const [date, rows] of Object.entries(rowsByDate).sort((a, b) => new Date(a[0]) > new Date(b[0]) ? 1 : -1)) {
            const availability = buildAvailabilityModel(rows.map(v => (0, pgUtils_1.makeRequired)(v)));
            histories.push({
                volunteerId: userId,
                recordedAt: new Date(date),
                availability,
            });
        }
        return histories;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAvailabilityHistoryForDatesByVolunteerId = getAvailabilityHistoryForDatesByVolunteerId;
async function getLegacyAvailabilityHistoryForDatesByVolunteerId(userId, start, end) {
    try {
        const result = await pgQueries.getLegacyAvailabilityHistoryForDatesByVolunteerId.run({ userId, start, end }, (0, db_1.getClient)());
        const rows = result.map(row => (0, pgUtils_1.makeSomeOptional)(row, ['timezone']));
        const rowsByDate = lodash_1.default.groupBy(rows, 'recordedAt');
        const histories = [];
        for (const [date, rows] of Object.entries(rowsByDate).sort((a, b) => new Date(a[0]) > new Date(b[0]) ? 1 : -1)) {
            // NOTE: the DB currently has duplicate entries for legacy_availabilities, ignore duplicates here
            const row = rows[0];
            const availability = createNewAvailability();
            const day = getAvailabilityDay((0, moment_1.default)(row.recordedAt).day());
            histories.push({
                volunteerId: userId,
                recordedAt: new Date(row.recordedAt),
                availability: Object.assign(availability, {
                    [day]: row.legacyAvailability,
                }),
            });
        }
        return histories;
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getLegacyAvailabilityHistoryForDatesByVolunteerId = getLegacyAvailabilityHistoryForDatesByVolunteerId;
async function saveCurrentAvailabilityAsHistory(userId) {
    try {
        const result = await pgQueries.saveCurrentAvailabilityAsHistory.run({ userId }, (0, db_1.getClient)());
        const errors = [];
        for (const row of result) {
            if (!(0, pgUtils_1.makeRequired)(row).ok)
                errors.push(`AvailabilityHistory row ${row} did not save correctly`);
        }
        if (errors.length)
            throw new Error(errors.join('\n'));
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.saveCurrentAvailabilityAsHistory = saveCurrentAvailabilityAsHistory;
async function saveAvailabilityAsHistoryByDate(userId, outageDate) {
    try {
        const result = await pgQueries.saveAvailabilityAsHistoryByDate.run({ userId, recordedAt: outageDate }, (0, db_1.getClient)());
        const errors = [];
        for (const row of result) {
            if (!(0, pgUtils_1.makeRequired)(row).ok)
                errors.push(`AvailabilityHistory row ${row} did not save correctly`);
        }
        if (errors.length)
            throw new Error(errors.join('\n'));
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.saveAvailabilityAsHistoryByDate = saveAvailabilityAsHistoryByDate;
async function getAvailabilityForVolunteerByDate(userId, date) {
    try {
        const result = await pgQueries.getAvailabilityForVolunteerByDate.run({ userId, recordedAt: date }, (0, db_1.getClient)());
        return buildAvailabilityModel(result.map(v => (0, pgUtils_1.makeRequired)(v)));
    }
    catch (err) {
        throw new Errors_1.RepoReadError(err);
    }
}
exports.getAvailabilityForVolunteerByDate = getAvailabilityForVolunteerByDate;
async function updateAvailabilityByVolunteerId(userId, availability, timezone) {
    const client = await (0, db_1.getClient)().connect();
    try {
        const rows = [];
        for (const day in availability) {
            const availabilityDay = availability[day];
            for (const hour in availabilityDay) {
                const parsedHour = constants_1.HOUR_TO_UTC_MAPPING[hour];
                if (availabilityDay[hour])
                    rows.push({
                        availableEnd: parsedHour + 1,
                        availableStart: parsedHour,
                        day,
                        id: (0, pgUtils_1.getDbUlid)(),
                        timezone: timezone,
                        userId,
                    });
            }
        }
        const errors = [];
        await client.query('BEGIN');
        for (const row of rows) {
            const result = await pgQueries.insertNewAvailability.run({ ...row }, client);
            if (!(result.length && (0, pgUtils_1.makeRequired)(result[0])))
                errors.push(`Availability row ${JSON.stringify(row)} did not save correctly`);
        }
        if (errors.length)
            throw new Error(errors.join('\n'));
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw new Errors_1.RepoUpdateError(err);
    }
    finally {
        client.release();
    }
}
exports.updateAvailabilityByVolunteerId = updateAvailabilityByVolunteerId;
async function clearAvailabilityForVolunteer(userId) {
    try {
        const result = await pgQueries.clearAvailabilityForVolunteer.run({ userId }, (0, db_1.getClient)());
        if (!result.length && (0, pgUtils_1.makeRequired)(result[0]).ok)
            throw new Errors_1.RepoUpdateError('Update query did not return ok');
    }
    catch (err) {
        throw new Errors_1.RepoUpdateError(err);
    }
}
exports.clearAvailabilityForVolunteer = clearAvailabilityForVolunteer;
async function saveLegacyAvailability(userId, availability) {
    try {
        const result = await pgQueries.saveLegacyAvailability.run({ id: (0, pgUtils_1.getDbUlid)(), userId, availability }, (0, db_1.getClient)());
    }
    catch (err) {
        throw new Errors_1.RepoCreateError(err);
    }
}
exports.saveLegacyAvailability = saveLegacyAvailability;
