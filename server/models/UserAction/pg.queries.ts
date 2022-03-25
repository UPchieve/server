/** Types generated for queries found in "server/models/UserAction/user_action.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetQuizzesPassedForDateRangeByVolunteerId' parameters type */
export interface IGetQuizzesPassedForDateRangeByVolunteerIdParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetQuizzesPassedForDateRangeByVolunteerId' return type */
export interface IGetQuizzesPassedForDateRangeByVolunteerIdResult {
  total: number | null;
}

/** 'GetQuizzesPassedForDateRangeByVolunteerId' query type */
export interface IGetQuizzesPassedForDateRangeByVolunteerIdQuery {
  params: IGetQuizzesPassedForDateRangeByVolunteerIdParams;
  result: IGetQuizzesPassedForDateRangeByVolunteerIdResult;
}

const getQuizzesPassedForDateRangeByVolunteerIdIR: any = {"name":"getQuizzesPassedForDateRangeByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":191,"b":197,"line":9,"col":19}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":227,"b":232,"line":10,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":262,"b":265,"line":11,"col":27}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    count(*)::int AS total\nFROM\n    user_actions\nWHERE\n    action_type = 'QUIZ'\n    AND action = 'PASSED QUIZ'\n    AND user_id = :userId!\n    AND created_at >= DATE(:start!)\n    AND created_at < DATE(:end!)","loc":{"a":54,"b":266,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     count(*)::int AS total
 * FROM
 *     user_actions
 * WHERE
 *     action_type = 'QUIZ'
 *     AND action = 'PASSED QUIZ'
 *     AND user_id = :userId!
 *     AND created_at >= DATE(:start!)
 *     AND created_at < DATE(:end!)
 * ```
 */
export const getQuizzesPassedForDateRangeByVolunteerId = new PreparedQuery<IGetQuizzesPassedForDateRangeByVolunteerIdParams,IGetQuizzesPassedForDateRangeByVolunteerIdResult>(getQuizzesPassedForDateRangeByVolunteerIdIR);


/** 'GetSessionRequestedUserAgentFromSessionId' parameters type */
export interface IGetSessionRequestedUserAgentFromSessionIdParams {
  sessionId: string;
}

/** 'GetSessionRequestedUserAgentFromSessionId' return type */
export interface IGetSessionRequestedUserAgentFromSessionIdResult {
  browser: string | null;
  browserVersion: string | null;
  device: string | null;
  id: string;
  operatingSystem: string | null;
  operatingSystemVersion: string | null;
}

/** 'GetSessionRequestedUserAgentFromSessionId' query type */
export interface IGetSessionRequestedUserAgentFromSessionIdQuery {
  params: IGetSessionRequestedUserAgentFromSessionIdParams;
  result: IGetSessionRequestedUserAgentFromSessionIdResult;
}

const getSessionRequestedUserAgentFromSessionIdIR: any = {"name":"getSessionRequestedUserAgentFromSessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":552,"b":561,"line":27,"col":22}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    action_type = 'SESSION'\n    AND action = 'REQUESTED SESSION'\n    AND session_id = :sessionId!","loc":{"a":325,"b":561,"line":15,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     device,
 *     browser,
 *     browser_version,
 *     operating_system,
 *     operating_system_version
 * FROM
 *     user_actions
 * WHERE
 *     action_type = 'SESSION'
 *     AND action = 'REQUESTED SESSION'
 *     AND session_id = :sessionId!
 * ```
 */
export const getSessionRequestedUserAgentFromSessionId = new PreparedQuery<IGetSessionRequestedUserAgentFromSessionIdParams,IGetSessionRequestedUserAgentFromSessionIdResult>(getSessionRequestedUserAgentFromSessionIdIR);


/** 'UserHasTakenQuiz' parameters type */
export interface IUserHasTakenQuizParams {
  userId: string;
}

/** 'UserHasTakenQuiz' return type */
export interface IUserHasTakenQuizResult {
  exists: boolean | null;
}

/** 'UserHasTakenQuiz' query type */
export interface IUserHasTakenQuizQuery {
  params: IUserHasTakenQuizParams;
  result: IUserHasTakenQuizResult;
}

const userHasTakenQuizIR: any = {"name":"userHasTakenQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":839,"b":845,"line":41,"col":27}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    EXISTS (\n        SELECT\n            1\n        FROM\n            user_actions\n        WHERE\n            action_type = 'QUIZ'\n            AND (action = 'PASSED QUIZ'\n                OR action = 'FAILED QUIZ')\n            AND user_id = :userId!)","loc":{"a":595,"b":846,"line":31,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             user_actions
 *         WHERE
 *             action_type = 'QUIZ'
 *             AND (action = 'PASSED QUIZ'
 *                 OR action = 'FAILED QUIZ')
 *             AND user_id = :userId!)
 * ```
 */
export const userHasTakenQuiz = new PreparedQuery<IUserHasTakenQuizParams,IUserHasTakenQuizResult>(userHasTakenQuizIR);


/** 'CreateQuizAction' parameters type */
export interface ICreateQuizActionParams {
  action: string;
  actionType: string;
  ipAddressId: string | null | void;
  quizCategory: string;
  quizSubcategory: string;
  userId: string;
}

/** 'CreateQuizAction' return type */
export interface ICreateQuizActionResult {
  ok: string;
}

/** 'CreateQuizAction' query type */
export interface ICreateQuizActionQuery {
  params: ICreateQuizActionParams;
  result: ICreateQuizActionResult;
}

const createQuizActionIR: any = {"name":"createQuizAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1021,"b":1031,"line":46,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1035,"b":1041,"line":46,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1045,"b":1051,"line":46,"col":37}]}},{"name":"quizSubcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1055,"b":1070,"line":46,"col":47}]}},{"name":"quizCategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1074,"b":1086,"line":46,"col":66}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1090,"b":1100,"line":46,"col":82}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"quizSubcategory":true,"quizCategory":true,"ipAddressId":true},"statement":{"body":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW()) RETURNING id as ok","loc":{"a":880,"b":1134,"line":45,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW()) RETURNING id as ok
 * ```
 */
