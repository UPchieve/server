"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueueService_1 = __importDefault(require("../services/QueueService"));
async function main() {
    let exitCode = 0;
    try {
        const jobToQueue = 'Some sample job'; // Jobs.EmailOnboardingReminderOne
        await QueueService_1.default.add(jobToQueue, {});
        console.log('Added: ', jobToQueue);
    }
    catch (error) {
        console.log('Error: ', error);
        exitCode = 1;
    }
    finally {
        process.exit(exitCode);
    }
}
main();
