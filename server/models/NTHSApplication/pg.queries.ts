/** Types generated for queries found in "server/models/NTHSApplication/nths_application.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type ban_types = 'complete' | 'live_media' | 'shadow';

export type nths_candidate_application_status = 'applied' | 'approved' | 'denied';

export type DateOrString = Date | string;

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'LatestCandidateApplicationStatus' parameters type */
export interface ILatestCandidateApplicationStatusParams {
  userId: string;
}

/** 'LatestCandidateApplicationStatus' return type */
export interface ILatestCandidateApplicationStatusResult {
  /** not_pii: Application status (applied, approved, or denied) */
  status: nths_candidate_application_status;
}

/** 'LatestCandidateApplicationStatus' query type */
export interface ILatestCandidateApplicationStatusQuery {
  params: ILatestCandidateApplicationStatusParams;
  result: ILatestCandidateApplicationStatusResult;
}

const latestCandidateApplicationStatusIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":75,"b":82}]}],"statement":"SELECT\n    status\nFROM\n    nths_candidate_applications\nWHERE\n    user_id = :userId!\nORDER BY\n    created_at DESC,\n    id DESC\nLIMIT 1                                                                                                                                                                       "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     status
 * FROM
 *     nths_candidate_applications
 * WHERE
 *     user_id = :userId!
 * ORDER BY
 *     created_at DESC,
 *     id DESC
 * LIMIT 1                                                                                                                                                                       
 * ```
 */
export const latestCandidateApplicationStatus = new PreparedQuery<ILatestCandidateApplicationStatusParams,ILatestCandidateApplicationStatusResult>(latestCandidateApplicationStatusIR);


/** 'LatestCandidateApplication' parameters type */
export interface ILatestCandidateApplicationParams {
  userId: string;
}

/** 'LatestCandidateApplication' return type */
export interface ILatestCandidateApplicationResult {
  /** not_pii: When the approval was revealed to the applicant and chapter creation unlocked */
  activatedAt: Date | null;
  /** not_pii */
  createdAt: Date;
  /** not_pii: When the application was approved or denied */
  decidedAt: Date | null;
  /** pii: Notes explaining why the application was denied */
  deniedNotes: string | null;
  /** not_pii: Version of the application form these responses were collected with; 0 means it predates the in-app form and has no responses */
  formVersion: number;
  /** not_pii: Primary key */
  id: number;
  /** pii: Applicant answers to the NTHS president application form */
  responses: Json;
  /** pii: Foreign key to upchieve.schools */
  schoolId: string | null;
  /** not_pii: Application status (applied, approved, or denied) */
  status: nths_candidate_application_status;
  /** pii: Name, city, state, and website of the applicant's school as they described it, when it could not be matched to upchieve.schools */
  unlistedSchool: Json | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'LatestCandidateApplication' query type */
export interface ILatestCandidateApplicationQuery {
  params: ILatestCandidateApplicationParams;
  result: ILatestCandidateApplicationResult;
}

const latestCandidateApplicationIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":233,"b":240}]}],"statement":"SELECT\n    id,\n    user_id,\n    status,\n    school_id,\n    unlisted_school,\n    form_version,\n    responses,\n    denied_notes,\n    decided_at,\n    activated_at,\n    created_at\nFROM\n    nths_candidate_applications\nWHERE\n    user_id = :userId!\nORDER BY\n    created_at DESC,\n    id DESC\nLIMIT 1                                                                                                                                                                                                                                                                                                  "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     user_id,
 *     status,
 *     school_id,
 *     unlisted_school,
 *     form_version,
 *     responses,
 *     denied_notes,
 *     decided_at,
 *     activated_at,
 *     created_at
 * FROM
 *     nths_candidate_applications
 * WHERE
 *     user_id = :userId!
 * ORDER BY
 *     created_at DESC,
 *     id DESC
 * LIMIT 1                                                                                                                                                                                                                                                                                                  
 * ```
 */
