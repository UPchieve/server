/* @name insertSchool */
WITH ins AS(
    INSERT INTO schools (id, name, approved, partner, created_at, updated_at)
        VALUES (:id!, :name!, :approved!, :partner!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM schools WHERE id=:id!;


/* @name insertStudentUser */
WITH ins AS(
    INSERT INTO users (id, email, password, first_name, last_name, referral_code, referred_by, verified, banned, created_at, updated_at)
        VALUES (:id!, :email!, :password!, :firstName!, :lastName!, :referralCode!, :referredBy, :verified!, :banned, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM users WHERE id=:id!;


/* @name insertStudentProfile */
WITH ins AS(
    INSERT INTO student_profiles (user_id, student_partner_org_id, student_partner_org_user_id, created_at, updated_at)
        VALUES (:userId!, :studentPartnerOrgId, :studentPartnerOrgUserId, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM student_profiles WHERE user_id=:userId!;


/* @name insertVolunteerUser */
WITH ins AS(
    INSERT INTO users (id, email, PASSWORD, phone, first_name, last_name, referral_code, verified, test_user, time_tutored, created_at, updated_at)
        VALUES (:id!, :email!, :phone!, :password!, :firstName!, :lastName!, :referralCode!, :verified!, :testUser!, :timeTutored!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM users WHERE id=:id!;


/* @name insertVolunteerProfile */
WITH ins AS(
    INSERT INTO volunteer_profiles (user_id, timezone, approved, onboarded, college, volunteer_partner_org_id, photo_id_status, created_at, updated_at)
        VALUES (:userId!, :timezone!, :approved!, :onboarded!, :college!, :volunteerPartnerOrgId, :photoIdStatus, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM volunteer_profiles WHERE user_id=:userId!;


/* @name insertUserCertification */
WITH ins AS(
    INSERT INTO users_certifications (user_id, certification_id, created_at, updated_at)
        VALUES (:userId!, :certificationId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM users_certifications WHERE user_id=:userId! AND certification_id=:certificationId!;


/* @name insertIntoUserQuizzes */
WITH ins AS(
    INSERT INTO users_quizzes (user_id, quiz_id, created_at, updated_at)
        VALUES (:userId!, :quizId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM users_quizzes WHERE user_id=:userId! AND quiz_id=:quizId!;


/* @name insertAdminProfile */
WITH ins AS(
    INSERT INTO admin_profiles (user_id, created_at, updated_at)
        VALUES (:userId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM admin_profiles WHERE user_id=:userId!;


/* @name insertUserProductFlag */
WITH ins AS(
    INSERT INTO user_product_flags (user_id, created_at, updated_at)
        VALUES (:userId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM user_product_flags WHERE user_id=:userId!;


/* @name insertUserSessionMetric */
WITH ins AS(
    INSERT INTO user_session_metrics (user_id, created_at, updated_at)
        VALUES (:userId!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        user_id AS ok
)
SELECT * FROM ins
UNION
    SELECT user_id AS ok FROM user_session_metrics WHERE user_id=:userId!;


/* @name insertIneligibleStudent */
WITH ins AS(
    INSERT INTO ineligible_students (id, email, created_at, updated_at)
        VALUES (:id!, :email!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM ineligible_students WHERE id=:id!;

/* @name insertAvailability */
WITH ins AS(
    INSERT INTO availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at)
        VALUES(:id!, :userId!, :weekdayId!, :availableStart!, :availableEnd!, :timezone!, NOW(), NOW())
    ON CONFLICT
        DO NOTHING
    RETURNING
        id as ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM availabilities WHERE id=:id!;

/* @name insertSession */
WITH ins AS(
    INSERT INTO sessions (
        id,
        student_id,
        volunteer_id,
        subject_id,
        has_whiteboard_doc,
        quill_doc,
        volunteer_joined_at,
        ended_at,
        ended_by_role_id,
        reviewed,
        to_review,
        student_banned,
        time_tutored,
        created_at,
        updated_at
    )
    VALUES (
        :id!,
        :studentId!,
        :volunteerId,
        :subjectId!,
        :hasWhiteboardDoc!,
        :quillDoc,
        :volunteerJoinedAt,
        :endedAt!,
        :endedByRoleId!,
        :reviewed!,
        :toReview!,
        :studentBanned,
        :timeTutored!,
        :createdAt!,
        :endedAt!
    )
    ON CONFLICT
        DO NOTHING
    RETURNING 
        id AS ok
)
SELECT * FROM ins
UNION
    SELECT id AS ok FROM sessions WHERE id=:id!;

/*
    @name insertAssistmentsData
    @param assistment -> ((id!, problemId!, assignmentId!, studentId!, sessionId!, sent!, sentAt, createdAt, updatedAt)...)
*/
INSERT INTO assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, sent_at, created_at, updated_at)
    VALUES :assistment
ON CONFLICT
    DO NOTHING
RETURNING
    id AS ok;

/* 
    @name insertMessages
    @param message -> ((id!, senderId!, sessionId!, contents!, createdAt!, updatedAt!)...)
*/
INSERT INTO session_messages (id, sender_id, session_id, contents, created_at, updated_at)
    VALUES :message!
ON CONFLICT
    DO NOTHING
RETURNING
    id AS ok;

/* 
    @name insertSessionReport 
    @param report -> ((id!, reportReasonId!, reportMessage!, reportingUserId!, reportedUserId!, sessionId!, createdAt, updatedAt)...)
*/
INSERT INTO session_reports (id, report_reason_id, report_message, reporting_user_id, reported_user_id, session_id, created_at, updated_at)
    VALUES :report
ON CONFLICT
    DO NOTHING
RETURNING
    id AS ok;