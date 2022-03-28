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
  createdAt: Date;
}

/** 'GetQuizzesPassedForDateRangeByVolunteerId' query type */
export interface IGetQuizzesPassedForDateRangeByVolunteerIdQuery {
  params: IGetQuizzesPassedForDateRangeByVolunteerIdParams;
  result: IGetQuizzesPassedForDateRangeByVolunteerIdResult;
}

const getQuizzesPassedForDateRangeByVolunteerIdIR: any = {"name":"getQuizzesPassedForDateRangeByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":179,"b":185,"line":9,"col":19}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":215,"b":220,"line":10,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":250,"b":253,"line":11,"col":27}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    created_at\nFROM\n    user_actions\nWHERE\n    action_type = 'QUIZ'\n    AND action = 'PASSED QUIZ'\n    AND user_id = :userId!\n    AND created_at >= DATE(:start!)\n    AND created_at < DATE(:end!)","loc":{"a":54,"b":254,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     created_at
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

const getSessionRequestedUserAgentFromSessionIdIR: any = {"name":"getSessionRequestedUserAgentFromSessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":540,"b":549,"line":27,"col":22}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    action_type = 'SESSION'\n    AND action = 'REQUESTED SESSION'\n    AND session_id = :sessionId!","loc":{"a":313,"b":549,"line":15,"col":0}}};

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

const upsertIpAddressIR: any = {"name":"upsertIpAddress","params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":667,"b":669,"line":33,"col":17},{"a":875,"b":877,"line":48,"col":14}]}}],"usedParamSet":{"ip":true},"statement":{"body":"WITH ins AS (\nINSERT INTO ip_addresses (ip, created_at, updated_at)\n        VALUES (:ip!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        ip_addresses\n    WHERE\n        ip = :ip!","loc":{"a":582,"b":877,"line":31,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * WITH ins AS (
 * INSERT INTO ip_addresses (ip, created_at, updated_at)
 *         VALUES (:ip!, NOW(), NOW())
 *     ON CONFLICT
 *         DO NOTHING
 *     RETURNING
 *         id)
 *     SELECT
 *         *
 *     FROM
 *         ins
 *     UNION
 *     SELECT
 *         id
 *     FROM
 *         ip_addresses
 *     WHERE
 *         ip = :ip!
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

const userHasTakenQuizIR: any = {"name":"userHasTakenQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1155,"b":1161,"line":62,"col":27}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    EXISTS (\n        SELECT\n            1\n        FROM\n            user_actions\n        WHERE\n            action_type = 'QUIZ'\n            AND (action = 'PASSED QUIZ'\n                OR action = 'FAILED QUIZ')\n            AND user_id = :userId!)","loc":{"a":911,"b":1162,"line":52,"col":0}}};

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

const createQuizActionIR: any = {"name":"createQuizAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1337,"b":1347,"line":67,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1351,"b":1357,"line":67,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1361,"b":1367,"line":67,"col":37}]}},{"name":"quizSubcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1371,"b":1386,"line":67,"col":47}]}},{"name":"quizCategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1390,"b":1402,"line":67,"col":66}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1406,"b":1416,"line":67,"col":82}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"quizSubcategory":true,"quizCategory":true,"ipAddressId":true},"statement":{"body":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1196,"b":1454,"line":66,"col":0}}};

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

const createSessionActionIR: any = {"name":"createSessionAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1689,"b":1699,"line":74,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1703,"b":1709,"line":74,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1713,"b":1719,"line":74,"col":37}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1723,"b":1732,"line":74,"col":47}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1736,"b":1746,"line":74,"col":60}]}},{"name":"device","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1750,"b":1755,"line":74,"col":74}]}},{"name":"browser","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1759,"b":1765,"line":74,"col":83}]}},{"name":"browserVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1769,"b":1782,"line":74,"col":93}]}},{"name":"operatingSystem","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1786,"b":1800,"line":74,"col":110}]}},{"name":"operatingSystemVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1804,"b":1825,"line":74,"col":128}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"sessionId":true,"ipAddressId":true,"device":true,"browser":true,"browserVersion":true,"operatingSystem":true,"operatingSystemVersion":true},"statement":{"body":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :sessionId!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1491,"b":1863,"line":73,"col":0}}};

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

const createAccountActionIR: any = {"name":"createAccountAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2063,"b":2073,"line":81,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2077,"b":2083,"line":81,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2087,"b":2093,"line":81,"col":37}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2097,"b":2107,"line":81,"col":47}]}},{"name":"referenceEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2111,"b":2124,"line":81,"col":61}]}},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2128,"b":2138,"line":81,"col":78}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2142,"b":2150,"line":81,"col":92}]}},{"name":"banReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2154,"b":2162,"line":81,"col":104}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"ipAddressId":true,"referenceEmail":true,"volunteerId":true,"sessionId":true,"banReason":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1900,"b":2200,"line":80,"col":0}}};

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

const createAdminActionIR: any = {"name":"createAdminAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2328,"b":2338,"line":88,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2342,"b":2348,"line":88,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2352,"b":2358,"line":88,"col":37}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":2235,"b":2396,"line":87,"col":0}}};

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


