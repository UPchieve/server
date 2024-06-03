"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnumKeyByEnumValue = void 0;
// Reverse mapping of enum
// TODO: should throw an error if key is not found
function getEnumKeyByEnumValue(myEnum, enumValue) {
    const keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue);
    return keys.length > 0 ? keys[0] : undefined;
}
exports.getEnumKeyByEnumValue = getEnumKeyByEnumValue;
