"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistmentsError = exports.MissingRecaptchaTokenError = exports.LowRecaptchaScoreError = exports.SmsVerificationDisabledError = exports.TwilioError = exports.AlreadyInUseError = exports.NotAuthenticatedError = exports.LookupError = exports.InputError = exports.NotAllowedError = exports.RepoTransactionError = exports.RepoDeleteError = exports.RepoUpdateError = exports.RepoUpsertError = exports.RepoReadError = exports.RepoCreateError = exports.UserNotFoundError = exports.DEFAULT_ERROR_MESSAGE = void 0;
const ts_custom_error_1 = require("ts-custom-error");
exports.DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again, or contact us at support@upchieve.org for help';
class UserNotFoundError extends ts_custom_error_1.CustomError {
    constructor(attemptedParam, attemptedValue) {
        super(`user not found via parameter ${attemptedParam} and value ${attemptedValue}`);
    }
}
exports.UserNotFoundError = UserNotFoundError;
class RepoCreateError extends ts_custom_error_1.CustomError {
    constructor(arg) {
        if (arg instanceof RepoCreateError)
            return arg;
        else {
            const msg = typeof arg === 'string'
                ? arg
                : `Database create error: ${arg.message}`;
            super(msg);
        }
    }
}
exports.RepoCreateError = RepoCreateError;
class RepoReadError extends ts_custom_error_1.CustomError {
    constructor(arg) {
        if (arg instanceof RepoReadError)
            return arg;
        else {
            const msg = typeof arg === 'string'
                ? arg
                : `Database read error: ${arg.message}`;
            super(msg);
        }
    }
}
exports.RepoReadError = RepoReadError;
class RepoUpsertError extends ts_custom_error_1.CustomError {
    constructor(arg) {
        if (arg instanceof RepoUpsertError)
            return arg;
        else {
            const msg = typeof arg === 'string'
                ? arg
                : `Database upsert error: ${arg.message}`;
            super(msg);
        }
    }
}
exports.RepoUpsertError = RepoUpsertError;
class RepoUpdateError extends ts_custom_error_1.CustomError {
    constructor(arg) {
        if (arg instanceof RepoUpdateError)
            return arg;
        else {
            const msg = typeof arg === 'string'
                ? arg
                : `Database update error: ${arg.message}`;
            super(msg);
        }
    }
}
exports.RepoUpdateError = RepoUpdateError;
class RepoDeleteError extends ts_custom_error_1.CustomError {
    constructor(arg) {
        if (arg instanceof RepoDeleteError)
            return arg;
        else {
            const msg = typeof arg === 'string'
                ? arg
                : `Database delete error: ${arg.message}`;
            super(msg);
        }
    }
}
exports.RepoDeleteError = RepoDeleteError;
class RepoTransactionError extends ts_custom_error_1.CustomError {
    constructor(arg) {
        if (arg instanceof RepoTransactionError)
            return arg;
        else {
            const msg = typeof arg === 'string'
                ? arg
                : `Database transaction error: ${arg.message}`;
            super(msg);
        }
    }
}
exports.RepoTransactionError = RepoTransactionError;
class NotAllowedError extends ts_custom_error_1.CustomError {
}
exports.NotAllowedError = NotAllowedError;
class InputError extends ts_custom_error_1.CustomError {
}
exports.InputError = InputError;
class LookupError extends ts_custom_error_1.CustomError {
}
exports.LookupError = LookupError;
class NotAuthenticatedError extends ts_custom_error_1.CustomError {
    constructor() {
        super('Request is not authenticated');
    }
}
exports.NotAuthenticatedError = NotAuthenticatedError;
class AlreadyInUseError extends ts_custom_error_1.CustomError {
}
exports.AlreadyInUseError = AlreadyInUseError;
class TwilioError extends ts_custom_error_1.CustomError {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}
exports.TwilioError = TwilioError;
class SmsVerificationDisabledError extends ts_custom_error_1.CustomError {
    constructor() {
        super('SMS verification is currently not available. Please verify by email or contact the UPchieve team at support@upchieve.org for help.');
    }
}
exports.SmsVerificationDisabledError = SmsVerificationDisabledError;
class LowRecaptchaScoreError extends ts_custom_error_1.CustomError {
    constructor() {
        super('Something went wrong. Please refresh the page and try again.');
    }
}
exports.LowRecaptchaScoreError = LowRecaptchaScoreError;
class MissingRecaptchaTokenError extends ts_custom_error_1.CustomError {
    constructor() {
        super('Something went wrong. Please contact the UPchieve team at support@upchieve.org for help.');
    }
}
exports.MissingRecaptchaTokenError = MissingRecaptchaTokenError;
class AssistmentsError extends ts_custom_error_1.CustomError {
    constructor(message, retry) {
        super();
        this.message = message;
        this.retry = retry;
    }
}
exports.AssistmentsError = AssistmentsError;
