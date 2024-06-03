"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const _1 = require(".");
const queries_1 = require("../../models/Volunteer/queries");
const logger_1 = __importDefault(require("../../logger"));
const QueueService_1 = __importDefault(require("../../services/QueueService"));
// Runs weekly at 6am EST on Monday
exports.default = async () => {
    //  Monday-Sunday
    const lastMonday = (0, moment_1.default)()
        .utc()
        .subtract(1, 'weeks')
        .startOf('isoWeek')
        .toISOString();
    const lastSunday = (0, moment_1.default)()
        .utc()
        .subtract(1, 'weeks')
        .endOf('isoWeek')
        .toISOString();
    const volunteers = await (0, queries_1.getVolunteersForWeeklyHourSummary)();
    const errors = [];
    for (const volunteer of volunteers) {
        try {
            await QueueService_1.default.add(_1.Jobs.EmailWeeklyHourSummary, {
                startDate: lastMonday,
                endDate: lastSunday,
                volunteer,
            }, {
                /*
                  By default, all jobs have the highest priority of 1.
                  Since this job can spawn a few thousand jobs that aren't time sensitive,
                  we're setting priority to 3. That way, if we have 10,000 of these jobs
                  in the queue and a `NotifyTutors` job comes in, it can skip to the front
                  of the queue.
                */
                priority: 3,
            });
        }
        catch (error) {
            errors.push({ userId: volunteer.id, error });
        }
    }
    if (errors.length) {
        logger_1.default.error('%s: Failed to queue %d! jobs: %o', _1.Jobs.SpawnEmailWeeklyHourSummaryJobs, errors.length, {
            lastMonday,
            lastSunday,
            errors: errors,
        });
    }
};
