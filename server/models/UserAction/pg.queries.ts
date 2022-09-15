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


/** 'GetQuizzesPassedForDateRangeForTelecomReportByVolunteerId' parameters type */
export interface IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdParams {
  end: Date;
  start: Date;
  userId: string;
}

/** 'GetQuizzesPassedForDateRangeForTelecomReportByVolunteerId' return type */
export interface IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdResult {
  createdAt: Date;
}

/** 'GetQuizzesPassedForDateRangeForTelecomReportByVolunteerId' query type */
export interface IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdQuery {
  params: IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdParams;
  result: IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdResult;
}

const getQuizzesPassedForDateRangeForTelecomReportByVolunteerIdIR: any = {"name":"getQuizzesPassedForDateRangeForTelecomReportByVolunteerId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":466,"b":472,"line":22,"col":19}]}},{"name":"start","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":502,"b":507,"line":23,"col":28}]}},{"name":"end","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":537,"b":540,"line":24,"col":27}]}}],"usedParamSet":{"userId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    created_at\nFROM\n    user_actions\nWHERE\n    action_type = 'QUIZ'\n    AND action = 'PASSED QUIZ'\n    AND user_id = :userId!\n    AND created_at >= DATE(:start!)\n    AND created_at < DATE(:end!)","loc":{"a":341,"b":541,"line":15,"col":0}}};

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
export const getQuizzesPassedForDateRangeForTelecomReportByVolunteerId = new PreparedQuery<IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdParams,IGetQuizzesPassedForDateRangeForTelecomReportByVolunteerIdResult>(getQuizzesPassedForDateRangeForTelecomReportByVolunteerIdIR);


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

const getSessionRequestedUserAgentFromSessionIdIR: any = {"name":"getSessionRequestedUserAgentFromSessionId","params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":827,"b":836,"line":40,"col":22}]}}],"usedParamSet":{"sessionId":true},"statement":{"body":"SELECT\n    id,\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    action_type = 'SESSION'\n    AND action = 'REQUESTED SESSION'\n    AND session_id = :sessionId!","loc":{"a":600,"b":836,"line":28,"col":0}}};

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

const upsertIpAddressIR: any = {"name":"upsertIpAddress","params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":954,"b":956,"line":46,"col":17},{"a":1162,"b":1164,"line":61,"col":14}]}}],"usedParamSet":{"ip":true},"statement":{"body":"WITH ins AS (\nINSERT INTO ip_addresses (ip, created_at, updated_at)\n        VALUES (:ip!, NOW(), NOW())\n    ON CONFLICT\n        DO NOTHING\n    RETURNING\n        id)\n    SELECT\n        *\n    FROM\n        ins\n    UNION\n    SELECT\n        id\n    FROM\n        ip_addresses\n    WHERE\n        ip = :ip!","loc":{"a":869,"b":1164,"line":44,"col":0}}};

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

const userHasTakenQuizIR: any = {"name":"userHasTakenQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1442,"b":1448,"line":75,"col":27}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    EXISTS (\n        SELECT\n            1\n        FROM\n            user_actions\n        WHERE\n            action_type = 'QUIZ'\n            AND (action = 'PASSED QUIZ'\n                OR action = 'FAILED QUIZ')\n            AND user_id = :userId!)","loc":{"a":1198,"b":1449,"line":65,"col":0}}};

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