export const latestCandidateApplication = new PreparedQuery<ILatestCandidateApplicationParams,ILatestCandidateApplicationResult>(latestCandidateApplicationIR);


/** 'CandidateApplicationEligibility' parameters type */
export interface ICandidateApplicationEligibilityParams {
  highSchoolOccupation: string;
  userId: string;
}

/** 'CandidateApplicationEligibility' return type */
export interface ICandidateApplicationEligibilityResult {
  /** not_pii: Whether the volunteer application has been approved */
  approved: boolean;
  /** not_pii: Type of ban (shadow, complete, live_media) */
  banType: ban_types | null;
  currentGradeName: string | null;
  hasCompletedSession: boolean | null;
  isHighSchoolStudent: boolean | null;
  /** not_pii: Whether the volunteer has completed all onboarding steps */
  onboarded: boolean;
}

/** 'CandidateApplicationEligibility' query type */
export interface ICandidateApplicationEligibilityQuery {
  params: ICandidateApplicationEligibilityParams;
  result: ICandidateApplicationEligibilityResult;
}

const candidateApplicationEligibilityIR: any = {"usedParamSet":{"highSchoolOccupation":true,"userId":true},"params":[{"name":"highSchoolOccupation","required":true,"transform":{"type":"scalar"},"locs":[{"a":346,"b":367}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":783,"b":790}]}],"statement":"SELECT\n    users.ban_type,\n    volunteer_profiles.onboarded,\n    volunteer_profiles.approved,\n    current_grade_levels.current_grade_name,\n    EXISTS (\n        SELECT\n            1\n        FROM\n            volunteer_occupations\n        WHERE\n            volunteer_occupations.user_id = users.id\n            AND volunteer_occupations.occupation = :highSchoolOccupation!) AS is_high_school_student,\n    EXISTS (\n        SELECT\n            1\n        FROM\n            sessions\n        WHERE\n            sessions.volunteer_id = users.id\n            AND sessions.time_tutored > 0) AS has_completed_session\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id\nWHERE\n    users.id = :userId!                                                                                                                                                                                              "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.ban_type,
 *     volunteer_profiles.onboarded,
 *     volunteer_profiles.approved,
 *     current_grade_levels.current_grade_name,
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             volunteer_occupations
 *         WHERE
 *             volunteer_occupations.user_id = users.id
 *             AND volunteer_occupations.occupation = :highSchoolOccupation!) AS is_high_school_student,
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             sessions
 *         WHERE
 *             sessions.volunteer_id = users.id
 *             AND sessions.time_tutored > 0) AS has_completed_session
 * FROM
 *     users
 *     JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id
 *     LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id
 * WHERE
 *     users.id = :userId!                                                                                                                                                                                              
 * ```
 */
export const candidateApplicationEligibility = new PreparedQuery<ICandidateApplicationEligibilityParams,ICandidateApplicationEligibilityResult>(candidateApplicationEligibilityIR);


/** 'CreateCandidateApplication' parameters type */
export interface ICreateCandidateApplicationParams {
  formVersion: number;
  responses: Json;
  schoolId?: string | null | void;
  unlistedSchool?: Json | null | void;
  userId: string;
}

/** 'CreateCandidateApplication' return type */
export interface ICreateCandidateApplicationResult {
  /** not_pii: When the approval was revealed to the applicant and chapter creation unlocked */
  activatedAt: Date | null;
  /** not_pii */
  createdAt: Date;
  /** not_pii: When the application was approved or denied */
  decidedAt: Date | null;
  /** pii: Notes explaining why the application was denied */
  deniedNotes: string | null;
  /** not_pii: Version of the application form these responses were collected with; 0 means it predates the in-app form and has no responses */
  formVersion: number;
  /** not_pii: Primary key */
  id: number;
  /** pii: Applicant answers to the NTHS president application form */
  responses: Json;
  /** pii: Foreign key to upchieve.schools */
  schoolId: string | null;
  /** not_pii: Application status (applied, approved, or denied) */
  status: nths_candidate_application_status;
  /** pii: Name, city, state, and website of the applicant's school as they described it, when it could not be matched to upchieve.schools */
  unlistedSchool: Json | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'CreateCandidateApplication' query type */
export interface ICreateCandidateApplicationQuery {
  params: ICreateCandidateApplicationParams;
  result: ICreateCandidateApplicationResult;
}

const createCandidateApplicationIR: any = {"usedParamSet":{"userId":true,"schoolId":true,"unlistedSchool":true,"formVersion":true,"responses":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":123,"b":130}]},{"name":"schoolId","required":false,"transform":{"type":"scalar"},"locs":[{"a":144,"b":152}]},{"name":"unlistedSchool","required":false,"transform":{"type":"scalar"},"locs":[{"a":155,"b":169}]},{"name":"formVersion","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":184}]},{"name":"responses","required":true,"transform":{"type":"scalar"},"locs":[{"a":187,"b":197}]}],"statement":"INSERT INTO nths_candidate_applications (user_id, status, school_id, unlisted_school, form_version, responses)\n    VALUES (:userId!, 'applied', :schoolId, :unlistedSchool, :formVersion!, :responses!)\nRETURNING\n    id, user_id, status, school_id, unlisted_school, form_version, responses, denied_notes, decided_at, activated_at, created_at                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nths_candidate_applications (user_id, status, school_id, unlisted_school, form_version, responses)
 *     VALUES (:userId!, 'applied', :schoolId, :unlistedSchool, :formVersion!, :responses!)
 * RETURNING
 *     id, user_id, status, school_id, unlisted_school, form_version, responses, denied_notes, decided_at, activated_at, created_at                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
 * ```
 */
export const createCandidateApplication = new PreparedQuery<ICreateCandidateApplicationParams,ICreateCandidateApplicationResult>(createCandidateApplicationIR);


/** 'DecideCandidateApplication' parameters type */
export interface IDecideCandidateApplicationParams {
  deniedNotes?: string | null | void;
  status: nths_candidate_application_status;
  userId: string;
}

/** 'DecideCandidateApplication' return type */
export interface IDecideCandidateApplicationResult {
  /** not_pii: When the approval was revealed to the applicant and chapter creation unlocked */
  activatedAt: Date | null;
  /** not_pii */
  createdAt: Date;
  /** not_pii: When the application was approved or denied */
  decidedAt: Date | null;
  /** pii: Notes explaining why the application was denied */
  deniedNotes: string | null;
  /** not_pii: Version of the application form these responses were collected with; 0 means it predates the in-app form and has no responses */
  formVersion: number;
  /** not_pii: Primary key */
  id: number;
  /** pii: Applicant answers to the NTHS president application form */
  responses: Json;
  /** pii: Foreign key to upchieve.schools */
  schoolId: string | null;
  /** not_pii: Application status (applied, approved, or denied) */
  status: nths_candidate_application_status;
  /** pii: Name, city, state, and website of the applicant's school as they described it, when it could not be matched to upchieve.schools */
  unlistedSchool: Json | null;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'DecideCandidateApplication' query type */
export interface IDecideCandidateApplicationQuery {
  params: IDecideCandidateApplicationParams;
  result: IDecideCandidateApplicationResult;
}

const decideCandidateApplicationIR: any = {"usedParamSet":{"status":true,"deniedNotes":true,"userId":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":56,"b":63},{"a":152,"b":159}]},{"name":"deniedNotes","required":false,"transform":{"type":"scalar"},"locs":[{"a":85,"b":96}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":396,"b":403}]}],"statement":"UPDATE\n    nths_candidate_applications\nSET\n    status = :status!,\n    denied_notes = :deniedNotes,\n    decided_at = NOW(),\n    activated_at = CASE WHEN :status!::nths_candidate_application_status = 'approved' THEN\n        NOW()\n    END,\n    updated_at = NOW()\nWHERE\n    id = (\n        SELECT\n            id\n        FROM\n            nths_candidate_applications\n        WHERE\n            user_id = :userId!\n            AND status = 'applied'\n        ORDER BY\n            created_at DESC,\n            id DESC\n        LIMIT 1)\nAND status = 'applied'\nRETURNING\n    id,\n    user_id,\n    status,\n    school_id,\n    unlisted_school,\n    form_version,\n    responses,\n    denied_notes,\n    decided_at,\n    activated_at,\n    created_at                                                                                                                                              "};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *     nths_candidate_applications
 * SET
 *     status = :status!,
 *     denied_notes = :deniedNotes,
 *     decided_at = NOW(),
 *     activated_at = CASE WHEN :status!::nths_candidate_application_status = 'approved' THEN
 *         NOW()
 *     END,
 *     updated_at = NOW()
 * WHERE
 *     id = (
 *         SELECT
 *             id
 *         FROM
 *             nths_candidate_applications
 *         WHERE
 *             user_id = :userId!
 *             AND status = 'applied'
 *         ORDER BY
 *             created_at DESC,
 *             id DESC
 *         LIMIT 1)
 * AND status = 'applied'
 * RETURNING
 *     id,
 *     user_id,
 *     status,
 *     school_id,
 *     unlisted_school,
 *     form_version,
 *     responses,
 *     denied_notes,
 *     decided_at,
 *     activated_at,
 *     created_at                                                                                                                                              
 * ```
 */
export const decideCandidateApplication = new PreparedQuery<IDecideCandidateApplicationParams,IDecideCandidateApplicationResult>(decideCandidateApplicationIR);


/** 'ActivatedCandidateApplication' parameters type */
export interface IActivatedCandidateApplicationParams {
  userId: string;
}

/** 'ActivatedCandidateApplication' return type */
export interface IActivatedCandidateApplicationResult {
  /** not_pii: Primary key */
  id: number;
  /** pii: Foreign key to upchieve.schools */
  schoolId: string | null;
}

/** 'ActivatedCandidateApplication' query type */
export interface IActivatedCandidateApplicationQuery {
  params: IActivatedCandidateApplicationParams;
  result: IActivatedCandidateApplicationResult;
}

const activatedCandidateApplicationIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":93}]}],"statement":"SELECT\n    id,\n    school_id\nFROM\n    nths_candidate_applications\nWHERE\n    user_id = :userId!\n    AND activated_at IS NOT NULL\nORDER BY\n    activated_at DESC,\n    id DESC\nLIMIT 1                                                                                                                                                                                                                                                                     "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     school_id
 * FROM
 *     nths_candidate_applications
 * WHERE
 *     user_id = :userId!
 *     AND activated_at IS NOT NULL
 * ORDER BY
 *     activated_at DESC,
 *     id DESC
 * LIMIT 1                                                                                                                                                                                                                                                                     
 * ```
 */
