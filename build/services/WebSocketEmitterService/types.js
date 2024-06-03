"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asWebSocketPacket = void 0;
const type_utils_1 = require("../../utils/type-utils");
exports.asWebSocketPacket = (0, type_utils_1.asFactory)({
    socketId: type_utils_1.asString,
    message: type_utils_1.asAny,
});
