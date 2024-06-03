"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_ACTIONS = exports.NO_FLAGS = exports.CounterMetricProcessor = void 0;
const enum_utils_1 = require("../../utils/enum-utils");
const constants_1 = require("../../constants");
class CounterMetricProcessor {
    constructor() {
        this.computeFinalValue = (usm, value) => {
            if (!usm)
                return 0;
            const key = (0, enum_utils_1.getEnumKeyByEnumValue)(constants_1.USER_SESSION_METRICS, this.key);
            // Do nothing if one of these keys shows
            if (key === 'coachReportedStudentDm' || key === 'studentReportedCoachDm')
                return 0;
            if (key)
                return usm[key] + value;
            throw new Error(`Counter metric processor key ${this.key} is invalid`);
        };
        this.computeStudentUpdateQuery = (pd) => {
            const metric = (0, enum_utils_1.getEnumKeyByEnumValue)(constants_1.USER_SESSION_METRICS, this.key);
            if (!metric)
                throw new Error(`Metric for ${this.key} undefined`);
            const finalValue = this.computeFinalValue(pd.studentUSM, pd.value);
            return { [metric]: finalValue };
        };
        this.computeVolunteerUpdateQuery = (pd) => {
            if (!pd.volunteerUSM)
                return {};
            const metric = (0, enum_utils_1.getEnumKeyByEnumValue)(constants_1.USER_SESSION_METRICS, this.key);
            if (!metric)
                throw new Error(`Metric for ${this.key} undefined`);
            const finalValue = this.computeFinalValue(pd.volunteerUSM, pd.value);
            return { [metric]: finalValue };
        };
    }
}
exports.CounterMetricProcessor = CounterMetricProcessor;
exports.NO_FLAGS = [];
exports.NO_ACTIONS = [];
