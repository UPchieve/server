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
  action_type: string;
  ip_address_id: string | null | void;
  quiz_category: string;
  quiz_subcategory: string;
  user_id: string;
}

/** 'CreateQuizAction' return type */
export type ICreateQuizActionResult = void;

/** 'CreateQuizAction' query type */
export interface ICreateQuizActionQuery {
  params: ICreateQuizActionParams;
  result: ICreateQuizActionResult;
}

const createQuizActionIR: any = {"name":"createQuizAction","params":[{"name":"action_type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1021,"b":1032,"line":46,"col":13}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1036,"b":1042,"line":46,"col":28}]}},{"name":"user_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1046,"b":1053,"line":46,"col":38}]}},{"name":"quiz_subcategory","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1057,"b":1073,"line":46,"col":49}]}},{"name":"quiz_category","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1077,"b":1090,"line":46,"col":69}]}},{"name":"ip_address_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1094,"b":1106,"line":46,"col":86}]}}],"usedParamSet":{"action_type":true,"action":true,"user_id":true,"quiz_subcategory":true,"quiz_category":true,"ip_address_id":true},"statement":{"body":"INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)\n    VALUES (:action_type!, :action!, :user_id!, :quiz_subcategory!, :quiz_category!, :ip_address_id, NOW(), NOW())","loc":{"a":880,"b":1121,"line":45,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (action_type, action, user_id, quiz_subcategory, quiz_category, ip_address_id, created_at, updated_at)
 *     VALUES (:action_type!, :action!, :user_id!, :quiz_subcategory!, :quiz_category!, :ip_address_id, NOW(), NOW())
 * ```
 */
export const createQuizAction = new PreparedQuery<ICreateQuizActionParams,ICreateQuizActionResult>(createQuizActionIR);


/** 'CreateSessionAction' parameters type */
export interface ICreateSessionActionParams {
  action: string;
  action_type: string;
  browser: string | null | void;
  browser_version: string | null | void;
  device: string | null | void;
  ip_address_id: string | null | void;
  operating_system: string | null | void;
  operating_system_version: string | null | void;
  session_id: string;
  user_id: string;
}

/** 'CreateSessionAction' return type */
export type ICreateSessionActionResult = void;

/** 'CreateSessionAction' query type */
export interface ICreateSessionActionQuery {
  params: ICreateSessionActionParams;
  result: ICreateSessionActionResult;
}

const createSessionActionIR: any = {"name":"createSessionAction","params":[{"name":"user_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1355,"b":1362,"line":50,"col":13}]}},{"name":"session_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1366,"b":1376,"line":50,"col":24}]}},{"name":"action_type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1380,"b":1391,"line":50,"col":38}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1395,"b":1401,"line":50,"col":53}]}},{"name":"ip_address_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1405,"b":1417,"line":50,"col":63}]}},{"name":"device","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1421,"b":1426,"line":50,"col":79}]}},{"name":"browser","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1430,"b":1436,"line":50,"col":88}]}},{"name":"browser_version","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1440,"b":1454,"line":50,"col":98}]}},{"name":"operating_system","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1458,"b":1473,"line":50,"col":116}]}},{"name":"operating_system_version","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1477,"b":1500,"line":50,"col":135}]}}],"usedParamSet":{"user_id":true,"session_id":true,"action_type":true,"action":true,"ip_address_id":true,"device":true,"browser":true,"browser_version":true,"operating_system":true,"operating_system_version":true},"statement":{"body":"INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)\n    VALUES (:user_id!, :session_id!, :action_type!, :action!, :ip_address_id, :device, :browser, :browser_version, :operating_system, :operating_system_version, NOW(), NOW())","loc":{"a":1157,"b":1515,"line":49,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, created_at, updated_at)
 *     VALUES (:user_id!, :session_id!, :action_type!, :action!, :ip_address_id, :device, :browser, :browser_version, :operating_system, :operating_system_version, NOW(), NOW())
 * ```
 */
export const createSessionAction = new PreparedQuery<ICreateSessionActionParams,ICreateSessionActionResult>(createSessionActionIR);


/** 'CreateAccountAction' parameters type */
export interface ICreateAccountActionParams {
  action: string;
  action_type: string;
  ip_address_id: string | null | void;
  reference_email: string | null | void;
  session_id: string | null | void;
  user_id: string;
  volunteer_id: string | null | void;
}

/** 'CreateAccountAction' return type */
export type ICreateAccountActionResult = void;

/** 'CreateAccountAction' query type */
export interface ICreateAccountActionQuery {
  params: ICreateAccountActionParams;
  result: ICreateAccountActionResult;
}

const createAccountActionIR: any = {"name":"createAccountAction","params":[{"name":"user_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1702,"b":1709,"line":54,"col":13}]}},{"name":"action_type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1713,"b":1724,"line":54,"col":24}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1728,"b":1734,"line":54,"col":39}]}},{"name":"ip_address_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1738,"b":1750,"line":54,"col":49}]}},{"name":"reference_email","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1754,"b":1768,"line":54,"col":65}]}},{"name":"volunteer_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1772,"b":1783,"line":54,"col":83}]}},{"name":"session_id","required":false,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1787,"b":1796,"line":54,"col":98}]}}],"usedParamSet":{"user_id":true,"action_type":true,"action":true,"ip_address_id":true,"reference_email":true,"volunteer_id":true,"session_id":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, created_at, updated_at)\n    VALUES (:user_id!, :action_type!, :action!, :ip_address_id, :reference_email, :volunteer_id, :session_id, NOW(), NOW())","loc":{"a":1551,"b":1811,"line":53,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, ip_address_id, reference_email, volunteer_id, session_id, created_at, updated_at)
 *     VALUES (:user_id!, :action_type!, :action!, :ip_address_id, :reference_email, :volunteer_id, :session_id, NOW(), NOW())
 * ```
 */
export const createAccountAction = new PreparedQuery<ICreateAccountActionParams,ICreateAccountActionResult>(createAccountActionIR);


/** 'CreateAdminAction' parameters type */
export interface ICreateAdminActionParams {
  action: string;
  action_type: string;
  user_id: string;
}

/** 'CreateAdminAction' return type */
export type ICreateAdminActionResult = void;

/** 'CreateAdminAction' query type */
export interface ICreateAdminActionQuery {
  params: ICreateAdminActionParams;
  result: ICreateAdminActionResult;
}

const createAdminActionIR: any = {"name":"createAdminAction","params":[{"name":"user_id","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1938,"b":1945,"line":58,"col":13}]}},{"name":"action_type","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1949,"b":1960,"line":58,"col":24}]}},{"name":"action","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":1964,"b":1970,"line":58,"col":39}]}}],"usedParamSet":{"user_id":true,"action_type":true,"action":true},"statement":{"body":"INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)\n    VALUES (:user_id!, :action_type!, :action!, NOW(), NOW())","loc":{"a":1845,"b":1985,"line":57,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO user_actions (user_id, action_type, action, created_at, updated_at)
 *     VALUES (:user_id!, :action_type!, :action!, NOW(), NOW())
 * ```
 */
export const createAdminAction = new PreparedQuery<ICreateAdminActionParams,ICreateAdminActionResult>(createAdminActionIR);


