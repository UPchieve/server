"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routePushToken = void 0;
const PushToken_1 = require("../../models/PushToken");
const auth_utils_1 = require("../../utils/auth-utils");
const type_utils_1 = require("../../utils/type-utils");
function routePushToken(router) {
    router.post('/push-token/save', auth_utils_1.authPassport.isAuthenticated, async function (req, res) {
        const { token } = req.body;
        try {
            if (req.user) {
                await (0, PushToken_1.createPushTokenByUserId)(req.user.id, (0, type_utils_1.asString)(token));
                res.sendStatus(200);
            }
        }
        catch (error) {
            // TODO: use resError error handling
            res.sendStatus(422);
        }
    });
}
exports.routePushToken = routePushToken;
