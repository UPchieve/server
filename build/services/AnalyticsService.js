"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identify = exports.captureEvent = void 0;
const product_client_1 = require("../product-client");
const captureEvent = (userId, eventName, eventProperties, userProperties) => {
    const properties = {
        ...eventProperties,
        $set: userProperties,
    };
    product_client_1.client.capture({
        distinctId: userId.toString(),
        event: eventName,
        properties,
    });
};
exports.captureEvent = captureEvent;
function identify(userId, properties) {
    product_client_1.client.identify({
        distinctId: userId.toString(),
        properties,
    });
}
exports.identify = identify;