const createQuizActionIR: any = {"name":"createQuizAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1624,"b":1634,"line":80,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1638,"b":1644,"line":80,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1648,"b":1654,"line":80,"col":37}]}},{"name":"quizSubcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1658,"b":1673,"line":80,"col":47}]}},{"name":"quizCategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1677,"b":1689,"line":80,"col":66}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1693,"b":1703,"line":80,"col":82}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"quizSubcategory":true,"quizCategory":true,"ipAddressId":true},"statement":{"body":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1483,"b":1741,"line":79,"col":0}}};

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

const createSessionActionIR: any = {"name":"createSessionAction","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1976,"b":1982,"line":87,"col":13}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1986,"b":1995,"line":87,"col":23}]}},{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1999,"b":2009,"line":87,"col":36}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2013,"b":2019,"line":87,"col":50}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2023,"b":2033,"line":87,"col":60}]}},{"name":"device","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2037,"b":2042,"line":87,"col":74}]}},{"name":"browser","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2046,"b":2052,"line":87,"col":83}]}},{"name":"browserVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2056,"b":2069,"line":87,"col":93}]}},{"name":"operatingSystem","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2073,"b":2087,"line":87,"col":110}]}},{"name":"operatingSystemVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2091,"b":2112,"line":87,"col":128}]}}],"usedParamSet":{"userId":true,"sessionId":true,"actionType":true,"action":true,"ipAddressId":true,"device":true,"browser":true,"browserVersion":true,"operatingSystem":true,"operatingSystemVersion":true},"statement":{"body":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:userId!, :sessionId!, :actionType!, :action!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1778,"b":2150,"line":86,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)
 *     VALUES (:userId!, :sessionId!, :actionType!, :action!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())
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

const createAccountActionIR: any = {"name":"createAccountAction","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2350,"b":2356,"line":94,"col":13}]}},{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2360,"b":2370,"line":94,"col":23}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2374,"b":2380,"line":94,"col":37}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2384,"b":2394,"line":94,"col":47}]}},{"name":"referenceEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2398,"b":2411,"line":94,"col":61}]}},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2415,"b":2425,"line":94,"col":78}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2429,"b":2437,"line":94,"col":92}]}},{"name":"banReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2441,"b":2449,"line":94,"col":104}]}}],"usedParamSet":{"userId":true,"actionType":true,"action":true,"ipAddressId":true,"referenceEmail":true,"volunteerId":true,"sessionId":true,"banReason":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)\n    VALUES (:userId!, :actionType!, :action!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":2187,"b":2487,"line":93,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)
 *     VALUES (:userId!, :actionType!, :action!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())
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

const createAdminActionIR: any = {"name":"createAdminAction","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2615,"b":2621,"line":101,"col":13}]}},{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2625,"b":2635,"line":101,"col":23}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2639,"b":2645,"line":101,"col":37}]}}],"usedParamSet":{"userId":true,"actionType":true,"action":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:userId!, :actionType!, :action!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":2522,"b":2683,"line":100,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)
 *     VALUES (:userId!, :actionType!, :action!, NOW(), NOW())
 * RETURNING
 *     id AS ok
 * ```
 */
export const createAdminAction = new PreparedQuery<ICreateAdminActionParams,ICreateAdminActionResult>(createAdminActionIR);


/** 'DeleteSelfFavoritedVolunteersActions' parameters type */
export type IDeleteSelfFavoritedVolunteersActionsParams = void;

/** 'DeleteSelfFavoritedVolunteersActions' return type */
export type IDeleteSelfFavoritedVolunteersActionsResult = void;

/** 'DeleteSelfFavoritedVolunteersActions' query type */
export interface IDeleteSelfFavoritedVolunteersActionsQuery {
  params: IDeleteSelfFavoritedVolunteersActionsParams;
  result: IDeleteSelfFavoritedVolunteersActionsResult;
}

const deleteSelfFavoritedVolunteersActionsIR: any = {"name":"deleteSelfFavoritedVolunteersActions","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM user_actions\nWHERE user_id = volunteer_id\n    AND action = 'VOLUNTEER FAVORITED'","loc":{"a":2737,"b":2828,"line":107,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM user_actions
 * WHERE user_id = volunteer_id
 *     AND action = 'VOLUNTEER FAVORITED'
 * ```
 */
export const deleteSelfFavoritedVolunteersActions = new PreparedQuery<IDeleteSelfFavoritedVolunteersActionsParams,IDeleteSelfFavoritedVolunteersActionsResult>(deleteSelfFavoritedVolunteersActionsIR);