export const activatedCandidateApplication = new PreparedQuery<IActivatedCandidateApplicationParams,IActivatedCandidateApplicationResult>(activatedCandidateApplicationIR);


/** 'IsSchoolClaimedForNthsChapter' parameters type */
export interface IIsSchoolClaimedForNthsChapterParams {
  schoolId: string;
  userId: string;
}

/** 'IsSchoolClaimedForNthsChapter' return type */
export interface IIsSchoolClaimedForNthsChapterResult {
  claimed: boolean | null;
}

/** 'IsSchoolClaimedForNthsChapter' query type */
export interface IIsSchoolClaimedForNthsChapterQuery {
  params: IIsSchoolClaimedForNthsChapterParams;
  result: IIsSchoolClaimedForNthsChapterResult;
}

const isSchoolClaimedForNthsChapterIR: any = {"usedParamSet":{"schoolId":true,"userId":true},"params":[{"name":"schoolId","required":true,"transform":{"type":"scalar"},"locs":[{"a":167,"b":176},{"a":371,"b":380}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":466,"b":473}]}],"statement":"SELECT\n    (EXISTS (\n            SELECT\n                1\n            FROM\n                nths_group_school_affiliation\n            WHERE\n                school_id = :schoolId!)\n            OR EXISTS (\n                SELECT\n                    1\n                FROM\n                    nths_candidate_applications\n                WHERE\n                    school_id = :schoolId!\n                    AND activated_at IS NOT NULL\n                    AND user_id <> :userId!)) AS claimed"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     (EXISTS (
 *             SELECT
 *                 1
 *             FROM
 *                 nths_group_school_affiliation
 *             WHERE
 *                 school_id = :schoolId!)
 *             OR EXISTS (
 *                 SELECT
 *                     1
 *                 FROM
 *                     nths_candidate_applications
 *                 WHERE
 *                     school_id = :schoolId!
 *                     AND activated_at IS NOT NULL
 *                     AND user_id <> :userId!)) AS claimed
 * ```
 */
export const isSchoolClaimedForNthsChapter = new PreparedQuery<IIsSchoolClaimedForNthsChapterParams,IIsSchoolClaimedForNthsChapterResult>(isSchoolClaimedForNthsChapterIR);


/** 'NeedsApplicationStatusEmail' parameters type */
export interface INeedsApplicationStatusEmailParams {
  application_status: nths_candidate_application_status;
  cohort_end: DateOrString;
  cohort_start: DateOrString;
  email_template_id: string;
}

/** 'NeedsApplicationStatusEmail' return type */
export interface INeedsApplicationStatusEmailResult {
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'NeedsApplicationStatusEmail' query type */
export interface INeedsApplicationStatusEmailQuery {
  params: INeedsApplicationStatusEmailParams;
  result: INeedsApplicationStatusEmailResult;
}

const needsApplicationStatusEmailIR: any = {"usedParamSet":{"application_status":true,"cohort_start":true,"cohort_end":true,"email_template_id":true},"params":[{"name":"application_status","required":true,"transform":{"type":"scalar"},"locs":[{"a":161,"b":180}]},{"name":"cohort_start","required":true,"transform":{"type":"scalar"},"locs":[{"a":209,"b":222},{"a":540,"b":553}]},{"name":"cohort_end","required":true,"transform":{"type":"scalar"},"locs":[{"a":250,"b":261}]},{"name":"email_template_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":479,"b":497}]}],"statement":"SELECT\n    nths.user_id,\n    u.email,\n    u.first_name\nFROM\n    nths_candidate_applications nths\n    JOIN users u ON u.id = nths.user_id\nWHERE\n    nths.status = :application_status!\n    AND nths.decided_at >= :cohort_start!\n    AND nths.decided_at < :cohort_end!\n    AND NOT EXISTS (\n        SELECT\n            1\n        FROM\n            notifications notifications\n        WHERE\n            notifications.user_id = nths.user_id\n            AND notifications.email_template_id = :email_template_id!\n            AND notifications.sent_at >= :cohort_start!)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     nths.user_id,
 *     u.email,
 *     u.first_name
 * FROM
 *     nths_candidate_applications nths
 *     JOIN users u ON u.id = nths.user_id
 * WHERE
 *     nths.status = :application_status!
 *     AND nths.decided_at >= :cohort_start!
 *     AND nths.decided_at < :cohort_end!
 *     AND NOT EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             notifications notifications
 *         WHERE
 *             notifications.user_id = nths.user_id
 *             AND notifications.email_template_id = :email_template_id!
 *             AND notifications.sent_at >= :cohort_start!)
 * ```
 */
export const needsApplicationStatusEmail = new PreparedQuery<INeedsApplicationStatusEmailParams,INeedsApplicationStatusEmailResult>(needsApplicationStatusEmailIR);


