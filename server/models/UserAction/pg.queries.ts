/** Types generated for queries found in "server/models/UserAction/user_action.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'GetQuizzesPassedForDateRangeByVolunteerId' parameters type */
export interface IGetQuizzesPassedForDateRangeByVolunteerIdParams {
  end: DateOrString;
  start: DateOrString;
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

const getQuizzesPassedForDateRangeByVolunteerIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":143}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":178}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":207,"b":211}]}],"statement":"SELECT\n    count(*)::int AS total\nFROM\n    user_actions\nWHERE\n    action_type = 'QUIZ'\n    AND action = 'PASSED QUIZ'\n    AND user_id = :userId!\n    AND created_at >= DATE(:start!)\n    AND created_at < DATE(:end!)"};

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
  end: DateOrString;
  start: DateOrString;
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

const getQuizzesPassedForDateRangeForTelecomReportByVolunteerIdIR: any = {"usedParamSet":{"userId":true,"start":true,"end":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":131}]},{"name":"start","required":true,"transform":{"type":"scalar"},"locs":[{"a":160,"b":166}]},{"name":"end","required":true,"transform":{"type":"scalar"},"locs":[{"a":195,"b":199}]}],"statement":"SELECT\n    created_at\nFROM\n    user_actions\nWHERE\n    action_type = 'QUIZ'\n    AND action = 'PASSED QUIZ'\n    AND user_id = :userId!\n    AND created_at >= DATE(:start!)\n    AND created_at < DATE(:end!)"};

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

const getSessionRequestedUserAgentFromSessionIdIR: any = {"usedParamSet":{"sessionId":true},"params":[{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":226,"b":236}]}],"statement":"SELECT\n    id,\n    device,\n    browser,\n    browser_version,\n    operating_system,\n    operating_system_version\nFROM\n    user_actions\nWHERE\n    action_type = 'SESSION'\n    AND action = 'REQUESTED SESSION'\n    AND session_id = :sessionId!"};

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

const getIpAddressByIpIR: any = {"usedParamSet":{"ip":true},"params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"locs":[{"a":51,"b":54}]}],"statement":"SELECT\n    id\nFROM\n    ip_addresses\nWHERE\n    ip = :ip!"};

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

const upsertIpAddressIR: any = {"usedParamSet":{"ip":true},"params":[{"name":"ip","required":true,"transform":{"type":"scalar"},"locs":[{"a":42,"b":45}]}],"statement":"INSERT INTO ip_addresses (ip)\n    VALUES (:ip!)\nON CONFLICT (ip)\n    DO NOTHING\nRETURNING\n    id"};

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

const userHasTakenQuizIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":243,"b":250}]}],"statement":"SELECT\n    EXISTS (\n        SELECT\n            1\n        FROM\n            user_actions\n        WHERE\n            action_type = 'QUIZ'\n            AND (action = 'PASSED QUIZ'\n                OR action = 'FAILED QUIZ')\n            AND user_id = :userId!)"};

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
  ipAddressId?: NumberOrString | null | void;
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

const createQuizActionIR: any = {"usedParamSet":{"actionType":true,"action":true,"userId":true,"quizSubcategory":true,"quizCategory":true,"ipAddressId":true},"params":[{"name":"actionType","required":true,"transform":{"type":"scalar"},"locs":[{"a":140,"b":151}]},{"name":"action","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":161}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":164,"b":171}]},{"name":"quizSubcategory","required":true,"transform":{"type":"scalar"},"locs":[{"a":174,"b":190}]},{"name":"quizCategory","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":206}]},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"locs":[{"a":209,"b":220}]}],"statement":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:actionType!, :action!, :userId!, :quizSubcategory!, :quizCategory!, :ipAddressId, NOW(), NOW())\nRETURNING\n    id AS ok"};

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
  browser?: string | null | void;
  browserVersion?: string | null | void;
  device?: string | null | void;
  ipAddressId?: NumberOrString | null | void;
  operatingSystem?: string | null | void;
  operatingSystemVersion?: string | null | void;
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

const createSessionActionIR: any = {"usedParamSet":{"userId":true,"sessionId":true,"actionType":true,"action":true,"ipAddressId":true,"device":true,"browser":true,"browserVersion":true,"operatingSystem":true,"operatingSystemVersion":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":197,"b":204}]},{"name":"sessionId","required":true,"transform":{"type":"scalar"},"locs":[{"a":207,"b":217}]},{"name":"actionType","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":231}]},{"name":"action","required":true,"transform":{"type":"scalar"},"locs":[{"a":234,"b":241}]},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"locs":[{"a":244,"b":255}]},{"name":"device","required":false,"transform":{"type":"scalar"},"locs":[{"a":258,"b":264}]},{"name":"browser","required":false,"transform":{"type":"scalar"},"locs":[{"a":267,"b":274}]},{"name":"browserVersion","required":false,"transform":{"type":"scalar"},"locs":[{"a":277,"b":291}]},{"name":"operatingSystem","required":false,"transform":{"type":"scalar"},"locs":[{"a":294,"b":309}]},{"name":"operatingSystemVersion","required":false,"transform":{"type":"scalar"},"locs":[{"a":312,"b":334}]}],"statement":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:userId!, :sessionId!, :actionType!, :action!, :ipAddressId, :device, :browser, :browserVersion, :operatingSystem, :operatingSystemVersion, NOW(), NOW())\nRETURNING\n    id AS ok"};

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
  banReason?: string | null | void;
  ipAddressId?: NumberOrString | null | void;
  referenceEmail?: string | null | void;
  sessionId?: string | null | void;
  userId: string;
  volunteerId?: string | null | void;
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

const createAccountActionIR: any = {"usedParamSet":{"userId":true,"actionType":true,"action":true,"ipAddressId":true,"referenceEmail":true,"volunteerId":true,"sessionId":true,"banReason":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":162,"b":169}]},{"name":"actionType","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":183}]},{"name":"action","required":true,"transform":{"type":"scalar"},"locs":[{"a":186,"b":193}]},{"name":"ipAddressId","required":false,"transform":{"type":"scalar"},"locs":[{"a":196,"b":207}]},{"name":"referenceEmail","required":false,"transform":{"type":"scalar"},"locs":[{"a":210,"b":224}]},{"name":"volunteerId","required":false,"transform":{"type":"scalar"},"locs":[{"a":227,"b":238}]},{"name":"sessionId","required":false,"transform":{"type":"scalar"},"locs":[{"a":241,"b":250}]},{"name":"banReason","required":false,"transform":{"type":"scalar"},"locs":[{"a":253,"b":262}]}],"statement":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, ban_reason, created_at, updated_at)\n    VALUES (:userId!, :actionType!, :action!, :ipAddressId, :referenceEmail, :volunteerId, :sessionId, :banReason, NOW(), NOW())\nRETURNING\n    id AS ok"};

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

const createAdminActionIR: any = {"usedParamSet":{"userId":true,"actionType":true,"action":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":99}]},{"name":"actionType","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":113}]},{"name":"action","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":123}]}],"statement":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:userId!, :actionType!, :action!, NOW(), NOW())\nRETURNING\n    id AS ok"};

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

const deleteSelfFavoritedVolunteersActionsIR: any = {"usedParamSet":{},"params":[],"statement":"DELETE FROM user_actions\nWHERE user_id = volunteer_id\n    AND action = 'VOLUNTEER FAVORITED'"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM user_actions
 * WHERE user_id = volunteer_id
 *     AND action = 'VOLUNTEER FAVORITED'
 * ```
 */
export const deleteSelfFavoritedVolunteersActions = new PreparedQuery<IDeleteSelfFavoritedVolunteersActionsParams,IDeleteSelfFavoritedVolunteersActionsResult>(deleteSelfFavoritedVolunteersActionsIR);


