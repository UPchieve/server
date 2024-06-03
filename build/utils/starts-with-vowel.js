"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function startsWithVowel(word) {
    return /[AEIOUaeiou]/i.test(word[0]);
}
exports.default = startsWithVowel;
