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
  userId: string;
}

/** 'CandidateApplicationEligibility' return type */
export interface ICandidateApplicationEligibilityResult {
  /** not_pii: Type of ban (shadow, complete, live_media) */
  banType: ban_types | null;
  currentGradeName: string | null;
  hasPreviousApplication: boolean | null;
  isActiveChapterMember: boolean | null;
}

/** 'CandidateApplicationEligibility' query type */
export interface ICandidateApplicationEligibilityQuery {
  params: ICandidateApplicationEligibilityParams;
  result: ICandidateApplicationEligibilityResult;
}

const candidateApplicationEligibilityIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":690,"b":697}]}],"statement":"SELECT\n    users.ban_type,\n    current_grade_levels.current_grade_name,\n    EXISTS (\n        SELECT\n            1\n        FROM\n            nths_group_members\n        WHERE\n            nths_group_members.user_id = users.id\n            AND nths_group_members.deactivated_at IS NULL) AS is_active_chapter_member,\n    EXISTS (\n        SELECT\n            1\n        FROM\n            nths_candidate_applications\n        WHERE\n            nths_candidate_applications.user_id = users.id) AS has_previous_application\nFROM\n    users\n    JOIN volunteer_profiles ON volunteer_profiles.user_id = users.id\n    LEFT JOIN current_grade_levels ON current_grade_levels.user_id = users.id\nWHERE\n    users.id = :userId!                                                                                                                                                                                              "};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     users.ban_type,
 *     current_grade_levels.current_grade_name,
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             nths_group_members
 *         WHERE
 *             nths_group_members.user_id = users.id
 *             AND nths_group_members.deactivated_at IS NULL) AS is_active_chapter_member,
 *     EXISTS (
 *         SELECT
 *             1
 *         FROM
 *             nths_candidate_applications
 *         WHERE
 *             nths_candidate_applications.user_id = users.id) AS has_previous_application
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

const decideCandidateApplicationIR: any = {"usedParamSet":{"status":true,"deniedNotes":true,"userId":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":56,"b":63},{"a":152,"b":159}]},{"name":"deniedNotes","required":false,"transform":{"type":"scalar"},"locs":[{"a":85,"b":96}]},{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":396,"b":403}]}],"statement":"UPDATE\n    nths_candidate_applications\nSET\n    status = :status!,\n    denied_notes = :deniedNotes,\n    decided_at = NOW(),\n    activated_at = CASE WHEN :status!::nths_candidate_application_status = 'approved' THEN\n        NOW()\n    END,\n    updated_at = NOW()\nWHERE\n    id = (\n        SELECT\n            id\n        FROM\n            nths_candidate_applications\n        WHERE\n            user_id = :userId!\n            AND status = 'applied'\n        ORDER BY\n            created_at DESC,\n            id DESC\n        LIMIT 1)\nAND status = 'applied'\nRETURNING\n    id,\n    user_id,\n    status,\n    school_id,\n    unlisted_school,\n    form_version,\n    responses,\n    denied_notes,\n    decided_at,\n    activated_at,\n    created_at                                                                                                                                                                             "};

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
  /** not_pii: When the approval was revealed to the applicant and chapter creation unlocked */
  activatedAt: Date | null;
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

const activatedCandidateApplicationIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":111}]}],"statement":"SELECT\n    id,\n    school_id,\n    activated_at\nFROM\n    nths_candidate_applications\nWHERE\n    user_id = :userId!\n    AND activated_at IS NOT NULL\nORDER BY\n    activated_at DESC,\n    id DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     school_id,
 *     activated_at
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


/** 'NeedsApplicationStatusEmail' parameters type */
export interface INeedsApplicationStatusEmailParams {
  application_status: nths_candidate_application_status;
  cohort_end: DateOrString;
  cohort_start: DateOrString;
  email_template_id: string;
}

/** 'NeedsApplicationStatusEmail' return type */
export interface INeedsApplicationStatusEmailResult {
  /** not_pii: When the approval was revealed to the applicant and chapter creation unlocked */
  activatedAt: Date | null;
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

const needsApplicationStatusEmailIR: any = {"usedParamSet":{"application_status":true,"cohort_start":true,"cohort_end":true,"email_template_id":true},"params":[{"name":"application_status","required":true,"transform":{"type":"scalar"},"locs":[{"a":184,"b":203},{"a":214,"b":233}]},{"name":"cohort_start","required":true,"transform":{"type":"scalar"},"locs":[{"a":353,"b":366},{"a":684,"b":697}]},{"name":"cohort_end","required":true,"transform":{"type":"scalar"},"locs":[{"a":394,"b":405}]},{"name":"email_template_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":623,"b":641}]}],"statement":"SELECT\n    nths.user_id,\n    u.email,\n    u.first_name,\n    nths.activated_at\nFROM\n    nths_candidate_applications nths\n    JOIN users u ON u.id = nths.user_id\nWHERE\n    nths.status = :application_status!\n    AND (:application_status!::nths_candidate_application_status <> 'approved'\n        OR nths.activated_at IS NOT NULL)\n    AND nths.decided_at >= :cohort_start!\n    AND nths.decided_at < :cohort_end!\n    AND NOT EXISTS (\n        SELECT\n            1\n        FROM\n            notifications notifications\n        WHERE\n            notifications.user_id = nths.user_id\n            AND notifications.email_template_id = :email_template_id!\n            AND notifications.sent_at >= :cohort_start!)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     nths.user_id,
 *     u.email,
 *     u.first_name,
 *     nths.activated_at
 * FROM
 *     nths_candidate_applications nths
 *     JOIN users u ON u.id = nths.user_id
 * WHERE
 *     nths.status = :application_status!
 *     AND (:application_status!::nths_candidate_application_status <> 'approved'
 *         OR nths.activated_at IS NOT NULL)
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


