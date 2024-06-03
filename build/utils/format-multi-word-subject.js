"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
// TODO: should take proper subject type
const formatMultiWordSubject = (subject) => {
    const formattedSubject = constants_1.FORMAT_SUBJECT_TO_DISPLAY_NAME[subject];
    if (formattedSubject)
        return formattedSubject;
    return subject;
};
exports.default = formatMultiWordSubject;
