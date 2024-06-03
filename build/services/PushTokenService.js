"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVolunteerJoined = void 0;
const firebase_admin_1 = require("firebase-admin");
const case_1 = __importDefault(require("case"));
async function sendToUser(title, text, data, tokens) {
    return await (0, firebase_admin_1.messaging)().sendMulticast({
        tokens,
        // ios and android process data a little differently, so setup separate objects for each
        apns: {
            payload: Object.assign({
                data,
            }, {
                aps: {
                    alert: {
                        title: title,
                        body: text,
                        'content-available': 1,
                    },
                },
            }),
        },
        android: {
            // TS says this needs to be a string,
            // of 'high' | 'normal'
            // Guessing that 1 is equivalent with 'high'
            priority: 'high',
            data: {
                title: title,
                body: text,
                message: text,
                // image: imageUrl,
                payload: JSON.stringify(data),
                'content-available': '1',
                // type: message.type,
                icon: 'notification_icon',
                color: '#16d2aa',
            },
        },
    });
}
async function sendVolunteerJoined(session, tokens) {
    const { topic, subject, id } = session;
    const title = 'We found a volunteer!';
    const text = 'Start chatting with your coach now.';
    const data = {
        path: `/session/${case_1.default.kebab(topic)}/${case_1.default.kebab(subject)}/${id}`,
    };
    await sendToUser(title, text, data, tokens);
}
exports.sendVolunteerJoined = sendVolunteerJoined;
