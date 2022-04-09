--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1 (Debian 14.1-1.pgdg110+1)
-- Dumped by pg_dump version 14.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: ban_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ban_reasons (id, name, created_at, updated_at) FROM stdin;
1	non us signup	2022-04-09 00:58:19.455394+00	2022-04-09 00:58:19.455394+00
2	session reported	2022-04-09 00:58:19.456316+00	2022-04-09 00:58:19.456316+00
3	used banned ip	2022-04-09 00:58:19.457077+00	2022-04-09 00:58:19.457077+00
4	admin	2022-04-09 00:58:19.457787+00	2022-04-09 00:58:19.457787+00
5	banned service provider	2022-04-09 00:58:19.458448+00	2022-04-09 00:58:19.458448+00
\.


--
-- Data for Name: signup_sources; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.signup_sources (id, name, created_at, updated_at) FROM stdin;
1	Web search	2022-04-09 00:58:19.459184+00	2022-04-09 00:58:19.459184+00
2	Social media	2022-04-09 00:58:19.460022+00	2022-04-09 00:58:19.460022+00
3	Friend / Classmate	2022-04-09 00:58:19.460741+00	2022-04-09 00:58:19.460741+00
4	School / Teacher	2022-04-09 00:58:19.461419+00	2022-04-09 00:58:19.461419+00
5	Parent / Relative	2022-04-09 00:58:19.462087+00	2022-04-09 00:58:19.462087+00
6	Other	2022-04-09 00:58:19.462763+00	2022-04-09 00:58:19.462763+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users (id, verified, email_verified, phone_verified, email, password, password_reset_token, first_name, last_name, deactivated, last_activity_at, referral_code, referred_by, test_user, banned, ban_reason_id, time_tutored, signup_source_id, created_at, updated_at, phone, mongo_id) FROM stdin;
01800bd4-7916-0bf5-5b98-59cd1d380198	t	f	f	volunteer1@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Volunteer	UPchieve	f	\N	B	\N	f	f	\N	25200000	\N	2022-04-09 00:58:35.671642+00	2022-04-09 00:58:35.671642+00	+12125551212	\N
01800bd4-7916-a118-4d46-88cf82be5574	t	f	f	volunteer2@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Volunteer	UPchieve	f	\N	C	\N	f	f	\N	0	\N	2022-04-09 00:58:35.676834+00	2022-04-09 00:58:35.676834+00	+12125551212	\N
01800bd4-7916-39ab-6291-c9cb7290e101	t	f	f	volunteer3@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Volunteer	UPchieve	f	\N	D	\N	t	f	\N	0	\N	2022-04-09 00:58:35.678475+00	2022-04-09 00:58:35.678475+00	+12125551212	\N
01800bd4-7916-fd27-7a1a-3f97bb06bc8a	t	f	f	volunteer4@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Volunteer	UPchieve	f	\N	E	\N	t	f	\N	0	\N	2022-04-09 00:58:35.679612+00	2022-04-09 00:58:35.679612+00	+12125551212	\N
01800bd4-7954-f7fa-cc01-ccddf7ec9621	t	f	f	student1@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Student	UPchieve	f	\N	A	\N	f	f	\N	\N	\N	2022-04-09 00:58:35.733103+00	2022-04-09 00:58:35.733103+00	\N	\N
01800bd4-7954-79e2-4b85-a7a305a334b5	t	f	f	student2@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Student	UPchieve	f	\N	F	\N	f	f	\N	\N	\N	2022-04-09 00:58:35.734004+00	2022-04-09 00:58:35.734004+00	\N	\N
01800bd4-7954-50a7-fef9-47d7aa1fd2f7	t	f	f	student3@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Student	UPchieve	f	\N	G	\N	f	f	\N	\N	\N	2022-04-09 00:58:35.734918+00	2022-04-09 00:58:35.734918+00	\N	\N
\.


--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.admin_profiles (user_id, created_at, updated_at) FROM stdin;
01800bd4-7916-0bf5-5b98-59cd1d380198	2022-04-09 00:58:35.729538+00	2022-04-09 00:58:35.729538+00
01800bd4-7916-a118-4d46-88cf82be5574	2022-04-09 00:58:35.730521+00	2022-04-09 00:58:35.730521+00
01800bd4-7916-39ab-6291-c9cb7290e101	2022-04-09 00:58:35.731326+00	2022-04-09 00:58:35.731326+00
01800bd4-7916-fd27-7a1a-3f97bb06bc8a	2022-04-09 00:58:35.732149+00	2022-04-09 00:58:35.732149+00
\.


