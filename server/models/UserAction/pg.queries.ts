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


/** 'GetIpAddressByIp' parameters type */
export interface IGetIpAddressByIpParams {
  ip: string;
}

/** 'GetIpAddressByIp' return type */
export interface IGetIpAddressByIpResult {
  id: string;
}

/** 'GetIpAddressByIp' query type */
export interface IGetIpAddressByIpQuery {
  params: IGetIpAddressByIpParams;
  result: IGetIpAddressByIpResult;
}

const getIpAddressByIpIR: any = {"name":"getIpAddressByIp","params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":922,"b":924,"line":49,"col":10}]}}],"usedParamSet":{"ip":true},"statement":{"body":"SELECT\n    id\nFROM\n    ip_addresses\nWHERE\n    ip = :ip!","loc":{"a":870,"b":924,"line":44,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id
 * FROM
 *     ip_addresses
 * WHERE
 *     ip = :ip!
 * ```
 */
export const getIpAddressByIp = new PreparedQuery<IGetIpAddressByIpParams,IGetIpAddressByIpResult>(getIpAddressByIpIR);


/** 'UpsertIpAddress' parameters type */
export interface IUpsertIpAddressParams {
  ip: string;
}

/** 'UpsertIpAddress' return type */
export interface IUpsertIpAddressResult {
  id: string;
}

/** 'UpsertIpAddress' query type */
export interface IUpsertIpAddressQuery {
  params: IUpsertIpAddressParams;
  result: IUpsertIpAddressResult;
}

const upsertIpAddressIR: any = {"name":"upsertIpAddress","params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1000,"b":1002,"line":54,"col":13}]}}],"usedParamSet":{"ip":true},"statement":{"body":"INSERT INTO ip_addresses (ip)\n    VALUES (:ip!)\nON CONFLICT (ip)\n    DO NOTHING\nRETURNING\n    id","loc":{"a":957,"b":1052,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO ip_addresses (ip)
 *     VALUES (:ip!)
 * ON CONFLICT (ip)
 *     DO NOTHING
 * RETURNING
 *     id
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

const userHasTakenQuizIR: any = {"name":"userHasTakenQuiz","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1330,"b":1336,"line":72,"col":27}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT\n    EXISTS (\n        SELECT\n            1\n        FROM\n            user_actions\n        WHERE\n            action_type = 'QUIZ'\n            AND (action = 'PASSED QUIZ'\n                OR action = 'FAILED QUIZ')\n            AND user_id = :userId!)","loc":{"a":1086,"b":1337,"line":62,"col":0}}};

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

const createQuizActionIR: any = {"name":"createQuizAction","params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1512,"b":1522,"line":77,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1526,"b":1532,"line":77,"col":27}]}},{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1536,"b":1542,"line":77,"col":37}]}},{"name":"quizSubcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1546,"b":1561,"line":77,"col":47}]}},{"name":"quizCategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1565,"b":1577,"line":77,"col":66}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1581,"b":1591,"line":77,"col":82}]}}],"usedParamSet":{"actionType":true,"action":true,"userId":true,"quizSubcategory":true,"quizCategory":true,"ipAddressId":true},"statement":{"body":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1371,"b":1629,"line":76,"col":0}}};

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

const createSessionActionIR: any = {"name":"createSessionAction","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1864,"b":1870,"line":84,"col":13}]}},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1874,"b":1883,"line":84,"col":23}]}},{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1887,"b":1897,"line":84,"col":36}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1901,"b":1907,"line":84,"col":50}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1911,"b":1921,"line":84,"col":60}]}},{"name":"device","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1925,"b":1930,"line":84,"col":74}]}},{"name":"browser","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1934,"b":1940,"line":84,"col":83}]}},{"name":"browserVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1944,"b":1957,"line":84,"col":93}]}},{"name":"operatingSystem","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1961,"b":1975,"line":84,"col":110}]}},{"name":"operatingSystemVersion","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1979,"b":2000,"line":84,"col":128}]}}],"usedParamSet":{"userId":true,"sessionId":true,"actionType":true,"action":true,"ipAddressId":true,"device":true,"browser":true,"browserVersion":true,"operatingSystem":true,"operatingSystemVersion":true},"statement":{"body":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:userId!, :sessionId!, :actionType!, :action!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":1666,"b":2038,"line":83,"col":0}}};

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
  emailTemplateId: string | null | void;
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

const createAccountActionIR: any = {"name":"createAccountAction","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2257,"b":2263,"line":91,"col":13}]}},{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2267,"b":2277,"line":91,"col":23}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2281,"b":2287,"line":91,"col":37}]}},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2291,"b":2301,"line":91,"col":47}]}},{"name":"referenceEmail","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2305,"b":2318,"line":91,"col":61}]}},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2322,"b":2332,"line":91,"col":78}]}},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2336,"b":2344,"line":91,"col":92}]}},{"name":"banReason","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2348,"b":2356,"line":91,"col":104}]}},{"name":"emailTemplateId","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2360,"b":2374,"line":91,"col":116}]}}],"usedParamSet":{"userId":true,"actionType":true,"action":true,"ipAddressId":true,"referenceEmail":true,"volunteerId":true,"sessionId":true,"banReason":true,"emailTemplateId":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, email_template_id, created_at, updated_at)\n    VALUES (:userId!, :actionType!, :action!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, :emailTemplateId, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":2075,"b":2412,"line":90,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, email_template_id, created_at, updated_at)
 *     VALUES (:userId!, :actionType!, :action!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, :emailTemplateId, NOW(), NOW())
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

const createAdminActionIR: any = {"name":"createAdminAction","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2540,"b":2546,"line":98,"col":13}]}},{"name":"actionType","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2550,"b":2560,"line":98,"col":23}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2564,"b":2570,"line":98,"col":37}]}}],"usedParamSet":{"userId":true,"actionType":true,"action":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:userId!, :actionType!, :action!, NOW(), NOW())\nRETURNING\n    id AS ok","loc":{"a":2447,"b":2608,"line":97,"col":0}}};

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

const deleteSelfFavoritedVolunteersActionsIR: any = {"name":"deleteSelfFavoritedVolunteersActions","params":[],"usedParamSet":{},"statement":{"body":"DELETE FROM user_actions\nWHERE user_id = volunteer_id\n    AND action = 'VOLUNTEER FAVORITED'","loc":{"a":2662,"b":2753,"line":104,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM user_actions
 * WHERE user_id = volunteer_id
 *     AND action = 'VOLUNTEER FAVORITED'
 * ```
 */
export const deleteSelfFavoritedVolunteersActions = new PreparedQuery<IDeleteSelfFavoritedVolunteersActionsParams,IDeleteSelfFavoritedVolunteersActionsResult>(deleteSelfFavoritedVolunteersActionsIR);


/** 'GetEmailActivityByEmailTemplateId' parameters type */
export interface IGetEmailActivityByEmailTemplateIdParams {
  emailTemplateId: string;
  end: Date | null | void;
  start: Date | null | void;
  userId: string;
}

/** 'GetEmailActivityByEmailTemplateId' return type */
export interface IGetEmailActivityByEmailTemplateIdResult {
  action: string | null;
  createdAt: Date;
  emailTemplateId: string | null;
}

/** 'GetEmailActivityByEmailTemplateId' query type */
export interface IGetEmailActivityByEmailTemplateIdQuery {
  params: IGetEmailActivityByEmailTemplateIdParams;
  result: IGetEmailActivityByEmailTemplateIdResult;
}

const getEmailActivityByEmailTemplateIdIR: any = {"name":"getEmailActivityByEmailTemplateId","params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":2963,"b":2969,"line":119,"col":19}]}},{"name":"emailTemplateId","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3000,"b":3015,"line":120,"col":29}]}},{"name":"start","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3028,"b":3032,"line":121,"col":11},{"a":3083,"b":3087,"line":122,"col":27}]}},{"name":"end","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":3118,"b":3120,"line":123,"col":15},{"a":3175,"b":3177,"line":124,"col":31}]}}],"usedParamSet":{"userId":true,"emailTemplateId":true,"start":true,"end":true},"statement":{"body":"SELECT\n    action,\n    email_template_id,\n    created_at\nFROM\n    user_actions\nWHERE\n    action_type = 'ACCOUNT'\n    AND action = 'EMAILED'\n    AND user_id = :userId!\n    AND email_template_id = :emailTemplateId!\n    AND ((:start)::timestamptz IS NULL\n        OR created_at >= (:start)::timestamptz\n        AND ((:end)::timestamptz IS NULL\n            OR created_at <= (:end)::timestamptz))","loc":{"a":2804,"b":3193,"line":110,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     action,
 *     email_template_id,
 *     created_at
 * FROM
 *     user_actions
 * WHERE
 *     action_type = 'ACCOUNT'
 *     AND action = 'EMAILED'
 *     AND user_id = :userId!
 *     AND email_template_id = :emailTemplateId!
 *     AND ((:start)::timestamptz IS NULL
 *         OR created_at >= (:start)::timestamptz
 *         AND ((:end)::timestamptz IS NULL
 *             OR created_at <= (:end)::timestamptz))
 * ```
 */
export const getEmailActivityByEmailTemplateId = new PreparedQuery<IGetEmailActivityByEmailTemplateIdParams,IGetEmailActivityByEmailTemplateIdResult>(getEmailActivityByEmailTemplateIdIR);