export const createQuizAction = new PreparedQuery<ICreateQuizActionParams,ICreateQuizActionResult>(createQuizActionIR);


/** 'CreateSessionAction' parameters type */
export interface ICreateSessionActionParams {
  action: string;
  actionType: string;
  browser: string | null | void;
  browserVersion: string | null | void;
  device: string | null | void;
  ipAddressId: string | null | void;
  operatingSystem: string | null | void;
  operatingSystemVersion: string | null | void;
  sessionId: string;
  userId: string;
}

/** 'CreateSessionAction' return type */
export interface ICreateSessionActionResult {
  ok: string;
}

/** 'CreateSessionAction' query type */
export interface ICreateSessionActionQuery {
  params: ICreateSessionActionParams;
  result: ICreateSessionActionResult;
}

const createSessionActionIR: any = {"name":"createSessionAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1368,"b":1378,"line":50,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1382,"b":1388,"line":50,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1392,"b":1398,"line":50,"col":37}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1402,"b":1411,"line":50,"col":47}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1415,"b":1425,"line":50,"col":60}]}},{"name":"device","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1429,"b":1434,"line":50,"col":74}]}},{"name":"browser","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1438,"b":1444,"line":50,"col":83}]}},{"name":"browserVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1448,"b":1461,"line":50,"col":93}]}},{"name":"operatingSystem","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1465,"b":1479,"line":50,"col":110}]}},{"name":"operatingSystemVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1483,"b":1504,"line":50,"col":128}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"sessionId":true,"ipAddressId":true,"device":true,"browser":true,"browserVersion":true,"operatingSystem":true,"operatingSystemVersion":true},"statement":{"body":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :sessionId!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW()) RETURNING id as ok","loc":{"a":1170,"b":1538,"line":49,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, :sessionId!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW()) RETURNING id as ok
 * ```
 */
export const createSessionAction = new PreparedQuery<ICreateSessionActionParams,ICreateSessionActionResult>(createSessionActionIR);


/** 'CreateAccountAction' parameters type */
export interface ICreateAccountActionParams {
  action: string;
  actionType: string;
  ipAddressId: string | null | void;
  referenceEmail: string | null | void;
  sessionId: string | null | void;
  userId: string;
  volunteerId: string | null | void;
}

/** 'CreateAccountAction' return type */
export interface ICreateAccountActionResult {
  ok: string;
}

/** 'CreateAccountAction' query type */
export interface ICreateAccountActionQuery {
  params: ICreateAccountActionParams;
  result: ICreateAccountActionResult;
}

const createAccountActionIR: any = {"name":"createAccountAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1725,"b":1735,"line":54,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1739,"b":1745,"line":54,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1749,"b":1755,"line":54,"col":37}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1759,"b":1769,"line":54,"col":47}]}},{"name":"referenceEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1773,"b":1786,"line":54,"col":61}]}},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1790,"b":1800,"line":54,"col":78}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1804,"b":1812,"line":54,"col":92}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"ipAddressId":true,"referenceEmail":true,"volunteerId":true,"sessionId":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, NOW(), NOW()) RETURNING id as ok","loc":{"a":1574,"b":1846,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, NOW(), NOW()) RETURNING id as ok
 * ```
 */
export const createAccountAction = new PreparedQuery<ICreateAccountActionParams,ICreateAccountActionResult>(createAccountActionIR);


/** 'CreateAdminAction' parameters type */
export interface ICreateAdminActionParams {
  action: string;
  actionType: string;
  userId: string;
}

/** 'CreateAdminAction' return type */
export interface ICreateAdminActionResult {
  ok: string;
}

/** 'CreateAdminAction' query type */
export interface ICreateAdminActionQuery {
  params: ICreateAdminActionParams;
  result: ICreateAdminActionResult;
}

const createAdminActionIR: any = {"name":"createAdminAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1973,"b":1983,"line":58,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1987,"b":1993,"line":58,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1997,"b":2003,"line":58,"col":37}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, NOW(), NOW()) RETURNING id as ok","loc":{"a":1880,"b":2037,"line":57,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, NOW(), NOW()) RETURNING id as ok
 * ```
 */
export const createAdminAction = new PreparedQuery<ICreateAdminActionParams,ICreateAdminActionResult>(createAdminActionIR);


