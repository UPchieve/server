"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asReferenceFormData = void 0;
const type_utils_1 = require("./type-utils");
exports.asReferenceFormData = (0, type_utils_1.asFactory)({
    affiliation: type_utils_1.asString,
    relationshipLength: type_utils_1.asString,
    patient: type_utils_1.asNumber,
    positiveRoleModel: type_utils_1.asNumber,
    agreeableAndApproachable: type_utils_1.asNumber,
    communicatesEffectively: type_utils_1.asNumber,
    trustworthyWithChildren: type_utils_1.asNumber,
    rejectionReason: type_utils_1.asString,
    additionalInfo: type_utils_1.asString,
});
