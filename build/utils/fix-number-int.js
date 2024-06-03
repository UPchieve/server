"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixNumberInt = void 0;
// Fix to parse out $numberInt subobject from postgres jsonb values
// TODO: remove this once we fix postgres data
function fixNumberInt(obj) {
    if (!obj)
        return;
    if (obj instanceof Array) {
        return obj.map(v => fixNumberInt(v));
    }
    if (obj instanceof Object) {
        const temp = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object') {
                temp[key] = fixNumberInt(value);
            }
            else if (key === '$numberInt') {
                return Number(value);
            }
            else
                temp[key] = value;
        }
        return temp;
    }
    return obj;
}
exports.fixNumberInt = fixNumberInt;
