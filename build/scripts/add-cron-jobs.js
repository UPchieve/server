"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const lodash_1 = require("lodash");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../worker/logger");
const jobs_1 = require("../worker/jobs");
const jobTemplates = [
    {
        name: jobs_1.Jobs.UpdateElapsedAvailability,
        options: { repeat: { cron: '0 4 * * *', tz: 'America/New_York' } }, // each day at 4am
    },
    {
        name: jobs_1.Jobs.EndStaleSessions,
        options: { repeat: { cron: '0 */2 * * *' } }, // every 2 hours at minute 0
    },
    {
        name: jobs_1.Jobs.EmailReferences,
        options: { repeat: { cron: '*/15 * * * *' } }, // every 15 minutes
    },
    {
        name: jobs_1.Jobs.EmailReadyToCoach,
        options: { repeat: { cron: '30 * * * *' } }, // every hour at minute 30
    },
    {
        name: jobs_1.Jobs.EmailReferenceFollowup,
        options: { repeat: { cron: '0 10 * * *', tz: 'America/New_York' } }, // each day at 10am
    },
    {
        name: jobs_1.Jobs.EmailWaitingOnReferences,
        options: { repeat: { cron: '0 11 * * *', tz: 'America/New_York' } }, // each day at 11am
    },
    {
        name: jobs_1.Jobs.EmailNiceToMeetYou,
        options: { repeat: { cron: '0 10 * * *', tz: 'America/New_York' } }, // each day at 10am
    },
    {
        name: jobs_1.Jobs.UpdateTotalVolunteerHours,
        options: { repeat: { cron: '0 6 * * MON', tz: 'America/New_York' } }, // every Monday at 6am EST
    },
    {
        name: jobs_1.Jobs.SpawnEmailWeeklyHourSummaryJobs,
        options: { repeat: { cron: '0 6 * * MON', tz: 'America/New_York' } }, // every Monday at 6am EST
    },
    {
        name: jobs_1.Jobs.EmailVolunteerInactive,
        options: { repeat: { cron: '0 9 * * *', tz: 'America/New_York' } }, // each day at 9am
    },
    {
        name: jobs_1.Jobs.EmailVolunteerInactiveBlackoutOver,
        options: { repeat: { cron: '0 9 2 9 *', tz: 'America/New_York' } }, // On Septempber 2nd at 9am
    },
    {
        name: jobs_1.Jobs.GenerateAndStoreWaitTimeHeatMap,
        options: { repeat: { cron: '0 8 * * MON', tz: 'America/New_York' } }, // every Monday at 8am EST
    },
];
const main = async () => {
    try {
        const queue = new bull_1.default(config_1.default.workerQueueName, {
            createClient: () => new ioredis_1.default(config_1.default.redisConnectionString),
            settings: {
                // to prevent stalling long jobs
                stalledInterval: 1000 * 60 * 30,
                lockDuration: 1000 * 60 * 30,
            },
        });
        const repeatableJobs = await queue.getRepeatableJobs();
        await Promise.all((0, lodash_1.map)(repeatableJobs, async (job) => {
            if ((0, lodash_1.find)(jobTemplates, template => template.name === job.name)) {
                (0, logger_1.log)(`Stopping jobs: \n${JSON.stringify(job, null, ' ')}`);
                await queue.removeRepeatableByKey(job.key);
            }
        }));
        (0, logger_1.log)(`Starting jobs: \n${JSON.stringify(jobTemplates, null, ' ')}`);
        await Promise.all((0, lodash_1.map)(jobTemplates, job => queue.add(job.name, job.data, {
            ...job.options,
            removeOnComplete: true,
            removeOnFail: true,
        })));
        process.exit(0);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
main();