--
-- Data for Name: tool_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.tool_types (id, name, created_at, updated_at) FROM stdin;
1	whiteboard	2022-04-09 00:58:19.487342+00	2022-04-09 00:58:19.487342+00
2	documenteditor	2022-04-09 00:58:19.488125+00	2022-04-09 00:58:19.488125+00
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.topics (id, name, icon_link, color, dashboard_order, display_name, created_at, updated_at) FROM stdin;
1	math	\N	\N	1	Math	2022-04-09 00:58:19.483611+00	2022-04-09 00:58:19.483611+00
2	science	\N	\N	4	Science	2022-04-09 00:58:19.484559+00	2022-04-09 00:58:19.484559+00
3	college	\N	\N	3	College Counseling	2022-04-09 00:58:19.485259+00	2022-04-09 00:58:19.485259+00
4	sat	\N	\N	2	Standardized Testing	2022-04-09 00:58:19.48595+00	2022-04-09 00:58:19.48595+00
5	readingWriting	\N	\N	5	Reading and Writing	2022-04-09 00:58:19.486634+00	2022-04-09 00:58:19.486634+00
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.subjects (id, name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at) FROM stdin;
1	prealgebra	Prealgebra	1	1	1	2022-04-09 00:58:19.488998+00	2022-04-09 00:58:19.488998+00
2	algebraOne	Algebra 1	2	1	1	2022-04-09 00:58:19.490061+00	2022-04-09 00:58:19.490061+00
3	algebraTwo	Algebra 2	3	1	1	2022-04-09 00:58:19.490892+00	2022-04-09 00:58:19.490892+00
4	geometry	Geometry	4	1	1	2022-04-09 00:58:19.491631+00	2022-04-09 00:58:19.491631+00
5	trigonometry	Trigonometry	5	1	1	2022-04-09 00:58:19.49241+00	2022-04-09 00:58:19.49241+00
6	precalculus	Precalculus	6	1	1	2022-04-09 00:58:19.493159+00	2022-04-09 00:58:19.493159+00
7	calculusAB	Calculus AB	7	1	1	2022-04-09 00:58:19.493957+00	2022-04-09 00:58:19.493957+00
8	calculusBC	Calculus BC	8	1	1	2022-04-09 00:58:19.494669+00	2022-04-09 00:58:19.494669+00
9	statistics	Statistics	9	1	1	2022-04-09 00:58:19.495401+00	2022-04-09 00:58:19.495401+00
10	biology	Biology	1	2	1	2022-04-09 00:58:19.49615+00	2022-04-09 00:58:19.49615+00
11	chemistry	Chemistry	2	2	1	2022-04-09 00:58:19.4969+00	2022-04-09 00:58:19.4969+00
12	physicsOne	Physics 1	3	2	1	2022-04-09 00:58:19.497599+00	2022-04-09 00:58:19.497599+00
13	physicsTwo	Physics 2	4	2	1	2022-04-09 00:58:19.498328+00	2022-04-09 00:58:19.498328+00
14	environmentalScience	Environmental Science	5	2	1	2022-04-09 00:58:19.499061+00	2022-04-09 00:58:19.499061+00
15	satMath	SAT Math	1	4	1	2022-04-09 00:58:19.49976+00	2022-04-09 00:58:19.49976+00
16	satReading	SAT Reading	2	4	2	2022-04-09 00:58:19.500464+00	2022-04-09 00:58:19.500464+00
17	essays	College Essays	2	3	2	2022-04-09 00:58:19.501126+00	2022-04-09 00:58:19.501126+00
18	planning	Planning	1	3	2	2022-04-09 00:58:19.501804+00	2022-04-09 00:58:19.501804+00
19	applications	Applications	3	3	2	2022-04-09 00:58:19.502524+00	2022-04-09 00:58:19.502524+00
20	humanitiesEssays	Humanities Essays	1	5	2	2022-04-09 00:58:19.503239+00	2022-04-09 00:58:19.503239+00
21	integratedMathOne	Integrated Math One	9	1	1	2022-04-09 00:58:19.503919+00	2022-04-09 00:58:19.503919+00
22	integratedMathTwo	Integrated Math Two	9	1	1	2022-04-09 00:58:19.504594+00	2022-04-09 00:58:19.504594+00
23	integratedMathThree	Integrated Math Three	9	1	1	2022-04-09 00:58:19.505302+00	2022-04-09 00:58:19.505302+00
24	integratedMathFour	Integrated Math Four	9	1	1	2022-04-09 00:58:19.506442+00	2022-04-09 00:58:19.506442+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_roles (id, name, created_at, updated_at) FROM stdin;
1	student	2022-04-09 00:58:19.452807+00	2022-04-09 00:58:19.452807+00
2	volunteer	2022-04-09 00:58:19.453923+00	2022-04-09 00:58:19.453923+00
3	admin	2022-04-09 00:58:19.45468+00	2022-04-09 00:58:19.45468+00
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sessions (id, student_id, volunteer_id, subject_id, has_whiteboard_doc, quill_doc, volunteer_joined_at, ended_at, ended_by_role_id, reviewed, to_review, student_banned, time_tutored, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: assistments_data; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at, sent_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sponsor_orgs (id, name, created_at, updated_at, key) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs (id, key, name, signup_code, high_school_signup, college_signup, school_signup_required, created_at, updated_at) FROM stdin;
01800bd4-39cb-3b93-8e22-c5f88fcb6584	placeholder1	Placeholder 1	\N	t	f	t	2022-04-09 00:58:19.468084+00	2022-04-09 00:58:19.468084+00
01800bd4-39cb-1b16-3644-6b08fc527154	placeholder2	Placeholder 2	\N	t	f	f	2022-04-09 00:58:19.469107+00	2022-04-09 00:58:19.469107+00
01800bd4-39cb-cac4-1cdc-537253172955	placeholder3	Placeholder 3	\N	f	f	f	2022-04-09 00:58:19.469783+00	2022-04-09 00:58:19.469783+00
\.


--
-- Data for Name: volunteer_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_partner_orgs (id, key, name, receive_weekly_hour_summary_email, created_at, updated_at) FROM stdin;
01800bd4-39d0-0cd7-28b3-3d9df0130564	placeholder1	Placeholder 1	t	2022-04-09 00:58:19.473063+00	2022-04-09 00:58:19.473063+00
01800bd4-39d0-1f75-82e3-595a81111ec7	placeholder2	Placeholder 2	f	2022-04-09 00:58:19.473994+00	2022-04-09 00:58:19.473994+00
\.


--
-- Data for Name: associated_partners; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.associated_partners (id, key, volunteer_partner_org_id, student_partner_org_id, student_sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: weekdays; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.weekdays (id, day, created_at, updated_at) FROM stdin;
1	Sunday	2022-04-09 00:58:19.447303+00	2022-04-09 00:58:19.447303+00
2	Monday	2022-04-09 00:58:19.44828+00	2022-04-09 00:58:19.44828+00
3	Tuesday	2022-04-09 00:58:19.448998+00	2022-04-09 00:58:19.448998+00
4	Wednesday	2022-04-09 00:58:19.449752+00	2022-04-09 00:58:19.449752+00
5	Thursday	2022-04-09 00:58:19.45051+00	2022-04-09 00:58:19.45051+00
6	Friday	2022-04-09 00:58:19.451204+00	2022-04-09 00:58:19.451204+00
7	Saturday	2022-04-09 00:58:19.451915+00	2022-04-09 00:58:19.451915+00
\.


--
-- Data for Name: availabilities; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.availabilities (id, user_id, weekday_id, available_start, available_end, timezone, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: availability_histories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.availability_histories (id, user_id, weekday_id, available_start, available_end, timezone, recorded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.certifications (id, name, created_at, updated_at) FROM stdin;
1	prealgebra	2022-04-09 00:58:19.747029+00	2022-04-09 00:58:19.747029+00
2	statistics	2022-04-09 00:58:19.747903+00	2022-04-09 00:58:19.747903+00
3	geometry	2022-04-09 00:58:19.748557+00	2022-04-09 00:58:19.748557+00
4	biology	2022-04-09 00:58:19.749209+00	2022-04-09 00:58:19.749209+00
5	chemistry	2022-04-09 00:58:19.749843+00	2022-04-09 00:58:19.749843+00
6	physicsOne	2022-04-09 00:58:19.750482+00	2022-04-09 00:58:19.750482+00
7	physicsTwo	2022-04-09 00:58:19.751141+00	2022-04-09 00:58:19.751141+00
8	environmentalScience	2022-04-09 00:58:19.751802+00	2022-04-09 00:58:19.751802+00
9	essays	2022-04-09 00:58:19.752437+00	2022-04-09 00:58:19.752437+00
10	applications	2022-04-09 00:58:19.753102+00	2022-04-09 00:58:19.753102+00
11	planning	2022-04-09 00:58:19.753737+00	2022-04-09 00:58:19.753737+00
12	satMath	2022-04-09 00:58:19.754394+00	2022-04-09 00:58:19.754394+00
13	satReading	2022-04-09 00:58:19.755228+00	2022-04-09 00:58:19.755228+00
14	collegeCounseling	2022-04-09 00:58:19.755869+00	2022-04-09 00:58:19.755869+00
15	humanitiesEssays	2022-04-09 00:58:19.756519+00	2022-04-09 00:58:19.756519+00
16	algebraOne	2022-04-09 00:58:19.757199+00	2022-04-09 00:58:19.757199+00
17	algebraTwo	2022-04-09 00:58:19.757863+00	2022-04-09 00:58:19.757863+00
18	trigonometry	2022-04-09 00:58:19.75851+00	2022-04-09 00:58:19.75851+00
19	precalculus	2022-04-09 00:58:19.759141+00	2022-04-09 00:58:19.759141+00
20	calculusAB	2022-04-09 00:58:19.759802+00	2022-04-09 00:58:19.759802+00
21	calculusBC	2022-04-09 00:58:19.76047+00	2022-04-09 00:58:19.76047+00
\.


--
-- Data for Name: certification_subject_unlocks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at) FROM stdin;
21	16	2022-04-09 00:58:19.792826+00	2022-04-09 00:58:19.792826+00
21	3	2022-04-09 00:58:19.793833+00	2022-04-09 00:58:19.793833+00
21	2	2022-04-09 00:58:19.794602+00	2022-04-09 00:58:19.794602+00
22	16	2022-04-09 00:58:19.795287+00	2022-04-09 00:58:19.795287+00
22	3	2022-04-09 00:58:19.796841+00	2022-04-09 00:58:19.796841+00
22	2	2022-04-09 00:58:19.797591+00	2022-04-09 00:58:19.797591+00
22	18	2022-04-09 00:58:19.798377+00	2022-04-09 00:58:19.798377+00
23	19	2022-04-09 00:58:19.799067+00	2022-04-09 00:58:19.799067+00
23	2	2022-04-09 00:58:19.799976+00	2022-04-09 00:58:19.799976+00
24	19	2022-04-09 00:58:19.80071+00	2022-04-09 00:58:19.80071+00
1	1	2022-04-09 00:58:19.801472+00	2022-04-09 00:58:19.801472+00
9	2	2022-04-09 00:58:19.8022+00	2022-04-09 00:58:19.8022+00
4	3	2022-04-09 00:58:19.802908+00	2022-04-09 00:58:19.802908+00
10	4	2022-04-09 00:58:19.803657+00	2022-04-09 00:58:19.803657+00
11	5	2022-04-09 00:58:19.80492+00	2022-04-09 00:58:19.80492+00
12	6	2022-04-09 00:58:19.805709+00	2022-04-09 00:58:19.805709+00
13	7	2022-04-09 00:58:19.806522+00	2022-04-09 00:58:19.806522+00
14	8	2022-04-09 00:58:19.807247+00	2022-04-09 00:58:19.807247+00
17	9	2022-04-09 00:58:19.807963+00	2022-04-09 00:58:19.807963+00
19	10	2022-04-09 00:58:19.808688+00	2022-04-09 00:58:19.808688+00
18	11	2022-04-09 00:58:19.809351+00	2022-04-09 00:58:19.809351+00
15	12	2022-04-09 00:58:19.810015+00	2022-04-09 00:58:19.810015+00
16	13	2022-04-09 00:58:19.810725+00	2022-04-09 00:58:19.810725+00
20	15	2022-04-09 00:58:19.81145+00	2022-04-09 00:58:19.81145+00
2	16	2022-04-09 00:58:19.812175+00	2022-04-09 00:58:19.812175+00
3	17	2022-04-09 00:58:19.81303+00	2022-04-09 00:58:19.81303+00
5	18	2022-04-09 00:58:19.813735+00	2022-04-09 00:58:19.813735+00
6	19	2022-04-09 00:58:19.814402+00	2022-04-09 00:58:19.814402+00
7	20	2022-04-09 00:58:19.815109+00	2022-04-09 00:58:19.815109+00
8	21	2022-04-09 00:58:19.815754+00	2022-04-09 00:58:19.815754+00
\.


--
-- Data for Name: us_states; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.us_states (code, name, created_at, updated_at) FROM stdin;
AL	Alabama	2022-04-09 00:58:19.196578+00	2022-04-09 00:58:19.196578+00
AK	Alaska	2022-04-09 00:58:19.204733+00	2022-04-09 00:58:19.204733+00
AR	Arkansas	2022-04-09 00:58:19.207315+00	2022-04-09 00:58:19.207315+00
AZ	Arizona	2022-04-09 00:58:19.212008+00	2022-04-09 00:58:19.212008+00
CA	California	2022-04-09 00:58:19.214797+00	2022-04-09 00:58:19.214797+00
CO	Colorado	2022-04-09 00:58:19.217373+00	2022-04-09 00:58:19.217373+00
CT	Connecticut	2022-04-09 00:58:19.219265+00	2022-04-09 00:58:19.219265+00
DE	Delaware	2022-04-09 00:58:19.220835+00	2022-04-09 00:58:19.220835+00
DC	District of Columbia	2022-04-09 00:58:19.222163+00	2022-04-09 00:58:19.222163+00
FL	Florida	2022-04-09 00:58:19.223432+00	2022-04-09 00:58:19.223432+00
GA	Georgia	2022-04-09 00:58:19.224843+00	2022-04-09 00:58:19.224843+00
HI	Hawaii	2022-04-09 00:58:19.226022+00	2022-04-09 00:58:19.226022+00
ID	Idaho	2022-04-09 00:58:19.226961+00	2022-04-09 00:58:19.226961+00
IL	Illinois	2022-04-09 00:58:19.227844+00	2022-04-09 00:58:19.227844+00
IN	Indiana	2022-04-09 00:58:19.228642+00	2022-04-09 00:58:19.228642+00
IA	Iowa	2022-04-09 00:58:19.229541+00	2022-04-09 00:58:19.229541+00
KS	Kansas	2022-04-09 00:58:19.230349+00	2022-04-09 00:58:19.230349+00
KY	Kentucky	2022-04-09 00:58:19.231228+00	2022-04-09 00:58:19.231228+00
LA	Louisiana	2022-04-09 00:58:19.232081+00	2022-04-09 00:58:19.232081+00
ME	Maine	2022-04-09 00:58:19.233016+00	2022-04-09 00:58:19.233016+00
MD	Maryland	2022-04-09 00:58:19.233903+00	2022-04-09 00:58:19.233903+00
MA	Massachusetts	2022-04-09 00:58:19.23471+00	2022-04-09 00:58:19.23471+00
MI	Michigan	2022-04-09 00:58:19.235507+00	2022-04-09 00:58:19.235507+00
MN	Minnesota	2022-04-09 00:58:19.236316+00	2022-04-09 00:58:19.236316+00
MS	Mississippi	2022-04-09 00:58:19.237095+00	2022-04-09 00:58:19.237095+00
MO	Missouri	2022-04-09 00:58:19.237848+00	2022-04-09 00:58:19.237848+00
MT	Montana	2022-04-09 00:58:19.238594+00	2022-04-09 00:58:19.238594+00
NE	Nebraska	2022-04-09 00:58:19.239431+00	2022-04-09 00:58:19.239431+00
NV	Nevada	2022-04-09 00:58:19.240293+00	2022-04-09 00:58:19.240293+00
NH	New Hampshire	2022-04-09 00:58:19.241156+00	2022-04-09 00:58:19.241156+00
NJ	New Jersey	2022-04-09 00:58:19.241975+00	2022-04-09 00:58:19.241975+00
NM	New Mexico	2022-04-09 00:58:19.24283+00	2022-04-09 00:58:19.24283+00
NY	New York	2022-04-09 00:58:19.243661+00	2022-04-09 00:58:19.243661+00
NC	North Carolina	2022-04-09 00:58:19.244523+00	2022-04-09 00:58:19.244523+00
ND	North Dakota	2022-04-09 00:58:19.245431+00	2022-04-09 00:58:19.245431+00
OH	Ohio	2022-04-09 00:58:19.246294+00	2022-04-09 00:58:19.246294+00
OK	Oklahoma	2022-04-09 00:58:19.247059+00	2022-04-09 00:58:19.247059+00
OR	Oregon	2022-04-09 00:58:19.248287+00	2022-04-09 00:58:19.248287+00
PA	Pennsylvania	2022-04-09 00:58:19.249234+00	2022-04-09 00:58:19.249234+00
RI	Rhode Island	2022-04-09 00:58:19.250163+00	2022-04-09 00:58:19.250163+00
SC	South Carolina	2022-04-09 00:58:19.250954+00	2022-04-09 00:58:19.250954+00
SD	South Dakota	2022-04-09 00:58:19.251886+00	2022-04-09 00:58:19.251886+00
TN	Tennessee	2022-04-09 00:58:19.252778+00	2022-04-09 00:58:19.252778+00
TX	Texas	2022-04-09 00:58:19.253704+00	2022-04-09 00:58:19.253704+00
UT	Utah	2022-04-09 00:58:19.254618+00	2022-04-09 00:58:19.254618+00
VT	Vermont	2022-04-09 00:58:19.255446+00	2022-04-09 00:58:19.255446+00
VA	Virginia	2022-04-09 00:58:19.256326+00	2022-04-09 00:58:19.256326+00
WA	Washington	2022-04-09 00:58:19.257146+00	2022-04-09 00:58:19.257146+00
WV	West Virginia	2022-04-09 00:58:19.258084+00	2022-04-09 00:58:19.258084+00
WI	Wisconsin	2022-04-09 00:58:19.259346+00	2022-04-09 00:58:19.259346+00
WY	Wyoming	2022-04-09 00:58:19.26002+00	2022-04-09 00:58:19.26002+00
PR	Puerto Rico	2022-04-09 00:58:19.260719+00	2022-04-09 00:58:19.260719+00
GU	Guam	2022-04-09 00:58:19.261389+00	2022-04-09 00:58:19.261389+00
VI	Virgin Islands	2022-04-09 00:58:19.262031+00	2022-04-09 00:58:19.262031+00
AS	American Samoa	2022-04-09 00:58:19.262703+00	2022-04-09 00:58:19.262703+00
BI	Bureau of Indian Education	2022-04-09 00:58:19.263414+00	2022-04-09 00:58:19.263414+00
NA	NA	2022-04-09 00:58:19.264144+00	2022-04-09 00:58:19.264144+00
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.cities (id, name, us_state_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contact_form_submissions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.contact_form_submissions (id, user_id, user_email, message, topic, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.feedbacks (id, topic_id, subject_id, user_role_id, session_id, student_tutoring_feedback, student_counseling_feedback, volunteer_feedback, comment, user_id, legacy_feedbacks, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: grade_levels; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.grade_levels (id, name, created_at, updated_at) FROM stdin;
1	8th	2022-04-09 00:58:19.463582+00	2022-04-09 00:58:19.463582+00
2	9th	2022-04-09 00:58:19.464508+00	2022-04-09 00:58:19.464508+00
3	10th	2022-04-09 00:58:19.465162+00	2022-04-09 00:58:19.465162+00
4	11th	2022-04-09 00:58:19.46585+00	2022-04-09 00:58:19.46585+00
5	12th	2022-04-09 00:58:19.466544+00	2022-04-09 00:58:19.466544+00
6	College	2022-04-09 00:58:19.467176+00	2022-04-09 00:58:19.467176+00
\.


--
-- Data for Name: ip_addresses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ip_addresses (id, ip, status, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: postal_codes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.postal_codes (code, us_state_code, income, location, created_at, updated_at) FROM stdin;
00501	NY	0	(40.81,-73.04)	2022-04-09 00:58:19.343394+00	2022-04-09 00:58:19.343394+00
00544	NY	0	(40.81,-73.04)	2022-04-09 00:58:19.442128+00	2022-04-09 00:58:19.442128+00
01001	MA	91129	(42.06,-72.61)	2022-04-09 00:58:19.442319+00	2022-04-09 00:58:19.442319+00
01002	MA	147482	(42.37,-72.52)	2022-04-09 00:58:19.442593+00	2022-04-09 00:58:19.442593+00
01005	MA	24883	(42.42,-72.1)	2022-04-09 00:58:19.442605+00	2022-04-09 00:58:19.442605+00
01004	MA	0	(42.37,-72.52)	2022-04-09 00:58:19.442356+00	2022-04-09 00:58:19.442356+00
01003	MA	0	(42.39,-72.52)	2022-04-09 00:58:19.443043+00	2022-04-09 00:58:19.443043+00
01007	MA	103396	(42.27,-72.4)	2022-04-09 00:58:19.443109+00	2022-04-09 00:58:19.443109+00
01008	MA	7667	(42.18,-72.93)	2022-04-09 00:58:19.443744+00	2022-04-09 00:58:19.443744+00
01009	MA	0	(42.2,-72.34)	2022-04-09 00:58:19.44495+00	2022-04-09 00:58:19.44495+00
00000	NA	0	(0,0)	2022-04-09 00:58:19.446403+00	2022-04-09 00:58:19.446403+00
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools (id, name, approved, partner, city_id, created_at, updated_at, mongo_id, legacy_city_name) FROM stdin;
01800bd4-790a-f3e5-c635-4463671f6772	Test School	f	f	\N	2022-04-09 00:58:35.661066+00	2022-04-09 00:58:35.661066+00	\N	\N
01800bd4-790a-9289-1e3d-ea6e5ff24779	Legacy Signup High School	t	t	\N	2022-04-09 00:58:35.668565+00	2022-04-09 00:58:35.668565+00	\N	\N
\.


--
-- Data for Name: ineligible_students; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ineligible_students (id, email, postal_code, ip_address_id, school_id, grade_level_id, created_at, updated_at, mongo_id, referred_by) FROM stdin;
\.


--
-- Data for Name: legacy_availability_histories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.legacy_availability_histories (id, mongo_id, user_id, timezone, recorded_at, legacy_availability, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_methods; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_methods (id, method, created_at, updated_at) FROM stdin;
1	sms	2022-04-09 00:58:19.831624+00	2022-04-09 00:58:19.831624+00
2	push	2022-04-09 00:58:19.832522+00	2022-04-09 00:58:19.832522+00
3	voice	2022-04-09 00:58:19.833133+00	2022-04-09 00:58:19.833133+00
4	email	2022-04-09 00:58:19.834326+00	2022-04-09 00:58:19.834326+00
\.


--
-- Data for Name: notification_priority_groups; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_priority_groups (id, name, priority, created_at, updated_at) FROM stdin;
1	follow-up	-1	2022-04-09 00:58:19.835303+00	2022-04-09 00:58:19.835303+00
2	Partner volunteers - not notified in the last 3 days AND they don't have "high level subjects"	1	2022-04-09 00:58:19.836266+00	2022-04-09 00:58:19.836266+00
3	Regular volunteers - not notified in the last 3 days AND they don't have "high level subjects"	2	2022-04-09 00:58:19.837111+00	2022-04-09 00:58:19.837111+00
4	Partner volunteers - not notified in the last 24 hours AND they don't have "high level subjects"	3	2022-04-09 00:58:19.837961+00	2022-04-09 00:58:19.837961+00
5	Regular volunteers - not notified in the last 24 hours AND they don't have "high level subjects"	4	2022-04-09 00:58:19.838748+00	2022-04-09 00:58:19.838748+00
6	All volunteers - not notified in the last 24 hours	5	2022-04-09 00:58:19.839477+00	2022-04-09 00:58:19.839477+00
7	All volunteers - not notified in the last 60 mins	6	2022-04-09 00:58:19.840176+00	2022-04-09 00:58:19.840176+00
8	All volunteers - not notified in the last 15 mins	7	2022-04-09 00:58:19.840887+00	2022-04-09 00:58:19.840887+00
9	Verizon volunteers - not notified in the last 24 hours AND they don't have "high level subjects"	8	2022-04-09 00:58:19.841571+00	2022-04-09 00:58:19.841571+00
10	Verizon volunteers - not notified in the last 3 days AND they don't have "high level subjects"	9	2022-04-09 00:58:19.842224+00	2022-04-09 00:58:19.842224+00
11	LEGACY: Regular volunteers - not notified in the last 7 days	-1	2022-04-09 00:58:19.842877+00	2022-04-09 00:58:19.842877+00
12	LEGACY: Partner volunteers - not notified in the last 7 days	-1	2022-04-09 00:58:19.843557+00	2022-04-09 00:58:19.843557+00
13	LEGACY: Partner volunteers - not notified in the last 3 days	-1	2022-04-09 00:58:19.844234+00	2022-04-09 00:58:19.844234+00
14	LEGACY: All volunteers - not notified in the last 15 mins who don't have "high level subjects"	-1	2022-04-09 00:58:19.845234+00	2022-04-09 00:58:19.845234+00
15	LEGACY: Mizuho and Atlassian volunteers - Not notified in last 3 days	-1	2022-04-09 00:58:19.845935+00	2022-04-09 00:58:19.845935+00
16	LEGACY: null	-1	2022-04-09 00:58:19.846677+00	2022-04-09 00:58:19.846677+00
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_types (id, type, created_at, updated_at) FROM stdin;
1	initial	2022-04-09 00:58:19.829916+00	2022-04-09 00:58:19.829916+00
2	followup	2022-04-09 00:58:19.83087+00	2022-04-09 00:58:19.83087+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notifications (id, user_id, sent_at, type_id, method_id, priority_group_id, successful, session_id, message_carrier_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: photo_id_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.photo_id_statuses (id, name, created_at, updated_at) FROM stdin;
1	approved	2022-04-09 00:58:19.475669+00	2022-04-09 00:58:19.475669+00
2	submitted	2022-04-09 00:58:19.476499+00	2022-04-09 00:58:19.476499+00
3	rejected	2022-04-09 00:58:19.477172+00	2022-04-09 00:58:19.477172+00
4	empty	2022-04-09 00:58:19.477844+00	2022-04-09 00:58:19.477844+00
\.


--
-- Data for Name: pre_session_surveys; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.pre_session_surveys (id, response_data, session_id, user_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: push_tokens; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.push_tokens (id, user_id, token, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quizzes (id, name, created_at, updated_at) FROM stdin;
1	prealgebra	2022-04-09 00:58:19.507323+00	2022-04-09 00:58:19.507323+00
2	statistics	2022-04-09 00:58:19.508239+00	2022-04-09 00:58:19.508239+00
3	geometry	2022-04-09 00:58:19.508941+00	2022-04-09 00:58:19.508941+00
4	biology	2022-04-09 00:58:19.509608+00	2022-04-09 00:58:19.509608+00
5	chemistry	2022-04-09 00:58:19.510311+00	2022-04-09 00:58:19.510311+00
6	physicsOne	2022-04-09 00:58:19.510993+00	2022-04-09 00:58:19.510993+00
7	physicsTwo	2022-04-09 00:58:19.511704+00	2022-04-09 00:58:19.511704+00
8	environmentalScience	2022-04-09 00:58:19.512435+00	2022-04-09 00:58:19.512435+00
9	essays	2022-04-09 00:58:19.513201+00	2022-04-09 00:58:19.513201+00
10	applications	2022-04-09 00:58:19.514064+00	2022-04-09 00:58:19.514064+00
11	planning	2022-04-09 00:58:19.514824+00	2022-04-09 00:58:19.514824+00
12	satMath	2022-04-09 00:58:19.515565+00	2022-04-09 00:58:19.515565+00
13	satReading	2022-04-09 00:58:19.516305+00	2022-04-09 00:58:19.516305+00
14	collegeCounseling	2022-04-09 00:58:19.516949+00	2022-04-09 00:58:19.516949+00
15	humanitiesEssays	2022-04-09 00:58:19.517691+00	2022-04-09 00:58:19.517691+00
16	algebraOne	2022-04-09 00:58:19.518446+00	2022-04-09 00:58:19.518446+00
17	algebraTwo	2022-04-09 00:58:19.519133+00	2022-04-09 00:58:19.519133+00
18	trigonometry	2022-04-09 00:58:19.519828+00	2022-04-09 00:58:19.519828+00
19	precalculus	2022-04-09 00:58:19.520515+00	2022-04-09 00:58:19.520515+00
20	calculusAB	2022-04-09 00:58:19.521175+00	2022-04-09 00:58:19.521175+00
21	calculusBC	2022-04-09 00:58:19.521842+00	2022-04-09 00:58:19.521842+00
22	upchieve101	2022-04-09 00:58:19.522509+00	2022-04-09 00:58:19.522509+00
23	reading	2022-04-09 00:58:19.523167+00	2022-04-09 00:58:19.523167+00
24	anatomy	2022-04-09 00:58:19.524097+00	2022-04-09 00:58:19.524097+00
\.


--
-- Data for Name: quiz_certification_grants; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) FROM stdin;
1	1	2022-04-09 00:58:19.761871+00	2022-04-09 00:58:19.761871+00
2	2	2022-04-09 00:58:19.76292+00	2022-04-09 00:58:19.76292+00
3	3	2022-04-09 00:58:19.763684+00	2022-04-09 00:58:19.763684+00
4	4	2022-04-09 00:58:19.764403+00	2022-04-09 00:58:19.764403+00
5	5	2022-04-09 00:58:19.76505+00	2022-04-09 00:58:19.76505+00
6	6	2022-04-09 00:58:19.766163+00	2022-04-09 00:58:19.766163+00
7	7	2022-04-09 00:58:19.766899+00	2022-04-09 00:58:19.766899+00
8	8	2022-04-09 00:58:19.767612+00	2022-04-09 00:58:19.767612+00
9	9	2022-04-09 00:58:19.768293+00	2022-04-09 00:58:19.768293+00
10	10	2022-04-09 00:58:19.768923+00	2022-04-09 00:58:19.768923+00
11	11	2022-04-09 00:58:19.769617+00	2022-04-09 00:58:19.769617+00
12	12	2022-04-09 00:58:19.770268+00	2022-04-09 00:58:19.770268+00
13	13	2022-04-09 00:58:19.770967+00	2022-04-09 00:58:19.770967+00
14	11	2022-04-09 00:58:19.77162+00	2022-04-09 00:58:19.77162+00
14	10	2022-04-09 00:58:19.772249+00	2022-04-09 00:58:19.772249+00
15	15	2022-04-09 00:58:19.772895+00	2022-04-09 00:58:19.772895+00
17	16	2022-04-09 00:58:19.773571+00	2022-04-09 00:58:19.773571+00
17	17	2022-04-09 00:58:19.774215+00	2022-04-09 00:58:19.774215+00
17	1	2022-04-09 00:58:19.775051+00	2022-04-09 00:58:19.775051+00
16	16	2022-04-09 00:58:19.775681+00	2022-04-09 00:58:19.775681+00
16	1	2022-04-09 00:58:19.777008+00	2022-04-09 00:58:19.777008+00
18	18	2022-04-09 00:58:19.777776+00	2022-04-09 00:58:19.777776+00
19	16	2022-04-09 00:58:19.778875+00	2022-04-09 00:58:19.778875+00
19	17	2022-04-09 00:58:19.77962+00	2022-04-09 00:58:19.77962+00
19	1	2022-04-09 00:58:19.780359+00	2022-04-09 00:58:19.780359+00
19	18	2022-04-09 00:58:19.781058+00	2022-04-09 00:58:19.781058+00
19	19	2022-04-09 00:58:19.781784+00	2022-04-09 00:58:19.781784+00
20	16	2022-04-09 00:58:19.782519+00	2022-04-09 00:58:19.782519+00
20	17	2022-04-09 00:58:19.783202+00	2022-04-09 00:58:19.783202+00
20	1	2022-04-09 00:58:19.784262+00	2022-04-09 00:58:19.784262+00
20	18	2022-04-09 00:58:19.785369+00	2022-04-09 00:58:19.785369+00
20	19	2022-04-09 00:58:19.786246+00	2022-04-09 00:58:19.786246+00
20	20	2022-04-09 00:58:19.78709+00	2022-04-09 00:58:19.78709+00
21	16	2022-04-09 00:58:19.787818+00	2022-04-09 00:58:19.787818+00
21	17	2022-04-09 00:58:19.788529+00	2022-04-09 00:58:19.788529+00
21	1	2022-04-09 00:58:19.78923+00	2022-04-09 00:58:19.78923+00
21	18	2022-04-09 00:58:19.789922+00	2022-04-09 00:58:19.789922+00
21	19	2022-04-09 00:58:19.79061+00	2022-04-09 00:58:19.79061+00
21	20	2022-04-09 00:58:19.791308+00	2022-04-09 00:58:19.791308+00
21	21	2022-04-09 00:58:19.792011+00	2022-04-09 00:58:19.792011+00
\.


--
-- Data for Name: quiz_subcategories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_subcategories (id, name, quiz_id, created_at, updated_at) FROM stdin;
1	numbers	1	2022-04-09 00:58:19.526651+00	2022-04-09 00:58:19.526651+00
2	arithmetic properties	1	2022-04-09 00:58:19.527977+00	2022-04-09 00:58:19.527977+00
3	exponents	1	2022-04-09 00:58:19.528813+00	2022-04-09 00:58:19.528813+00
4	exponents and radicals	1	2022-04-09 00:58:19.529564+00	2022-04-09 00:58:19.529564+00
5	polynomials	1	2022-04-09 00:58:19.530316+00	2022-04-09 00:58:19.530316+00
6	fractions	1	2022-04-09 00:58:19.531021+00	2022-04-09 00:58:19.531021+00
7	linear equations	16	2022-04-09 00:58:19.531699+00	2022-04-09 00:58:19.531699+00
8	rational exponents and radicals	16	2022-04-09 00:58:19.532737+00	2022-04-09 00:58:19.532737+00
9	application of linear equations	16	2022-04-09 00:58:19.533453+00	2022-04-09 00:58:19.533453+00
10	two variable equations	16	2022-04-09 00:58:19.534227+00	2022-04-09 00:58:19.534227+00
11	rational expressions	16	2022-04-09 00:58:19.534991+00	2022-04-09 00:58:19.534991+00
12	complex numbers	16	2022-04-09 00:58:19.535689+00	2022-04-09 00:58:19.535689+00
13	functions_domain_range	17	2022-04-09 00:58:19.536367+00	2022-04-09 00:58:19.536367+00
14	higher_degree_polynomials	17	2022-04-09 00:58:19.537077+00	2022-04-09 00:58:19.537077+00
15	square_root_equations	17	2022-04-09 00:58:19.537781+00	2022-04-09 00:58:19.537781+00
16	roots_of_polynomials	17	2022-04-09 00:58:19.538465+00	2022-04-09 00:58:19.538465+00
17	multiply_polynomials_binomial	17	2022-04-09 00:58:19.539127+00	2022-04-09 00:58:19.539127+00
18	rational_radical_absolute	17	2022-04-09 00:58:19.539795+00	2022-04-09 00:58:19.539795+00
19	logarithms_properties	17	2022-04-09 00:58:19.540499+00	2022-04-09 00:58:19.540499+00
20	rational_expressions	17	2022-04-09 00:58:19.5412+00	2022-04-09 00:58:19.5412+00
21	systems_of_linear_equations	17	2022-04-09 00:58:19.541861+00	2022-04-09 00:58:19.541861+00
22	arithmetic_and_geometric_sequences	17	2022-04-09 00:58:19.542525+00	2022-04-09 00:58:19.542525+00
23	functions_domain	17	2022-04-09 00:58:19.543157+00	2022-04-09 00:58:19.543157+00
24	solving_linear_equations	17	2022-04-09 00:58:19.543824+00	2022-04-09 00:58:19.543824+00
25	function_transformations_shifts	17	2022-04-09 00:58:19.544471+00	2022-04-09 00:58:19.544471+00
26	graphing_quadratic_functions	17	2022-04-09 00:58:19.545135+00	2022-04-09 00:58:19.545135+00
27	exponential_functions_growth	17	2022-04-09 00:58:19.545825+00	2022-04-09 00:58:19.545825+00
28	rounding_and_scientific_notation	17	2022-04-09 00:58:19.546499+00	2022-04-09 00:58:19.546499+00
29	square root_equations_quadratic	17	2022-04-09 00:58:19.547198+00	2022-04-09 00:58:19.547198+00
30	advanced_factoring_techniques	17	2022-04-09 00:58:19.54787+00	2022-04-09 00:58:19.54787+00
31	congruence and similarity	3	2022-04-09 00:58:19.548498+00	2022-04-09 00:58:19.548498+00
32	vertices	3	2022-04-09 00:58:19.549204+00	2022-04-09 00:58:19.549204+00
33	angles	3	2022-04-09 00:58:19.549877+00	2022-04-09 00:58:19.549877+00
34	circles	3	2022-04-09 00:58:19.55058+00	2022-04-09 00:58:19.55058+00
35	triangles	3	2022-04-09 00:58:19.5527+00	2022-04-09 00:58:19.5527+00
36	rectangles	3	2022-04-09 00:58:19.553562+00	2022-04-09 00:58:19.553562+00
37	angles	18	2022-04-09 00:58:19.554321+00	2022-04-09 00:58:19.554321+00
38	triangles	18	2022-04-09 00:58:19.555072+00	2022-04-09 00:58:19.555072+00
39	right triangles	18	2022-04-09 00:58:19.555785+00	2022-04-09 00:58:19.555785+00
40	quadrants	18	2022-04-09 00:58:19.556446+00	2022-04-09 00:58:19.556446+00
41	radians	18	2022-04-09 00:58:19.557171+00	2022-04-09 00:58:19.557171+00
42	unit circles	18	2022-04-09 00:58:19.557873+00	2022-04-09 00:58:19.557873+00
43	inequalities	18	2022-04-09 00:58:19.558533+00	2022-04-09 00:58:19.558533+00
44	representing data numerically	2	2022-04-09 00:58:19.559202+00	2022-04-09 00:58:19.559202+00
45	representing data graphically	2	2022-04-09 00:58:19.559876+00	2022-04-09 00:58:19.559876+00
46	two means	2	2022-04-09 00:58:19.560685+00	2022-04-09 00:58:19.560685+00
47	two proportions	2	2022-04-09 00:58:19.561378+00	2022-04-09 00:58:19.561378+00
48	levels of measurement	2	2022-04-09 00:58:19.562092+00	2022-04-09 00:58:19.562092+00
49	types of sampling	2	2022-04-09 00:58:19.562779+00	2022-04-09 00:58:19.562779+00
50	finding probability	2	2022-04-09 00:58:19.563476+00	2022-04-09 00:58:19.563476+00
51	finding x from z score	2	2022-04-09 00:58:19.564132+00	2022-04-09 00:58:19.564132+00
52	z score	2	2022-04-09 00:58:19.56483+00	2022-04-09 00:58:19.56483+00
53	basic set operations	2	2022-04-09 00:58:19.565509+00	2022-04-09 00:58:19.565509+00
54	compound events	2	2022-04-09 00:58:19.566183+00	2022-04-09 00:58:19.566183+00
55	conditional probability	2	2022-04-09 00:58:19.566877+00	2022-04-09 00:58:19.566877+00
56	independent probability	2	2022-04-09 00:58:19.567528+00	2022-04-09 00:58:19.567528+00
57	permutations and combinations	2	2022-04-09 00:58:19.568198+00	2022-04-09 00:58:19.568198+00
58	random variables distributions	2	2022-04-09 00:58:19.568874+00	2022-04-09 00:58:19.568874+00
59	relationships between variables	2	2022-04-09 00:58:19.56951+00	2022-04-09 00:58:19.56951+00
60	confidence intervals	2	2022-04-09 00:58:19.5702+00	2022-04-09 00:58:19.5702+00
61	interpreting pvalue	2	2022-04-09 00:58:19.570855+00	2022-04-09 00:58:19.570855+00
62	finding the test statistic	2	2022-04-09 00:58:19.571517+00	2022-04-09 00:58:19.571517+00
63	rectangular coordinates	19	2022-04-09 00:58:19.572173+00	2022-04-09 00:58:19.572173+00
64	linear inequalities	19	2022-04-09 00:58:19.572841+00	2022-04-09 00:58:19.572841+00
65	functions	19	2022-04-09 00:58:19.57351+00	2022-04-09 00:58:19.57351+00
66	rational exponents	19	2022-04-09 00:58:19.574136+00	2022-04-09 00:58:19.574136+00
67	quadratic functions	19	2022-04-09 00:58:19.57482+00	2022-04-09 00:58:19.57482+00
68	logarithms and exponents	19	2022-04-09 00:58:19.575518+00	2022-04-09 00:58:19.575518+00
69	absolute extrema	20	2022-04-09 00:58:19.576152+00	2022-04-09 00:58:19.576152+00
70	antiderivatives	20	2022-04-09 00:58:19.57685+00	2022-04-09 00:58:19.57685+00
71	area between curves	20	2022-04-09 00:58:19.577724+00	2022-04-09 00:58:19.577724+00
72	chain rule	20	2022-04-09 00:58:19.578416+00	2022-04-09 00:58:19.578416+00
73	concavity	20	2022-04-09 00:58:19.57916+00	2022-04-09 00:58:19.57916+00
74	continuity	20	2022-04-09 00:58:19.579879+00	2022-04-09 00:58:19.579879+00
75	derivatives	20	2022-04-09 00:58:19.58057+00	2022-04-09 00:58:19.58057+00
76	differential equations	20	2022-04-09 00:58:19.58131+00	2022-04-09 00:58:19.58131+00
77	fundamental theorem	20	2022-04-09 00:58:19.581964+00	2022-04-09 00:58:19.581964+00
78	lhopitals rule	20	2022-04-09 00:58:19.582619+00	2022-04-09 00:58:19.582619+00
79	implicit differentiation	20	2022-04-09 00:58:19.583831+00	2022-04-09 00:58:19.583831+00
80	mean value theorem	20	2022-04-09 00:58:19.584507+00	2022-04-09 00:58:19.584507+00
81	optimization	20	2022-04-09 00:58:19.585205+00	2022-04-09 00:58:19.585205+00
82	reimann sums	20	2022-04-09 00:58:19.585852+00	2022-04-09 00:58:19.585852+00
83	related rates	20	2022-04-09 00:58:19.586523+00	2022-04-09 00:58:19.586523+00
84	relative extrema	20	2022-04-09 00:58:19.58726+00	2022-04-09 00:58:19.58726+00
85	absolute extrema	21	2022-04-09 00:58:19.587937+00	2022-04-09 00:58:19.587937+00
86	antiderivatives	21	2022-04-09 00:58:19.588593+00	2022-04-09 00:58:19.588593+00
87	area between curves	21	2022-04-09 00:58:19.589242+00	2022-04-09 00:58:19.589242+00
88	chain rule	21	2022-04-09 00:58:19.58993+00	2022-04-09 00:58:19.58993+00
89	derivatives	21	2022-04-09 00:58:19.590652+00	2022-04-09 00:58:19.590652+00
90	differential equations	21	2022-04-09 00:58:19.591308+00	2022-04-09 00:58:19.591308+00
91	fundamental theorem of calculus	21	2022-04-09 00:58:19.591971+00	2022-04-09 00:58:19.591971+00
92	implicit differentiation	21	2022-04-09 00:58:19.5926+00	2022-04-09 00:58:19.5926+00
93	infinite sequences	21	2022-04-09 00:58:19.593275+00	2022-04-09 00:58:19.593275+00
94	limits	21	2022-04-09 00:58:19.593956+00	2022-04-09 00:58:19.593956+00
95	integration by parts	21	2022-04-09 00:58:19.594636+00	2022-04-09 00:58:19.594636+00
96	mean value theorem	21	2022-04-09 00:58:19.595337+00	2022-04-09 00:58:19.595337+00
97	optimization	21	2022-04-09 00:58:19.595996+00	2022-04-09 00:58:19.595996+00
98	parametric	21	2022-04-09 00:58:19.596641+00	2022-04-09 00:58:19.596641+00
99	reimann sums	21	2022-04-09 00:58:19.597336+00	2022-04-09 00:58:19.597336+00
100	relative extrema	21	2022-04-09 00:58:19.599006+00	2022-04-09 00:58:19.599006+00
101	taylor polynomials	21	2022-04-09 00:58:19.600087+00	2022-04-09 00:58:19.600087+00
102	basic	9	2022-04-09 00:58:19.600905+00	2022-04-09 00:58:19.600905+00
103	commonapp	9	2022-04-09 00:58:19.601644+00	2022-04-09 00:58:19.601644+00
104	answer	9	2022-04-09 00:58:19.602316+00	2022-04-09 00:58:19.602316+00
105	dhistory	9	2022-04-09 00:58:19.603045+00	2022-04-09 00:58:19.603045+00
106	optional	9	2022-04-09 00:58:19.603792+00	2022-04-09 00:58:19.603792+00
107	supplemental	9	2022-04-09 00:58:19.604494+00	2022-04-09 00:58:19.604494+00
108	exam	11	2022-04-09 00:58:19.605195+00	2022-04-09 00:58:19.605195+00
109	type	11	2022-04-09 00:58:19.605903+00	2022-04-09 00:58:19.605903+00
110	LOR	11	2022-04-09 00:58:19.606572+00	2022-04-09 00:58:19.606572+00
111	basic	11	2022-04-09 00:58:19.607262+00	2022-04-09 00:58:19.607262+00
112	timeline	10	2022-04-09 00:58:19.607931+00	2022-04-09 00:58:19.607931+00
113	resume	10	2022-04-09 00:58:19.608741+00	2022-04-09 00:58:19.608741+00
114	schools	10	2022-04-09 00:58:19.609429+00	2022-04-09 00:58:19.609429+00
115	fees	10	2022-04-09 00:58:19.610082+00	2022-04-09 00:58:19.610082+00
116	FinAid	10	2022-04-09 00:58:19.610819+00	2022-04-09 00:58:19.610819+00
117	LOR	10	2022-04-09 00:58:19.611482+00	2022-04-09 00:58:19.611482+00
118	basic	10	2022-04-09 00:58:19.612152+00	2022-04-09 00:58:19.612152+00
119	biochemistry	4	2022-04-09 00:58:19.612838+00	2022-04-09 00:58:19.612838+00
120	the cell	4	2022-04-09 00:58:19.613531+00	2022-04-09 00:58:19.613531+00
121	cell division	4	2022-04-09 00:58:19.614242+00	2022-04-09 00:58:19.614242+00
122	cellular respiration	4	2022-04-09 00:58:19.614944+00	2022-04-09 00:58:19.614944+00
123	photosynthesis and plants	4	2022-04-09 00:58:19.615665+00	2022-04-09 00:58:19.615665+00
124	classical genetics	4	2022-04-09 00:58:19.616362+00	2022-04-09 00:58:19.616362+00
125	molecular genetics	4	2022-04-09 00:58:19.617022+00	2022-04-09 00:58:19.617022+00
126	animal behavior and physiology	4	2022-04-09 00:58:19.617676+00	2022-04-09 00:58:19.617676+00
127	ecology	4	2022-04-09 00:58:19.618364+00	2022-04-09 00:58:19.618364+00
128	human physiology and anatomy	4	2022-04-09 00:58:19.619068+00	2022-04-09 00:58:19.619068+00
129	evolution and taxonomy	4	2022-04-09 00:58:19.619971+00	2022-04-09 00:58:19.619971+00
130	chemical reactions	5	2022-04-09 00:58:19.620708+00	2022-04-09 00:58:19.620708+00
131	atoms, compounds, and ions	5	2022-04-09 00:58:19.621475+00	2022-04-09 00:58:19.621475+00
132	stoichiometry	5	2022-04-09 00:58:19.622253+00	2022-04-09 00:58:19.622253+00
133	electron structure of atoms	5	2022-04-09 00:58:19.623012+00	2022-04-09 00:58:19.623012+00
134	periodic table	5	2022-04-09 00:58:19.623806+00	2022-04-09 00:58:19.623806+00
135	chemical bonds	5	2022-04-09 00:58:19.624696+00	2022-04-09 00:58:19.624696+00
136	gases	5	2022-04-09 00:58:19.625702+00	2022-04-09 00:58:19.625702+00
137	states of matter and intermolecular forces	5	2022-04-09 00:58:19.626709+00	2022-04-09 00:58:19.626709+00
138	chemical equilibrium	5	2022-04-09 00:58:19.627801+00	2022-04-09 00:58:19.627801+00
139	acids and bases	5	2022-04-09 00:58:19.628837+00	2022-04-09 00:58:19.628837+00
140	buffers, titrations, and solubility equilibria	5	2022-04-09 00:58:19.629616+00	2022-04-09 00:58:19.629616+00
141	thermodynamics	5	2022-04-09 00:58:19.630348+00	2022-04-09 00:58:19.630348+00
142	redox reactions and electrochemistry	5	2022-04-09 00:58:19.631068+00	2022-04-09 00:58:19.631068+00
143	kinetics	5	2022-04-09 00:58:19.631793+00	2022-04-09 00:58:19.631793+00
144	nuclear chemistry	5	2022-04-09 00:58:19.632619+00	2022-04-09 00:58:19.632619+00
145	kinematics	5	2022-04-09 00:58:19.633351+00	2022-04-09 00:58:19.633351+00
146	kinematics	6	2022-04-09 00:58:19.634073+00	2022-04-09 00:58:19.634073+00
147	newton's laws	6	2022-04-09 00:58:19.634725+00	2022-04-09 00:58:19.634725+00
148	rotational mechanics	6	2022-04-09 00:58:19.635489+00	2022-04-09 00:58:19.635489+00
149	work and energy	6	2022-04-09 00:58:19.636134+00	2022-04-09 00:58:19.636134+00
150	momentum and collisions	6	2022-04-09 00:58:19.636798+00	2022-04-09 00:58:19.636798+00
151	thermodynamics	6	2022-04-09 00:58:19.637503+00	2022-04-09 00:58:19.637503+00
152	electrostatics	6	2022-04-09 00:58:19.638212+00	2022-04-09 00:58:19.638212+00
153	magnetism	6	2022-04-09 00:58:19.638898+00	2022-04-09 00:58:19.638898+00
154	waves and sound	6	2022-04-09 00:58:19.639555+00	2022-04-09 00:58:19.639555+00
155	refraction and reflection	6	2022-04-09 00:58:19.640241+00	2022-04-09 00:58:19.640241+00
156	gravity/gen relativity	6	2022-04-09 00:58:19.64089+00	2022-04-09 00:58:19.64089+00
157	Fluids - density and pressure	7	2022-04-09 00:58:19.641613+00	2022-04-09 00:58:19.641613+00
158	Fluids - dynamics	7	2022-04-09 00:58:19.642273+00	2022-04-09 00:58:19.642273+00
159	THD - Ideal Gases	7	2022-04-09 00:58:19.642944+00	2022-04-09 00:58:19.642944+00
160	thermodynamics	7	2022-04-09 00:58:19.643592+00	2022-04-09 00:58:19.643592+00
161	Electric Field	7	2022-04-09 00:58:19.644286+00	2022-04-09 00:58:19.644286+00
162	Electric Potential	7	2022-04-09 00:58:19.645035+00	2022-04-09 00:58:19.645035+00
163	Magnetic Fields	7	2022-04-09 00:58:19.645689+00	2022-04-09 00:58:19.645689+00
164	Magnetic Induction	7	2022-04-09 00:58:19.646366+00	2022-04-09 00:58:19.646366+00
165	Electromagnetic Waves	7	2022-04-09 00:58:19.647015+00	2022-04-09 00:58:19.647015+00
166	Optics - refraction and reflection	7	2022-04-09 00:58:19.647918+00	2022-04-09 00:58:19.647918+00
167	Quantum & Atomic Physics	7	2022-04-09 00:58:19.648892+00	2022-04-09 00:58:19.648892+00
168	dynamics 2	7	2022-04-09 00:58:19.649708+00	2022-04-09 00:58:19.649708+00
169	Electric Circuits	7	2022-04-09 00:58:19.650457+00	2022-04-09 00:58:19.650457+00
170	earth systems and resources	8	2022-04-09 00:58:19.65115+00	2022-04-09 00:58:19.65115+00
171	ecology	8	2022-04-09 00:58:19.651849+00	2022-04-09 00:58:19.651849+00
172	energy resources and consumption	8	2022-04-09 00:58:19.652525+00	2022-04-09 00:58:19.652525+00
173	global change	8	2022-04-09 00:58:19.653229+00	2022-04-09 00:58:19.653229+00
174	impact of human health and environment	8	2022-04-09 00:58:19.653917+00	2022-04-09 00:58:19.653917+00
175	interdependence of organisms	8	2022-04-09 00:58:19.654605+00	2022-04-09 00:58:19.654605+00
176	land and water resources and use	8	2022-04-09 00:58:19.655304+00	2022-04-09 00:58:19.655304+00
177	introduction to environmental science	8	2022-04-09 00:58:19.656012+00	2022-04-09 00:58:19.656012+00
178	natural biogeochemical cycles	8	2022-04-09 00:58:19.656673+00	2022-04-09 00:58:19.656673+00
179	pollution	8	2022-04-09 00:58:19.65734+00	2022-04-09 00:58:19.65734+00
180	populations	8	2022-04-09 00:58:19.658005+00	2022-04-09 00:58:19.658005+00
181	the atmosphere	8	2022-04-09 00:58:19.658681+00	2022-04-09 00:58:19.658681+00
182	upchieve	22	2022-04-09 00:58:19.659424+00	2022-04-09 00:58:19.659424+00
183	linear_equations	12	2022-04-09 00:58:19.660086+00	2022-04-09 00:58:19.660086+00
184	linear_inequalities	12	2022-04-09 00:58:19.660805+00	2022-04-09 00:58:19.660805+00
185	linear_functions	12	2022-04-09 00:58:19.661488+00	2022-04-09 00:58:19.661488+00
186	quadratic_problems	12	2022-04-09 00:58:19.662164+00	2022-04-09 00:58:19.662164+00
187	nonlinear_equations	12	2022-04-09 00:58:19.662979+00	2022-04-09 00:58:19.662979+00
188	rational_expressions	12	2022-04-09 00:58:19.663856+00	2022-04-09 00:58:19.663856+00
189	isolating_quantities	12	2022-04-09 00:58:19.66462+00	2022-04-09 00:58:19.66462+00
190	linear_systems	12	2022-04-09 00:58:19.66536+00	2022-04-09 00:58:19.66536+00
191	ratios_rates	12	2022-04-09 00:58:19.666126+00	2022-04-09 00:58:19.666126+00
192	units	12	2022-04-09 00:58:19.666842+00	2022-04-09 00:58:19.666842+00
193	percentages	12	2022-04-09 00:58:19.667554+00	2022-04-09 00:58:19.667554+00
194	linear_and_exponential	12	2022-04-09 00:58:19.668205+00	2022-04-09 00:58:19.668205+00
195	data_inferences	12	2022-04-09 00:58:19.668885+00	2022-04-09 00:58:19.668885+00
196	volume_word_problems	12	2022-04-09 00:58:19.669892+00	2022-04-09 00:58:19.669892+00
197	complex_numbers	12	2022-04-09 00:58:19.670643+00	2022-04-09 00:58:19.670643+00
198	circle_equations	12	2022-04-09 00:58:19.671395+00	2022-04-09 00:58:19.671395+00
199	table_data	12	2022-04-09 00:58:19.672175+00	2022-04-09 00:58:19.672175+00
200	scatterplots	12	2022-04-09 00:58:19.67307+00	2022-04-09 00:58:19.67307+00
201	graphs	12	2022-04-09 00:58:19.673872+00	2022-04-09 00:58:19.673872+00
202	shape_of_distributions	12	2022-04-09 00:58:19.67456+00	2022-04-09 00:58:19.67456+00
203	right_triangle_problems	12	2022-04-09 00:58:19.675267+00	2022-04-09 00:58:19.675267+00
204	congruence_and_similarity	12	2022-04-09 00:58:19.67593+00	2022-04-09 00:58:19.67593+00
205	explict_v_implicit	13	2022-04-09 00:58:19.676584+00	2022-04-09 00:58:19.676584+00
206	point_of_view	13	2022-04-09 00:58:19.67726+00	2022-04-09 00:58:19.67726+00
207	analyzing_relationships	13	2022-04-09 00:58:19.677925+00	2022-04-09 00:58:19.677925+00
208	citing_evidence	13	2022-04-09 00:58:19.678589+00	2022-04-09 00:58:19.678589+00
209	summarizing	13	2022-04-09 00:58:19.679261+00	2022-04-09 00:58:19.679261+00
210	analogical_reasoning	13	2022-04-09 00:58:19.67995+00	2022-04-09 00:58:19.67995+00
211	structure_passage	13	2022-04-09 00:58:19.680607+00	2022-04-09 00:58:19.680607+00
212	word_choice	13	2022-04-09 00:58:19.681279+00	2022-04-09 00:58:19.681279+00
213	graphs_and_data	13	2022-04-09 00:58:19.681947+00	2022-04-09 00:58:19.681947+00
214	purpose_of_text	13	2022-04-09 00:58:19.682658+00	2022-04-09 00:58:19.682658+00
215	analyzing_arguments	13	2022-04-09 00:58:19.68481+00	2022-04-09 00:58:19.68481+00
216	connecting_texts	13	2022-04-09 00:58:19.685623+00	2022-04-09 00:58:19.685623+00
217	history_passages	13	2022-04-09 00:58:19.686358+00	2022-04-09 00:58:19.686358+00
218	strategies	13	2022-04-09 00:58:19.687095+00	2022-04-09 00:58:19.687095+00
219	types_of_essays	15	2022-04-09 00:58:19.687858+00	2022-04-09 00:58:19.687858+00
220	essay_structure	15	2022-04-09 00:58:19.688601+00	2022-04-09 00:58:19.688601+00
221	point_of_view	15	2022-04-09 00:58:19.689322+00	2022-04-09 00:58:19.689322+00
222	persuasive_techniques	15	2022-04-09 00:58:19.690087+00	2022-04-09 00:58:19.690087+00
223	citations	15	2022-04-09 00:58:19.690876+00	2022-04-09 00:58:19.690876+00
224	independent_and_dependent_clauses	15	2022-04-09 00:58:19.691629+00	2022-04-09 00:58:19.691629+00
225	punctuation	15	2022-04-09 00:58:19.69233+00	2022-04-09 00:58:19.69233+00
226	verb_tense	15	2022-04-09 00:58:19.693139+00	2022-04-09 00:58:19.693139+00
227	subject_verb_agreement	15	2022-04-09 00:58:19.693861+00	2022-04-09 00:58:19.693861+00
228	specificity_and_coherence	15	2022-04-09 00:58:19.694598+00	2022-04-09 00:58:19.694598+00
229	plagiarism	15	2022-04-09 00:58:19.695398+00	2022-04-09 00:58:19.695398+00
230	nonnvarying_sentence_length	15	2022-04-09 00:58:19.696204+00	2022-04-09 00:58:19.696204+00
231	wordiness	15	2022-04-09 00:58:19.696947+00	2022-04-09 00:58:19.696947+00
232	grammatical_errors	15	2022-04-09 00:58:19.697629+00	2022-04-09 00:58:19.697629+00
233	common_requests	15	2022-04-09 00:58:19.698349+00	2022-04-09 00:58:19.698349+00
234	inference	13	2022-04-09 00:58:19.699029+00	2022-04-09 00:58:19.699029+00
235	integumentary	24	2022-04-09 00:58:19.69974+00	2022-04-09 00:58:19.69974+00
236	little_detail	13	2022-04-09 00:58:19.700399+00	2022-04-09 00:58:19.700399+00
237	lymphatic	24	2022-04-09 00:58:19.701426+00	2022-04-09 00:58:19.701426+00
238	muscular	24	2022-04-09 00:58:19.702225+00	2022-04-09 00:58:19.702225+00
239	nervous	24	2022-04-09 00:58:19.702984+00	2022-04-09 00:58:19.702984+00
240	probingqs	23	2022-04-09 00:58:19.7037+00	2022-04-09 00:58:19.7037+00
241	questions	23	2022-04-09 00:58:19.704391+00	2022-04-09 00:58:19.704391+00
242	reproductive	24	2022-04-09 00:58:19.70504+00	2022-04-09 00:58:19.70504+00
243	respiratory	24	2022-04-09 00:58:19.705791+00	2022-04-09 00:58:19.705791+00
244	sense_organs	24	2022-04-09 00:58:19.706458+00	2022-04-09 00:58:19.706458+00
245	skeletal	24	2022-04-09 00:58:19.707165+00	2022-04-09 00:58:19.707165+00
246	texttype	23	2022-04-09 00:58:19.707856+00	2022-04-09 00:58:19.707856+00
247	tissues	24	2022-04-09 00:58:19.708497+00	2022-04-09 00:58:19.708497+00
248	urinary	24	2022-04-09 00:58:19.709159+00	2022-04-09 00:58:19.709159+00
249	vocab_in_context	13	2022-04-09 00:58:19.709829+00	2022-04-09 00:58:19.709829+00
250	vocabulary	23	2022-04-09 00:58:19.710517+00	2022-04-09 00:58:19.710517+00
251	activatebk	23	2022-04-09 00:58:19.711258+00	2022-04-09 00:58:19.711258+00
252	author_technique	13	2022-04-09 00:58:19.711919+00	2022-04-09 00:58:19.711919+00
253	backgroundknowledge	23	2022-04-09 00:58:19.712568+00	2022-04-09 00:58:19.712568+00
254	big_picture	13	2022-04-09 00:58:19.713239+00	2022-04-09 00:58:19.713239+00
255	cells	24	2022-04-09 00:58:19.714173+00	2022-04-09 00:58:19.714173+00
256	circulatory_system	24	2022-04-09 00:58:19.714988+00	2022-04-09 00:58:19.714988+00
257	comprehensionsupport	23	2022-04-09 00:58:19.7157+00	2022-04-09 00:58:19.7157+00
258	context	23	2022-04-09 00:58:19.716574+00	2022-04-09 00:58:19.716574+00
259	corrections	23	2022-04-09 00:58:19.717323+00	2022-04-09 00:58:19.717323+00
260	digestive	24	2022-04-09 00:58:19.718007+00	2022-04-09 00:58:19.718007+00
261	editing	23	2022-04-09 00:58:19.718749+00	2022-04-09 00:58:19.718749+00
262	endocrine	24	2022-04-09 00:58:19.719418+00	2022-04-09 00:58:19.719418+00
263	evidence_support	13	2022-04-09 00:58:19.720072+00	2022-04-09 00:58:19.720072+00
264	function	13	2022-04-09 00:58:19.720774+00	2022-04-09 00:58:19.720774+00
265	strategies	12	2022-04-09 00:58:19.721456+00	2022-04-09 00:58:19.721456+00
266	unit circle	18	2022-04-09 00:58:19.722132+00	2022-04-09 00:58:19.722132+00
267	dynamics 1	6	2022-04-09 00:58:19.722814+00	2022-04-09 00:58:19.722814+00
268	energy 1	6	2022-04-09 00:58:19.723464+00	2022-04-09 00:58:19.723464+00
269	dynamics 2	6	2022-04-09 00:58:19.724125+00	2022-04-09 00:58:19.724125+00
270	energy 2	6	2022-04-09 00:58:19.724796+00	2022-04-09 00:58:19.724796+00
271	pythagorean theorem	18	2022-04-09 00:58:19.726649+00	2022-04-09 00:58:19.726649+00
272	degrees and radians	18	2022-04-09 00:58:19.727776+00	2022-04-09 00:58:19.727776+00
273	graphing trig functions	18	2022-04-09 00:58:19.728579+00	2022-04-09 00:58:19.728579+00
274	inverse trig functions	18	2022-04-09 00:58:19.729255+00	2022-04-09 00:58:19.729255+00
275	trigonometric identities	18	2022-04-09 00:58:19.729948+00	2022-04-09 00:58:19.729948+00
276	complex numbers	19	2022-04-09 00:58:19.730623+00	2022-04-09 00:58:19.730623+00
277	conic sections	19	2022-04-09 00:58:19.731329+00	2022-04-09 00:58:19.731329+00
278	graphing exponential functions	19	2022-04-09 00:58:19.731978+00	2022-04-09 00:58:19.731978+00
279	graphing polynomials	19	2022-04-09 00:58:19.73262+00	2022-04-09 00:58:19.73262+00
280	graphing rational functions	19	2022-04-09 00:58:19.733285+00	2022-04-09 00:58:19.733285+00
281	logarithms	19	2022-04-09 00:58:19.733941+00	2022-04-09 00:58:19.733941+00
282	inverse functions	19	2022-04-09 00:58:19.734612+00	2022-04-09 00:58:19.734612+00
283	polynomial division	19	2022-04-09 00:58:19.73523+00	2022-04-09 00:58:19.73523+00
284	rational expressions	19	2022-04-09 00:58:19.735894+00	2022-04-09 00:58:19.735894+00
285	sequences series	19	2022-04-09 00:58:19.736586+00	2022-04-09 00:58:19.736586+00
286	exponential logarithmic equations	19	2022-04-09 00:58:19.737335+00	2022-04-09 00:58:19.737335+00
287	other equations	19	2022-04-09 00:58:19.738024+00	2022-04-09 00:58:19.738024+00
288	quadratic and absolute	19	2022-04-09 00:58:19.738662+00	2022-04-09 00:58:19.738662+00
289	solving quadratic equations	19	2022-04-09 00:58:19.739323+00	2022-04-09 00:58:19.739323+00
290	transformations functions	19	2022-04-09 00:58:19.739985+00	2022-04-09 00:58:19.739985+00
291	vectors	19	2022-04-09 00:58:19.740714+00	2022-04-09 00:58:19.740714+00
292	trig functions	18	2022-04-09 00:58:19.741371+00	2022-04-09 00:58:19.741371+00
293	random variables and distributions	2	2022-04-09 00:58:19.742004+00	2022-04-09 00:58:19.742004+00
294	kinematics 2	6	2022-04-09 00:58:19.742673+00	2022-04-09 00:58:19.742673+00
295	DC Circuits	6	2022-04-09 00:58:19.743364+00	2022-04-09 00:58:19.743364+00
296	rotational motion	6	2022-04-09 00:58:19.744+00	2022-04-09 00:58:19.744+00
297	polynomials	12	2022-04-09 00:58:19.744859+00	2022-04-09 00:58:19.744859+00
298	functions	12	2022-04-09 00:58:19.745574+00	2022-04-09 00:58:19.745574+00
299	angles	12	2022-04-09 00:58:19.746277+00	2022-04-09 00:58:19.746277+00
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_questions (id, question_text, possible_answers, correct_answer, quiz_subcategory_id, image_source, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: report_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.report_reasons (id, reason, created_at, updated_at) FROM stdin;
1	This student was extremely rude or inappropriate	2022-04-09 00:58:19.824596+00	2022-04-09 00:58:19.824596+00
2	I am worried for the immediate safety of this student	2022-04-09 00:58:19.825805+00	2022-04-09 00:58:19.825805+00
3	LEGACY: Student was unresponsive	2022-04-09 00:58:19.826845+00	2022-04-09 00:58:19.826845+00
4	LEGACY: Technical issue	2022-04-09 00:58:19.827878+00	2022-04-09 00:58:19.827878+00
5	LEGACY: Other	2022-04-09 00:58:19.828946+00	2022-04-09 00:58:19.828946+00
\.


--
-- Data for Name: required_email_domains; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) FROM stdin;
01800bd4-39d2-d908-a9c1-03531eea0a3c	placeholder1.com	01800bd4-39d0-0cd7-28b3-3d9df0130564	2022-04-09 00:58:19.474725+00	2022-04-09 00:58:19.474725+00
\.


--
-- Data for Name: school_nces_metadata; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.school_nces_metadata (school_id, created_at, updated_at, school_year, fipst, statename, st, sch_name, lea_name, state_agency_no, "union", st_leaid, leaid, st_schid, ncessch, schid, mstreet1, mstreet2, mstreet3, mcity, mstate, mzip, mzip4, lstreet1, lstreet2, lstreet3, lcity, lzip, lzip4, phone, website, sy_status, sy_status_text, updated_status, updated_status_text, effective_date, sch_type, sch_type_text, recon_status, out_of_state_flag, charter_text, chartauth1, chartauthn1, chartauth2, chartauthn2, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, igoffered) FROM stdin;
\.


--
-- Data for Name: schools_sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_failed_joins; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_failed_joins (session_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_flags (id, name, created_at, updated_at) FROM stdin;
1	Absent student	2022-04-09 00:58:19.816513+00	2022-04-09 00:58:19.816513+00
2	Absent volunteer	2022-04-09 00:58:19.817422+00	2022-04-09 00:58:19.817422+00
3	Low session rating from coach	2022-04-09 00:58:19.818098+00	2022-04-09 00:58:19.818098+00
4	Low session rating from student	2022-04-09 00:58:19.818824+00	2022-04-09 00:58:19.818824+00
5	Low coach rating from student	2022-04-09 00:58:19.819476+00	2022-04-09 00:58:19.819476+00
6	Reported	2022-04-09 00:58:19.820143+00	2022-04-09 00:58:19.820143+00
7	Only looking for answers	2022-04-09 00:58:19.820744+00	2022-04-09 00:58:19.820744+00
8	Rude or inappropriate	2022-04-09 00:58:19.821365+00	2022-04-09 00:58:19.821365+00
9	Comment from student	2022-04-09 00:58:19.821943+00	2022-04-09 00:58:19.821943+00
10	Comment from volunteer	2022-04-09 00:58:19.822661+00	2022-04-09 00:58:19.822661+00
11	Has been unmatched	2022-04-09 00:58:19.823284+00	2022-04-09 00:58:19.823284+00
12	Has had technical issues	2022-04-09 00:58:19.823898+00	2022-04-09 00:58:19.823898+00
\.


--
-- Data for Name: session_messages; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_messages (id, sender_id, contents, session_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: session_photos; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_photos (session_id, photo_key, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_reports; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_review_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_review_reasons (session_id, session_flag_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions_session_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sessions_session_flags (session_id, session_flag_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_favorite_volunteers; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_favorite_volunteers (student_id, volunteer_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_org_sites; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) FROM stdin;
01800bd4-39cd-e178-454e-70e3ba4f2be9	placeholder1	01800bd4-39cb-3b93-8e22-c5f88fcb6584	2022-04-09 00:58:19.470548+00	2022-04-09 00:58:19.470548+00
01800bd4-39cd-2716-5960-846f7d5f5985	placeholder2	01800bd4-39cb-1b16-3644-6b08fc527154	2022-04-09 00:58:19.471478+00	2022-04-09 00:58:19.471478+00
01800bd4-39cd-34d4-6a8b-2145a6acd2e1	placeholder3	01800bd4-39cb-cac4-1cdc-537253172955	2022-04-09 00:58:19.472286+00	2022-04-09 00:58:19.472286+00
\.


--
-- Data for Name: student_partner_orgs_sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs_sponsor_orgs (student_partner_org_id, sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_profiles (user_id, college, school_id, postal_code, grade_level_id, student_partner_org_user_id, student_partner_org_id, student_partner_org_site_id, created_at, updated_at) FROM stdin;
01800bd4-7954-f7fa-cc01-ccddf7ec9621	\N	01800bd4-790a-9289-1e3d-ea6e5ff24779	\N	\N	\N	\N	\N	2022-04-09 00:58:35.735733+00	2022-04-09 00:58:35.735733+00
01800bd4-7954-79e2-4b85-a7a305a334b5	\N	01800bd4-790a-9289-1e3d-ea6e5ff24779	\N	\N	\N	\N	\N	2022-04-09 00:58:35.736745+00	2022-04-09 00:58:35.736745+00
01800bd4-7954-50a7-fef9-47d7aa1fd2f7	\N	\N	\N	\N	\N	\N	\N	2022-04-09 00:58:35.737566+00	2022-04-09 00:58:35.737566+00
\.


--
-- Data for Name: training_courses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.training_courses (id, name, created_at, updated_at) FROM stdin;
1	upchieve101	2022-04-09 00:58:19.478549+00	2022-04-09 00:58:19.478549+00
\.


--
-- Data for Name: user_actions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_actions (id, user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, quiz_subcategory, quiz_category, created_at, updated_at, mongo_id, reference_email, volunteer_id, ban_reason) FROM stdin;
\.


--
-- Data for Name: user_product_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_product_flags (user_id, sent_ready_to_coach_email, sent_hour_summary_intro_email, sent_inactive_thirty_day_email, sent_inactive_sixty_day_email, sent_inactive_ninety_day_email, gates_qualified, created_at, updated_at, in_gates_study) FROM stdin;
\.


--
-- Data for Name: user_session_metrics; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_session_metrics (user_id, absent_student, absent_volunteer, low_session_rating_from_coach, low_session_rating_from_student, low_coach_rating_from_student, reported, only_looking_for_answers, rude_or_inappropriate, comment_from_student, comment_from_volunteer, has_been_unmatched, has_had_technical_issues, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_certifications; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_certifications (user_id, certification_id, created_at, updated_at) FROM stdin;
01800bd4-7916-0bf5-5b98-59cd1d380198	1	2022-04-09 00:58:35.684654+00	2022-04-09 00:58:35.684654+00
01800bd4-7916-0bf5-5b98-59cd1d380198	16	2022-04-09 00:58:35.685808+00	2022-04-09 00:58:35.685808+00
01800bd4-7916-0bf5-5b98-59cd1d380198	17	2022-04-09 00:58:35.686671+00	2022-04-09 00:58:35.686671+00
01800bd4-7916-0bf5-5b98-59cd1d380198	11	2022-04-09 00:58:35.687507+00	2022-04-09 00:58:35.687507+00
01800bd4-7916-0bf5-5b98-59cd1d380198	4	2022-04-09 00:58:35.688447+00	2022-04-09 00:58:35.688447+00
01800bd4-7916-0bf5-5b98-59cd1d380198	20	2022-04-09 00:58:35.689241+00	2022-04-09 00:58:35.689241+00
01800bd4-7916-0bf5-5b98-59cd1d380198	5	2022-04-09 00:58:35.690105+00	2022-04-09 00:58:35.690105+00
01800bd4-7916-0bf5-5b98-59cd1d380198	9	2022-04-09 00:58:35.690978+00	2022-04-09 00:58:35.690978+00
01800bd4-7916-0bf5-5b98-59cd1d380198	3	2022-04-09 00:58:35.691999+00	2022-04-09 00:58:35.691999+00
01800bd4-7916-0bf5-5b98-59cd1d380198	6	2022-04-09 00:58:35.692812+00	2022-04-09 00:58:35.692812+00
01800bd4-7916-0bf5-5b98-59cd1d380198	19	2022-04-09 00:58:35.693731+00	2022-04-09 00:58:35.693731+00
01800bd4-7916-0bf5-5b98-59cd1d380198	18	2022-04-09 00:58:35.694691+00	2022-04-09 00:58:35.694691+00
01800bd4-7916-0bf5-5b98-59cd1d380198	15	2022-04-09 00:58:35.695518+00	2022-04-09 00:58:35.695518+00
01800bd4-7916-a118-4d46-88cf82be5574	1	2022-04-09 00:58:35.696323+00	2022-04-09 00:58:35.696323+00
01800bd4-7916-a118-4d46-88cf82be5574	16	2022-04-09 00:58:35.697164+00	2022-04-09 00:58:35.697164+00
01800bd4-7916-a118-4d46-88cf82be5574	17	2022-04-09 00:58:35.697933+00	2022-04-09 00:58:35.697933+00
01800bd4-7916-a118-4d46-88cf82be5574	10	2022-04-09 00:58:35.69869+00	2022-04-09 00:58:35.69869+00
01800bd4-7916-a118-4d46-88cf82be5574	4	2022-04-09 00:58:35.699476+00	2022-04-09 00:58:35.699476+00
01800bd4-7916-a118-4d46-88cf82be5574	20	2022-04-09 00:58:35.700361+00	2022-04-09 00:58:35.700361+00
01800bd4-7916-a118-4d46-88cf82be5574	5	2022-04-09 00:58:35.701156+00	2022-04-09 00:58:35.701156+00
01800bd4-7916-a118-4d46-88cf82be5574	9	2022-04-09 00:58:35.701944+00	2022-04-09 00:58:35.701944+00
01800bd4-7916-a118-4d46-88cf82be5574	3	2022-04-09 00:58:35.702716+00	2022-04-09 00:58:35.702716+00
01800bd4-7916-a118-4d46-88cf82be5574	6	2022-04-09 00:58:35.703498+00	2022-04-09 00:58:35.703498+00
01800bd4-7916-a118-4d46-88cf82be5574	11	2022-04-09 00:58:35.704257+00	2022-04-09 00:58:35.704257+00
01800bd4-7916-a118-4d46-88cf82be5574	19	2022-04-09 00:58:35.705037+00	2022-04-09 00:58:35.705037+00
01800bd4-7916-a118-4d46-88cf82be5574	18	2022-04-09 00:58:35.705802+00	2022-04-09 00:58:35.705802+00
\.


--
-- Data for Name: users_ip_addresses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_ip_addresses (id, ip_address_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_quizzes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_quizzes (user_id, quiz_id, attempts, passed, created_at, updated_at) FROM stdin;
01800bd4-7916-0bf5-5b98-59cd1d380198	1	0	f	2022-04-09 00:58:35.706594+00	2022-04-09 00:58:35.706594+00
01800bd4-7916-0bf5-5b98-59cd1d380198	16	0	f	2022-04-09 00:58:35.70764+00	2022-04-09 00:58:35.70764+00
01800bd4-7916-0bf5-5b98-59cd1d380198	17	0	f	2022-04-09 00:58:35.70871+00	2022-04-09 00:58:35.70871+00
01800bd4-7916-0bf5-5b98-59cd1d380198	10	0	f	2022-04-09 00:58:35.709604+00	2022-04-09 00:58:35.709604+00
01800bd4-7916-0bf5-5b98-59cd1d380198	4	0	f	2022-04-09 00:58:35.710502+00	2022-04-09 00:58:35.710502+00
01800bd4-7916-0bf5-5b98-59cd1d380198	20	0	f	2022-04-09 00:58:35.711378+00	2022-04-09 00:58:35.711378+00
01800bd4-7916-0bf5-5b98-59cd1d380198	5	0	f	2022-04-09 00:58:35.712221+00	2022-04-09 00:58:35.712221+00
01800bd4-7916-0bf5-5b98-59cd1d380198	9	0	f	2022-04-09 00:58:35.713062+00	2022-04-09 00:58:35.713062+00
01800bd4-7916-0bf5-5b98-59cd1d380198	3	0	f	2022-04-09 00:58:35.713827+00	2022-04-09 00:58:35.713827+00
01800bd4-7916-0bf5-5b98-59cd1d380198	6	0	f	2022-04-09 00:58:35.714698+00	2022-04-09 00:58:35.714698+00
01800bd4-7916-0bf5-5b98-59cd1d380198	11	0	f	2022-04-09 00:58:35.715475+00	2022-04-09 00:58:35.715475+00
01800bd4-7916-0bf5-5b98-59cd1d380198	19	0	f	2022-04-09 00:58:35.716305+00	2022-04-09 00:58:35.716305+00
01800bd4-7916-0bf5-5b98-59cd1d380198	18	0	f	2022-04-09 00:58:35.717155+00	2022-04-09 00:58:35.717155+00
01800bd4-7916-0bf5-5b98-59cd1d380198	15	0	f	2022-04-09 00:58:35.718001+00	2022-04-09 00:58:35.718001+00
01800bd4-7916-a118-4d46-88cf82be5574	1	0	f	2022-04-09 00:58:35.71879+00	2022-04-09 00:58:35.71879+00
01800bd4-7916-a118-4d46-88cf82be5574	16	0	f	2022-04-09 00:58:35.719645+00	2022-04-09 00:58:35.719645+00
01800bd4-7916-a118-4d46-88cf82be5574	17	0	f	2022-04-09 00:58:35.720456+00	2022-04-09 00:58:35.720456+00
01800bd4-7916-a118-4d46-88cf82be5574	10	0	f	2022-04-09 00:58:35.721277+00	2022-04-09 00:58:35.721277+00
01800bd4-7916-a118-4d46-88cf82be5574	4	0	f	2022-04-09 00:58:35.722098+00	2022-04-09 00:58:35.722098+00
01800bd4-7916-a118-4d46-88cf82be5574	20	0	f	2022-04-09 00:58:35.722896+00	2022-04-09 00:58:35.722896+00
01800bd4-7916-a118-4d46-88cf82be5574	5	0	f	2022-04-09 00:58:35.723713+00	2022-04-09 00:58:35.723713+00
01800bd4-7916-a118-4d46-88cf82be5574	9	0	f	2022-04-09 00:58:35.724528+00	2022-04-09 00:58:35.724528+00
01800bd4-7916-a118-4d46-88cf82be5574	3	0	f	2022-04-09 00:58:35.725402+00	2022-04-09 00:58:35.725402+00
01800bd4-7916-a118-4d46-88cf82be5574	6	0	f	2022-04-09 00:58:35.726173+00	2022-04-09 00:58:35.726173+00
01800bd4-7916-a118-4d46-88cf82be5574	11	0	f	2022-04-09 00:58:35.727092+00	2022-04-09 00:58:35.727092+00
01800bd4-7916-a118-4d46-88cf82be5574	19	0	f	2022-04-09 00:58:35.727903+00	2022-04-09 00:58:35.727903+00
01800bd4-7916-a118-4d46-88cf82be5574	18	0	f	2022-04-09 00:58:35.72875+00	2022-04-09 00:58:35.72875+00
\.


--
-- Data for Name: users_roles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_roles (user_id, role_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_training_courses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users_training_courses (user_id, training_course_id, complete, progress, completed_materials, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: volunteer_occupations; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_occupations (user_id, occupation, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: volunteer_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_profiles (user_id, volunteer_partner_org_id, timezone, approved, onboarded, photo_id_s3_key, photo_id_status, linkedin_url, college, company, languages, experience, city, state, country, created_at, updated_at, total_volunteer_hours, elapsed_availability) FROM stdin;
01800bd4-7916-0bf5-5b98-59cd1d380198	\N	America/New_York	t	t	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-09 00:58:35.680707+00	2022-04-09 00:58:35.680707+00	\N	\N
01800bd4-7916-a118-4d46-88cf82be5574	\N	America/New_York	t	f	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-09 00:58:35.681929+00	2022-04-09 00:58:35.681929+00	\N	\N
01800bd4-7916-39ab-6291-c9cb7290e101	\N	America/New_York	f	f	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-09 00:58:35.682814+00	2022-04-09 00:58:35.682814+00	\N	\N
01800bd4-7916-fd27-7a1a-3f97bb06bc8a	\N	America/New_York	f	f	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-09 00:58:35.683724+00	2022-04-09 00:58:35.683724+00	\N	\N
\.


--
-- Data for Name: volunteer_reference_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_reference_statuses (id, name, created_at, updated_at) FROM stdin;
1	sent	2022-04-09 00:58:19.479426+00	2022-04-09 00:58:19.479426+00
2	submitted	2022-04-09 00:58:19.480263+00	2022-04-09 00:58:19.480263+00
3	approved	2022-04-09 00:58:19.480932+00	2022-04-09 00:58:19.480932+00
4	rejected	2022-04-09 00:58:19.481603+00	2022-04-09 00:58:19.481603+00
5	removed	2022-04-09 00:58:19.482259+00	2022-04-09 00:58:19.482259+00
6	unsent	2022-04-09 00:58:19.482941+00	2022-04-09 00:58:19.482941+00
\.


--
-- Data for Name: volunteer_references; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_references (id, user_id, first_name, last_name, email, status_id, sent_at, affiliation, relationship_length, patient, positive_role_model, agreeable_and_approachable, communicates_effectively, rejection_reason, additional_info, created_at, updated_at, trustworthy_with_children) FROM stdin;
\.


--
-- Name: ban_reasons_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.ban_reasons_id_seq', 5, true);


--
-- Name: certifications_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.certifications_id_seq', 21, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.cities_id_seq', 1, false);


--
-- Name: grade_levels_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.grade_levels_id_seq', 6, true);


--
-- Name: ip_addresses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.ip_addresses_id_seq', 1, false);


--
-- Name: notification_methods_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_methods_id_seq', 4, true);


--
-- Name: notification_priority_groups_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_priority_groups_id_seq', 16, true);


--
-- Name: notification_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_types_id_seq', 2, true);


--
-- Name: photo_id_statuses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.photo_id_statuses_id_seq', 4, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_questions_id_seq', 1, false);


--
-- Name: quiz_subcategories_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_subcategories_id_seq', 299, true);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quizzes_id_seq', 24, true);


--
-- Name: report_reasons_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.report_reasons_id_seq', 5, true);


--
-- Name: session_flags_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.session_flags_id_seq', 12, true);


--
-- Name: signup_sources_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.signup_sources_id_seq', 6, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.subjects_id_seq', 24, true);


--
-- Name: tool_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.tool_types_id_seq', 2, true);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.topics_id_seq', 5, true);


--
-- Name: training_courses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.training_courses_id_seq', 1, true);


--
-- Name: user_actions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.user_actions_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.user_roles_id_seq', 3, true);


--
-- Name: volunteer_reference_statuses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.volunteer_reference_statuses_id_seq', 6, true);


--
-- Name: weekdays_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.weekdays_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

