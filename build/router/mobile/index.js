"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_1 = __importDefault(require("../../config"));
function routes(app) {
    // TODO: need to set FIREBASE_PRIVATE_KEY_JSON in local development to run
    if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
        firebase_admin_1.default.initializeApp({
            projectId: config_1.default.firebase.projectId,
            credential: firebase_admin_1.default.credential.cert(JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON)),
        });
    }
    // used in native app to workaround iOS 3rd party cookie limitation
    app.use('/setcookie', function (req, res) {
        res.cookie('mobile_cookie', '1', { maxAge: 3600 * 24 * 365 * 10 });
        res.redirect(302, 'http://localhost:12380?redirected');
    });
}
exports.routes = routes;