/** 'ActiveCampaignPresidents' parameters type */
export interface IActiveCampaignPresidentsParams {
  cohortEnd: DateOrString;
  cohortStart: DateOrString;
}

/** 'ActiveCampaignPresidents' return type */
export interface IActiveCampaignPresidentsResult {
  /** not_pii: Primary key */
  applicationId: number;
  /** not_pii: When the approval was revealed to the applicant and chapter creation unlocked */
  approvedAt: Date | null;
  /** not_pii: Primary key */
  chapterId: string;
  /** not_pii: Unique URL-safe slug */
  chapterKey: string;
  /** not_pii: Human-readable name */
  chapterName: string;
  /** not_pii: Human-readable name */
  chapterStatus: string;
  /** pii: User email address */
  email: string;
  /** pii: First name */
  firstName: string;
  /** not_pii: Short invite code for joining the NTHS group */
  inviteCode: string;
  /** not_pii: Foreign key to upchieve.users */
  userId: string;
}

/** 'ActiveCampaignPresidents' query type */
export interface IActiveCampaignPresidentsQuery {
  params: IActiveCampaignPresidentsParams;
  result: IActiveCampaignPresidentsResult;
}

const activeCampaignPresidentsIR: any = {"usedParamSet":{"cohortStart":true,"cohortEnd":true},"params":[{"name":"cohortStart","required":true,"transform":{"type":"scalar"},"locs":[{"a":1126,"b":1138}]},{"name":"cohortEnd","required":true,"transform":{"type":"scalar"},"locs":[{"a":1175,"b":1185}]}],"statement":"SELECT\n    application.id AS application_id,\n    application.user_id,\n    application.activated_at AS approved_at,\n    users.first_name,\n    users.email,\n    chapter.id AS chapter_id,\n    chapter.name AS chapter_name,\n    chapter.key AS chapter_key,\n    chapter.invite_code,\n    latest_status.status_name AS chapter_status\nFROM\n    nths_candidate_applications application\n    JOIN users ON users.id = application.user_id\n    LEFT JOIN nths_group_members membership ON membership.user_id = application.user_id\n        AND membership.deactivated_at IS NULL\n    LEFT JOIN nths_groups chapter ON chapter.id = membership.nths_group_id\n    LEFT JOIN LATERAL (\n        SELECT\n            statuses.name AS status_name\n        FROM\n            nths_chapters_statuses chapter_status\n            JOIN nths_chapter_statuses statuses ON statuses.id = chapter_status.nths_chapter_status_id\n        WHERE\n            chapter_status.nths_group_id = chapter.id\n        ORDER BY\n            chapter_status.created_at DESC\n        LIMIT 1) latest_status ON TRUE\nWHERE\n    application.activated_at IS NOT NULL\n    AND application.activated_at >= :cohortStart!\n    AND application.activated_at < :cohortEnd!\n    AND (chapter.id IS NULL\n        OR latest_status.status_name = 'PENDING')\nORDER BY\n    application.activated_at,\n    application.id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     application.id AS application_id,
 *     application.user_id,
 *     application.activated_at AS approved_at,
 *     users.first_name,
 *     users.email,
 *     chapter.id AS chapter_id,
 *     chapter.name AS chapter_name,
 *     chapter.key AS chapter_key,
 *     chapter.invite_code,
 *     latest_status.status_name AS chapter_status
 * FROM
 *     nths_candidate_applications application
 *     JOIN users ON users.id = application.user_id
 *     LEFT JOIN nths_group_members membership ON membership.user_id = application.user_id
 *         AND membership.deactivated_at IS NULL
 *     LEFT JOIN nths_groups chapter ON chapter.id = membership.nths_group_id
 *     LEFT JOIN LATERAL (
 *         SELECT
 *             statuses.name AS status_name
 *         FROM
 *             nths_chapters_statuses chapter_status
 *             JOIN nths_chapter_statuses statuses ON statuses.id = chapter_status.nths_chapter_status_id
 *         WHERE
 *             chapter_status.nths_group_id = chapter.id
 *         ORDER BY
 *             chapter_status.created_at DESC
 *         LIMIT 1) latest_status ON TRUE
 * WHERE
 *     application.activated_at IS NOT NULL
 *     AND application.activated_at >= :cohortStart!
 *     AND application.activated_at < :cohortEnd!
 *     AND (chapter.id IS NULL
 *         OR latest_status.status_name = 'PENDING')
 * ORDER BY
 *     application.activated_at,
 *     application.id
 * ```
 */
export const activeCampaignPresidents = new PreparedQuery<IActiveCampaignPresidentsParams,IActiveCampaignPresidentsResult>(activeCampaignPresidentsIR);


