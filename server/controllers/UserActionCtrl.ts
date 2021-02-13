import UAParser from 'ua-parser-js';
import { Types } from 'mongoose';
import UserAction, {
  UserActionAgent,
  UserActionDocument
} from '../models/UserAction';
import { USER_ACTION } from '../constants';
import getSubjectType from '../utils/getSubjectType';
import getDeviceFromUserAgent from '../utils/getDeviceFromUserAgent';

function getUserAgentInfo(userAgent: string): UserActionAgent {
  const userAgentParserResult = new UAParser(userAgent).getResult();
  const { device, browser, os } = userAgentParserResult;
  return {
    device: device.vendor || getDeviceFromUserAgent(userAgent),
    browser: browser.name || '',
    browserVersion: browser.version || '',
    operatingSystem: os.name || '',
    operatingSystemVersion: os.version || ''
  };
}

export class QuizActionCreator {
  constructor(
    private userId: Types.ObjectId,
    private quizSubcategory: string,
    private ipAddress = ''
  ) {}

  async createQuizAction(action: string): Promise<UserActionDocument> {
    const userActionDoc = new UserAction({
      actionType: USER_ACTION.TYPE.QUIZ,
      action,
      user: this.userId,
      quizSubcategory: this.quizSubcategory.toUpperCase(),
      quizCategory: getSubjectType(this.quizSubcategory).toUpperCase(),
      ipAddress: this.ipAddress ?? ''
    });

    return userActionDoc.save();
  }

  startedQuiz(): Promise<UserActionDocument> {
    return this.createQuizAction(USER_ACTION.QUIZ.STARTED);
  }
  passedQuiz(): Promise<UserActionDocument> {
    return this.createQuizAction(USER_ACTION.QUIZ.PASSED);
  }

  failedQuiz(): Promise<UserActionDocument> {
    return this.createQuizAction(USER_ACTION.QUIZ.FAILED);
  }

  viewedMaterials(): Promise<UserActionDocument> {
    return this.createQuizAction(USER_ACTION.QUIZ.VIEWED_MATERIALS);
  }

  unlockedSubject(): Promise<UserActionDocument> {
    return this.createQuizAction(USER_ACTION.QUIZ.UNLOCKED_SUBJECT);
  }
}

export class SessionActionCreator {
  constructor(
    private userId: Types.ObjectId,
    private sessionId: string,
    private userAgent = '',
    private ipAddress = ''
  ) {}

  async createSessionAction(action: string): Promise<UserActionDocument> {
    const userAgentResult = this.userAgent
      ? getUserAgentInfo(this.userAgent)
      : {};
    const userActionDoc = new UserAction({
      user: this.userId,
      session: this.sessionId,
      actionType: USER_ACTION.TYPE.SESSION,
      action,
      ipAddress: this.ipAddress,
      ...userAgentResult
    });

    return userActionDoc.save();
  }

  requestedSession(): Promise<UserActionDocument> {
    return this.createSessionAction(USER_ACTION.SESSION.REQUESTED);
  }

  repliedYesToSession(): Promise<UserActionDocument> {
    return this.createSessionAction(USER_ACTION.SESSION.REPLIED_YES);
  }

  joinedSession(): Promise<UserActionDocument> {
    return this.createSessionAction(USER_ACTION.SESSION.JOINED);
  }

  rejoinedSession(): Promise<UserActionDocument> {
    return this.createSessionAction(USER_ACTION.SESSION.REJOINED);
  }

  endedSession(): Promise<UserActionDocument> {
    return this.createSessionAction(USER_ACTION.SESSION.ENDED);
  }

  timedOutSession(timeoutTime: number): Promise<UserActionDocument> {
    let action: string;
    if (timeoutTime === 15) action = USER_ACTION.SESSION.TIMED_OUT_15_MINS;
    else action = USER_ACTION.SESSION.TIMED_OUT_45_MINS;
    return this.createSessionAction(action);
  }
}

export class AccountActionCreator {
  constructor(
    private userId: Types.ObjectId,
    private ipAddress = '',
    private options = {}
  ) {}

  async createAccountAction(action: string): Promise<UserActionDocument> {
    const userActionDoc = new UserAction({
      user: this.userId,
      actionType: USER_ACTION.TYPE.ACCOUNT,
      ipAddress: this.ipAddress,
      action,
      ...this.options
    });
    return userActionDoc.save();
  }

  updatedProfile(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.UPDATED_PROFILE);
  }

  updatedAvailability(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.UPDATED_AVAILABILITY);
  }

  createdAccount(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.CREATED);
  }

  addedPhotoId(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.ADDED_PHOTO_ID);
  }

  addedReference(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.ADDED_REFERENCE);
  }

  completedBackgroundInfo(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.DELETED_REFERENCE);
  }

  deletedReference(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.DELETED_REFERENCE);
  }

  accountApproved(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.APPROVED);
  }

  accountOnboarded(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.ONBOARDED);
  }

  accountBanned(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.BANNED);
  }

  accountDeactivated(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.DEACTIVATED);
  }

  submittedReferenceForm(): Promise<UserActionDocument> {
    return this.createAccountAction(
      USER_ACTION.ACCOUNT.SUBMITTED_REFERENCE_FORM
    );
  }

  rejectedPhotoId(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.REJECTED_PHOTO_ID);
  }

  rejectedReference(): Promise<UserActionDocument> {
    return this.createAccountAction(USER_ACTION.ACCOUNT.REJECTED_REFERENCE);
  }
}

export class AdminActionCreator {
  constructor(private userId: string, private options = {}) {}

  async createAdminAction(action: string): Promise<UserActionDocument> {
    const userActionDoc = new UserAction({
      user: this.userId,
      actionType: USER_ACTION.TYPE.ADMIN,
      action,
      ...this.options
    });
    return userActionDoc.save();
  }

  adminDeactivatedAccount(): Promise<UserActionDocument> {
    return this.createAdminAction(USER_ACTION.ACCOUNT.DEACTIVATED);
  }
}
