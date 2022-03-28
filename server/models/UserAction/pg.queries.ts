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


/** 'UpsertIpAddress' parameters type */
export interface IUpsertIpAddressParams {
  ip: string;
}

/** 'UpsertIpAddress' return type */
export interface IUpsertIpAddressResult {
  id: string | null;
}

/** 'UpsertIpAddress' query type */
export interface IUpsertIpAddressQuery {
  params: IUpsertIpAddressParams;
  result: IUpsertIpAddressResult;
}

const upsertIpAddressIR: any = {"name":"upsertIpAddress","params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":678,"b":680,"line":32,"col":13},{"a":811,"b":813,"line":38,"col":44}]}}],"usedParamSet":{"ip":true},"statement":{"body":"WITH ins AS (\n    INSERT INTO ip_addresses (ip, created_at, updated_at)\n    VALUES (:ip!, NOW(), NOW())\n    ON CONFLICT DO NOTHING\n    RETURNING id\n)\nSELECT * FROM ins\nUNION\n    SELECT id FROM ip_addresses WHERE ip = :ip!","loc":{"a":593,"b":813,"line":30,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 *     INSERT INTO ip_addresses (ip, created_at, updated_at)
 *     VALUES (:ip!, NOW(), NOW())
 *     ON CONFLICT DO NOTHING
 *     RETURNING id
 * )
 * SELECT * FROM ins
 * UNION
 *     SELECT id FROM ip_addresses WHERE ip = :ip!
 * ```
 */
export const upsertIpAddress = new PreparedQuery<IUpsertIpAddressParams,IUpsertIpAddressResult>(upsertIpAddressIR);


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

const userHasTakenQuizIR: any = {"name":"userHasTakenQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1090,"b":1096,"line":51,"col":27}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    EXISTS (\n        SELECT\n            1\n        FROM\n            user_actions\n        WHERE\n            action_type = 'QUIZ'\n            AND (action = 'PASSED QUIZ'\n                OR action = 'FAILED QUIZ')\n            AND user_id = :userId!)","loc":{"a":846,"b":1097,"line":41,"col":0}}};

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

const createQuizActionIR: any = {"name":"createQuizAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1272,"b":1282,"line":56,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1286,"b":1292,"line":56,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1296,"b":1302,"line":56,"col":37}]}},{"name":"quizSubcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1306,"b":1321,"line":56,"col":47}]}},{"name":"quizCategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1325,"b":1337,"line":56,"col":66}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1341,"b":1351,"line":56,"col":82}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"quizSubcategory":true,"quizCategory":true,"ipAddressId":true},"statement":{"body":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1131,"b":1389,"line":55,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())
 * RETURNING
 *     id AS ok
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

const createSessionActionIR: any = {"name":"createSessionAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1624,"b":1634,"line":63,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1638,"b":1644,"line":63,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1648,"b":1654,"line":63,"col":37}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1658,"b":1667,"line":63,"col":47}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1671,"b":1681,"line":63,"col":60}]}},{"name":"device","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1685,"b":1690,"line":63,"col":74}]}},{"name":"browser","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1694,"b":1700,"line":63,"col":83}]}},{"name":"browserVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1704,"b":1717,"line":63,"col":93}]}},{"name":"operatingSystem","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1721,"b":1735,"line":63,"col":110}]}},{"name":"operatingSystemVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1739,"b":1760,"line":63,"col":128}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"sessionId":true,"ipAddressId":true,"device":true,"browser":true,"browserVersion":true,"operatingSystem":true,"operatingSystemVersion":true},"statement":{"body":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :sessionId!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1426,"b":1798,"line":62,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, :sessionId!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())
 * RETURNING
 *     id AS ok
 * ```
 */
export const createSessionAction = new PreparedQuery<ICreateSessionActionParams,ICreateSessionActionResult>(createSessionActionIR);


/** 'CreateAccountAction' parameters type */
export interface ICreateAccountActionParams {
  action: string;
  actionType: string;
  banReason: string | null | void;
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

const createAccountActionIR: any = {"name":"createAccountAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1998,"b":2008,"line":70,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2012,"b":2018,"line":70,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2022,"b":2028,"line":70,"col":37}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2032,"b":2042,"line":70,"col":47}]}},{"name":"referenceEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2046,"b":2059,"line":70,"col":61}]}},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2063,"b":2073,"line":70,"col":78}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2077,"b":2085,"line":70,"col":92}]}},{"name":"banReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2089,"b":2097,"line":70,"col":104}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"ipAddressId":true,"referenceEmail":true,"volunteerId":true,"sessionId":true,"banReason":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1835,"b":2135,"line":69,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())
 * RETURNING
 *     id AS ok
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

const createAdminActionIR: any = {"name":"createAdminAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2263,"b":2273,"line":77,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2277,"b":2283,"line":77,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2287,"b":2293,"line":77,"col":37}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":2170,"b":2331,"line":76,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)
 *     VALUES (:actionType!, :action!, :userId!, NOW(), NOW())
 * RETURNING
 *     id AS ok
 * ```
 */
export const createAdminAction = new PreparedQuery<ICreateAdminActionParams,ICreateAdminActionResult>(createAdminActionIR);


