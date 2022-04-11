--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2 (Debian 14.2-1.pgdg110+1)
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
1	non us signup	2022-04-11 22:45:53.898264+00	2022-04-11 22:45:53.898264+00
2	session reported	2022-04-11 22:45:53.89936+00	2022-04-11 22:45:53.89936+00
3	used banned ip	2022-04-11 22:45:53.900227+00	2022-04-11 22:45:53.900227+00
4	admin	2022-04-11 22:45:53.901198+00	2022-04-11 22:45:53.901198+00
5	banned service provider	2022-04-11 22:45:53.90207+00	2022-04-11 22:45:53.90207+00
\.


--
-- Data for Name: signup_sources; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.signup_sources (id, name, created_at, updated_at) FROM stdin;
1	Web search	2022-04-11 22:45:53.902985+00	2022-04-11 22:45:53.902985+00
2	Social media	2022-04-11 22:45:53.904047+00	2022-04-11 22:45:53.904047+00
3	Friend / Classmate	2022-04-11 22:45:53.905101+00	2022-04-11 22:45:53.905101+00
4	School / Teacher	2022-04-11 22:45:53.906094+00	2022-04-11 22:45:53.906094+00
5	Parent / Relative	2022-04-11 22:45:53.906973+00	2022-04-11 22:45:53.906973+00
6	Other	2022-04-11 22:45:53.908+00	2022-04-11 22:45:53.908+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users (id, verified, email_verified, phone_verified, email, password, password_reset_token, first_name, last_name, deactivated, last_activity_at, referral_code, referred_by, test_user, banned, ban_reason_id, time_tutored, signup_source_id, created_at, updated_at, phone, mongo_id) FROM stdin;
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	t	f	f	volunteer1@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Partner	UPchieve	f	\N	B	\N	f	f	\N	25200000	\N	2022-04-11 22:45:59.584866+00	2022-04-11 22:45:59.584866+00	+12125551212	\N
01801ace-269f-3154-7703-1c7ceda68b2b	t	f	f	volunteer2@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Special Reporting	UPchieve	f	\N	C	\N	f	f	\N	25200000	\N	2022-04-11 22:45:59.58707+00	2022-04-11 22:45:59.58707+00	+12125551213	\N
01801ace-269f-7c70-8f18-0f380e0034ce	t	f	f	volunteer3@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Open Sign Up	UPchieve	f	\N	D	\N	f	f	\N	25200000	\N	2022-04-11 22:45:59.588231+00	2022-04-11 22:45:59.588231+00	+12125551214	\N
01801ace-269f-7470-b42f-cf64351b4f2c	t	f	f	volunteer4@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Needs Onboarding	UPchieve	f	\N	E	\N	f	f	\N	0	\N	2022-04-11 22:45:59.589537+00	2022-04-11 22:45:59.589537+00	+12125551215	\N
01801ace-269f-acf7-3c9a-43f3785160ea	t	f	f	volunteer5@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Needs Approval	UPchieve	f	\N	Z	\N	f	f	\N	0	\N	2022-04-11 22:45:59.590653+00	2022-04-11 22:45:59.590653+00	+12125551216	\N
01801ace-269f-00dc-79eb-17d6f0e20d79	t	f	f	volunteer6@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Admin	UPchieve	f	\N	Y	\N	f	f	\N	0	\N	2022-04-11 22:45:59.591888+00	2022-04-11 22:45:59.591888+00	+12125551217	\N
01801ace-26f9-92ec-4af7-b187ae7ba48a	t	f	f	student1@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Student	UPchieve	f	\N	A	\N	f	f	\N	\N	\N	2022-04-11 22:45:59.674649+00	2022-04-11 22:45:59.674649+00	\N	\N
01801ace-26f9-e8b6-e1a8-12324d4d4f83	t	f	f	student2@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Student	UPchieve	f	\N	F	\N	f	f	\N	\N	\N	2022-04-11 22:45:59.675825+00	2022-04-11 22:45:59.675825+00	\N	\N
01801ace-26f9-4f95-a152-932bc34f93c3	t	f	f	student3@upchieve.org	$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y	\N	Student	UPchieve	f	\N	G	\N	f	f	\N	\N	\N	2022-04-11 22:45:59.676853+00	2022-04-11 22:45:59.676853+00	\N	\N
\.


--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.admin_profiles (user_id, created_at, updated_at) FROM stdin;
01801ace-269f-00dc-79eb-17d6f0e20d79	2022-04-11 22:45:59.673275+00	2022-04-11 22:45:59.673275+00
\.


--
-- Data for Name: tool_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.tool_types (id, name, created_at, updated_at) FROM stdin;
1	whiteboard	2022-04-11 22:45:53.942879+00	2022-04-11 22:45:53.942879+00
2	documenteditor	2022-04-11 22:45:53.944196+00	2022-04-11 22:45:53.944196+00
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.topics (id, name, icon_link, color, dashboard_order, display_name, created_at, updated_at) FROM stdin;
1	math	\N	\N	1	Math	2022-04-11 22:45:53.937943+00	2022-04-11 22:45:53.937943+00
2	science	\N	\N	4	Science	2022-04-11 22:45:53.939162+00	2022-04-11 22:45:53.939162+00
3	college	\N	\N	3	College Counseling	2022-04-11 22:45:53.940112+00	2022-04-11 22:45:53.940112+00
4	sat	\N	\N	2	Standardized Testing	2022-04-11 22:45:53.941028+00	2022-04-11 22:45:53.941028+00
5	readingWriting	\N	\N	5	Reading and Writing	2022-04-11 22:45:53.941958+00	2022-04-11 22:45:53.941958+00
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.subjects (id, name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at) FROM stdin;
1	prealgebra	Prealgebra	1	1	1	2022-04-11 22:45:53.945323+00	2022-04-11 22:45:53.945323+00
2	algebraOne	Algebra 1	2	1	1	2022-04-11 22:45:53.946867+00	2022-04-11 22:45:53.946867+00
3	algebraTwo	Algebra 2	3	1	1	2022-04-11 22:45:53.948323+00	2022-04-11 22:45:53.948323+00
4	geometry	Geometry	4	1	1	2022-04-11 22:45:53.949536+00	2022-04-11 22:45:53.949536+00
5	trigonometry	Trigonometry	5	1	1	2022-04-11 22:45:53.950634+00	2022-04-11 22:45:53.950634+00
6	precalculus	Precalculus	6	1	1	2022-04-11 22:45:53.951689+00	2022-04-11 22:45:53.951689+00
7	calculusAB	Calculus AB	7	1	1	2022-04-11 22:45:53.952713+00	2022-04-11 22:45:53.952713+00
8	calculusBC	Calculus BC	8	1	1	2022-04-11 22:45:53.953754+00	2022-04-11 22:45:53.953754+00
9	statistics	Statistics	9	1	1	2022-04-11 22:45:53.954884+00	2022-04-11 22:45:53.954884+00
10	biology	Biology	1	2	1	2022-04-11 22:45:53.956047+00	2022-04-11 22:45:53.956047+00
11	chemistry	Chemistry	2	2	1	2022-04-11 22:45:53.957047+00	2022-04-11 22:45:53.957047+00
12	physicsOne	Physics 1	3	2	1	2022-04-11 22:45:53.959664+00	2022-04-11 22:45:53.959664+00
13	physicsTwo	Physics 2	4	2	1	2022-04-11 22:45:53.960782+00	2022-04-11 22:45:53.960782+00
14	environmentalScience	Environmental Science	5	2	1	2022-04-11 22:45:53.961774+00	2022-04-11 22:45:53.961774+00
15	satMath	SAT Math	1	4	1	2022-04-11 22:45:53.962801+00	2022-04-11 22:45:53.962801+00
16	satReading	SAT Reading	2	4	2	2022-04-11 22:45:53.963825+00	2022-04-11 22:45:53.963825+00
17	essays	College Essays	2	3	2	2022-04-11 22:45:53.964806+00	2022-04-11 22:45:53.964806+00
18	planning	Planning	1	3	2	2022-04-11 22:45:53.965846+00	2022-04-11 22:45:53.965846+00
19	applications	Applications	3	3	2	2022-04-11 22:45:53.966768+00	2022-04-11 22:45:53.966768+00
20	humanitiesEssays	Humanities Essays	1	5	2	2022-04-11 22:45:53.967691+00	2022-04-11 22:45:53.967691+00
21	integratedMathOne	Integrated Math One	9	1	1	2022-04-11 22:45:53.968639+00	2022-04-11 22:45:53.968639+00
22	integratedMathTwo	Integrated Math Two	9	1	1	2022-04-11 22:45:53.969789+00	2022-04-11 22:45:53.969789+00
23	integratedMathThree	Integrated Math Three	9	1	1	2022-04-11 22:45:53.970803+00	2022-04-11 22:45:53.970803+00
24	integratedMathFour	Integrated Math Four	9	1	1	2022-04-11 22:45:53.971747+00	2022-04-11 22:45:53.971747+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_roles (id, name, created_at, updated_at) FROM stdin;
1	student	2022-04-11 22:45:53.89501+00	2022-04-11 22:45:53.89501+00
2	volunteer	2022-04-11 22:45:53.896283+00	2022-04-11 22:45:53.896283+00
3	admin	2022-04-11 22:45:53.897276+00	2022-04-11 22:45:53.897276+00
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
01801ace-1079-bbcd-65bb-2a634780b287	college-mentors	College Mentors	MENTORS	t	f	t	2022-04-11 22:45:53.915189+00	2022-04-11 22:45:53.915189+00
01801ace-107a-60de-31a5-6f4126c3ac49	community-org	Community Org	COMMUNITY	t	f	f	2022-04-11 22:45:53.91644+00	2022-04-11 22:45:53.91644+00
01801ace-107a-6ca0-735c-0ebee6801b95	school-helpers	School Helpers	SCHOOLHELPERS	f	f	f	2022-04-11 22:45:53.917446+00	2022-04-11 22:45:53.917446+00
\.


--
-- Data for Name: volunteer_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_partner_orgs (id, key, name, receive_weekly_hour_summary_email, created_at, updated_at) FROM stdin;
01801ace-1081-b1a0-57a5-3ab7c783d79e	big-telecom	Big Telecom	t	2022-04-11 22:45:53.922612+00	2022-04-11 22:45:53.922612+00
01801ace-1081-f135-eb16-3ede46cba350	health-co	Health Co	f	2022-04-11 22:45:53.923825+00	2022-04-11 22:45:53.923825+00
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
1	Sunday	2022-04-11 22:45:53.888149+00	2022-04-11 22:45:53.888149+00
2	Monday	2022-04-11 22:45:53.889548+00	2022-04-11 22:45:53.889548+00
3	Tuesday	2022-04-11 22:45:53.8906+00	2022-04-11 22:45:53.8906+00
4	Wednesday	2022-04-11 22:45:53.891397+00	2022-04-11 22:45:53.891397+00
5	Thursday	2022-04-11 22:45:53.892308+00	2022-04-11 22:45:53.892308+00
6	Friday	2022-04-11 22:45:53.893244+00	2022-04-11 22:45:53.893244+00
7	Saturday	2022-04-11 22:45:53.894038+00	2022-04-11 22:45:53.894038+00
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
1	prealgebra	2022-04-11 22:45:54.305231+00	2022-04-11 22:45:54.305231+00
2	statistics	2022-04-11 22:45:54.306792+00	2022-04-11 22:45:54.306792+00
3	geometry	2022-04-11 22:45:54.307888+00	2022-04-11 22:45:54.307888+00
4	biology	2022-04-11 22:45:54.308898+00	2022-04-11 22:45:54.308898+00
5	chemistry	2022-04-11 22:45:54.309913+00	2022-04-11 22:45:54.309913+00
6	physicsOne	2022-04-11 22:45:54.310856+00	2022-04-11 22:45:54.310856+00
7	physicsTwo	2022-04-11 22:45:54.311914+00	2022-04-11 22:45:54.311914+00
8	environmentalScience	2022-04-11 22:45:54.313021+00	2022-04-11 22:45:54.313021+00
9	essays	2022-04-11 22:45:54.313965+00	2022-04-11 22:45:54.313965+00
10	applications	2022-04-11 22:45:54.314928+00	2022-04-11 22:45:54.314928+00
11	planning	2022-04-11 22:45:54.31592+00	2022-04-11 22:45:54.31592+00
12	satMath	2022-04-11 22:45:54.317181+00	2022-04-11 22:45:54.317181+00
13	satReading	2022-04-11 22:45:54.318289+00	2022-04-11 22:45:54.318289+00
14	collegeCounseling	2022-04-11 22:45:54.319278+00	2022-04-11 22:45:54.319278+00
15	humanitiesEssays	2022-04-11 22:45:54.320177+00	2022-04-11 22:45:54.320177+00
16	algebraOne	2022-04-11 22:45:54.321388+00	2022-04-11 22:45:54.321388+00
17	algebraTwo	2022-04-11 22:45:54.322526+00	2022-04-11 22:45:54.322526+00
18	trigonometry	2022-04-11 22:45:54.32375+00	2022-04-11 22:45:54.32375+00
19	precalculus	2022-04-11 22:45:54.324902+00	2022-04-11 22:45:54.324902+00
20	calculusAB	2022-04-11 22:45:54.326507+00	2022-04-11 22:45:54.326507+00
21	calculusBC	2022-04-11 22:45:54.327815+00	2022-04-11 22:45:54.327815+00
\.


--
-- Data for Name: certification_subject_unlocks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at) FROM stdin;
21	16	2022-04-11 22:45:54.380489+00	2022-04-11 22:45:54.380489+00
21	3	2022-04-11 22:45:54.382112+00	2022-04-11 22:45:54.382112+00
21	2	2022-04-11 22:45:54.383153+00	2022-04-11 22:45:54.383153+00
22	16	2022-04-11 22:45:54.384098+00	2022-04-11 22:45:54.384098+00
22	3	2022-04-11 22:45:54.385353+00	2022-04-11 22:45:54.385353+00
22	2	2022-04-11 22:45:54.38627+00	2022-04-11 22:45:54.38627+00
22	18	2022-04-11 22:45:54.390366+00	2022-04-11 22:45:54.390366+00
23	19	2022-04-11 22:45:54.391484+00	2022-04-11 22:45:54.391484+00
23	2	2022-04-11 22:45:54.392653+00	2022-04-11 22:45:54.392653+00
24	19	2022-04-11 22:45:54.393608+00	2022-04-11 22:45:54.393608+00
1	1	2022-04-11 22:45:54.394568+00	2022-04-11 22:45:54.394568+00
9	2	2022-04-11 22:45:54.395665+00	2022-04-11 22:45:54.395665+00
4	3	2022-04-11 22:45:54.396829+00	2022-04-11 22:45:54.396829+00
10	4	2022-04-11 22:45:54.397805+00	2022-04-11 22:45:54.397805+00
11	5	2022-04-11 22:45:54.399361+00	2022-04-11 22:45:54.399361+00
12	6	2022-04-11 22:45:54.400392+00	2022-04-11 22:45:54.400392+00
13	7	2022-04-11 22:45:54.401337+00	2022-04-11 22:45:54.401337+00
14	8	2022-04-11 22:45:54.402413+00	2022-04-11 22:45:54.402413+00
17	9	2022-04-11 22:45:54.403433+00	2022-04-11 22:45:54.403433+00
19	10	2022-04-11 22:45:54.404532+00	2022-04-11 22:45:54.404532+00
18	11	2022-04-11 22:45:54.405522+00	2022-04-11 22:45:54.405522+00
15	12	2022-04-11 22:45:54.40657+00	2022-04-11 22:45:54.40657+00
16	13	2022-04-11 22:45:54.407657+00	2022-04-11 22:45:54.407657+00
20	15	2022-04-11 22:45:54.408664+00	2022-04-11 22:45:54.408664+00
2	16	2022-04-11 22:45:54.40968+00	2022-04-11 22:45:54.40968+00
3	17	2022-04-11 22:45:54.410638+00	2022-04-11 22:45:54.410638+00
5	18	2022-04-11 22:45:54.411518+00	2022-04-11 22:45:54.411518+00
6	19	2022-04-11 22:45:54.412447+00	2022-04-11 22:45:54.412447+00
7	20	2022-04-11 22:45:54.413536+00	2022-04-11 22:45:54.413536+00
8	21	2022-04-11 22:45:54.414468+00	2022-04-11 22:45:54.414468+00
\.


--
-- Data for Name: us_states; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.us_states (code, name, created_at, updated_at) FROM stdin;
AL	Alabama	2022-04-11 22:45:53.583693+00	2022-04-11 22:45:53.583693+00
AK	Alaska	2022-04-11 22:45:53.592185+00	2022-04-11 22:45:53.592185+00
AR	Arkansas	2022-04-11 22:45:53.595843+00	2022-04-11 22:45:53.595843+00
AZ	Arizona	2022-04-11 22:45:53.598972+00	2022-04-11 22:45:53.598972+00
CA	California	2022-04-11 22:45:53.601647+00	2022-04-11 22:45:53.601647+00
CO	Colorado	2022-04-11 22:45:53.605046+00	2022-04-11 22:45:53.605046+00
CT	Connecticut	2022-04-11 22:45:53.606535+00	2022-04-11 22:45:53.606535+00
DE	Delaware	2022-04-11 22:45:53.607879+00	2022-04-11 22:45:53.607879+00
DC	District of Columbia	2022-04-11 22:45:53.609248+00	2022-04-11 22:45:53.609248+00
FL	Florida	2022-04-11 22:45:53.61034+00	2022-04-11 22:45:53.61034+00
GA	Georgia	2022-04-11 22:45:53.611461+00	2022-04-11 22:45:53.611461+00
HI	Hawaii	2022-04-11 22:45:53.612895+00	2022-04-11 22:45:53.612895+00
ID	Idaho	2022-04-11 22:45:53.614022+00	2022-04-11 22:45:53.614022+00
IL	Illinois	2022-04-11 22:45:53.615097+00	2022-04-11 22:45:53.615097+00
IN	Indiana	2022-04-11 22:45:53.616163+00	2022-04-11 22:45:53.616163+00
IA	Iowa	2022-04-11 22:45:53.617233+00	2022-04-11 22:45:53.617233+00
KS	Kansas	2022-04-11 22:45:53.618366+00	2022-04-11 22:45:53.618366+00
KY	Kentucky	2022-04-11 22:45:53.619368+00	2022-04-11 22:45:53.619368+00
LA	Louisiana	2022-04-11 22:45:53.620372+00	2022-04-11 22:45:53.620372+00
ME	Maine	2022-04-11 22:45:53.621486+00	2022-04-11 22:45:53.621486+00
MD	Maryland	2022-04-11 22:45:53.622507+00	2022-04-11 22:45:53.622507+00
MA	Massachusetts	2022-04-11 22:45:53.62363+00	2022-04-11 22:45:53.62363+00
MI	Michigan	2022-04-11 22:45:53.624566+00	2022-04-11 22:45:53.624566+00
MN	Minnesota	2022-04-11 22:45:53.625569+00	2022-04-11 22:45:53.625569+00
MS	Mississippi	2022-04-11 22:45:53.626443+00	2022-04-11 22:45:53.626443+00
MO	Missouri	2022-04-11 22:45:53.627412+00	2022-04-11 22:45:53.627412+00
MT	Montana	2022-04-11 22:45:53.628331+00	2022-04-11 22:45:53.628331+00
NE	Nebraska	2022-04-11 22:45:53.629278+00	2022-04-11 22:45:53.629278+00
NV	Nevada	2022-04-11 22:45:53.630206+00	2022-04-11 22:45:53.630206+00
NH	New Hampshire	2022-04-11 22:45:53.631175+00	2022-04-11 22:45:53.631175+00
NJ	New Jersey	2022-04-11 22:45:53.63203+00	2022-04-11 22:45:53.63203+00
NM	New Mexico	2022-04-11 22:45:53.632949+00	2022-04-11 22:45:53.632949+00
NY	New York	2022-04-11 22:45:53.633886+00	2022-04-11 22:45:53.633886+00
NC	North Carolina	2022-04-11 22:45:53.634735+00	2022-04-11 22:45:53.634735+00
ND	North Dakota	2022-04-11 22:45:53.635662+00	2022-04-11 22:45:53.635662+00
OH	Ohio	2022-04-11 22:45:53.636551+00	2022-04-11 22:45:53.636551+00
OK	Oklahoma	2022-04-11 22:45:53.637477+00	2022-04-11 22:45:53.637477+00
OR	Oregon	2022-04-11 22:45:53.638516+00	2022-04-11 22:45:53.638516+00
PA	Pennsylvania	2022-04-11 22:45:53.639518+00	2022-04-11 22:45:53.639518+00
RI	Rhode Island	2022-04-11 22:45:53.640572+00	2022-04-11 22:45:53.640572+00
SC	South Carolina	2022-04-11 22:45:53.641437+00	2022-04-11 22:45:53.641437+00
SD	South Dakota	2022-04-11 22:45:53.642293+00	2022-04-11 22:45:53.642293+00
TN	Tennessee	2022-04-11 22:45:53.643217+00	2022-04-11 22:45:53.643217+00
TX	Texas	2022-04-11 22:45:53.644162+00	2022-04-11 22:45:53.644162+00
UT	Utah	2022-04-11 22:45:53.645223+00	2022-04-11 22:45:53.645223+00
VT	Vermont	2022-04-11 22:45:53.646282+00	2022-04-11 22:45:53.646282+00
VA	Virginia	2022-04-11 22:45:53.647307+00	2022-04-11 22:45:53.647307+00
WA	Washington	2022-04-11 22:45:53.648254+00	2022-04-11 22:45:53.648254+00
WV	West Virginia	2022-04-11 22:45:53.649122+00	2022-04-11 22:45:53.649122+00
WI	Wisconsin	2022-04-11 22:45:53.649981+00	2022-04-11 22:45:53.649981+00
WY	Wyoming	2022-04-11 22:45:53.650877+00	2022-04-11 22:45:53.650877+00
PR	Puerto Rico	2022-04-11 22:45:53.651723+00	2022-04-11 22:45:53.651723+00
GU	Guam	2022-04-11 22:45:53.652527+00	2022-04-11 22:45:53.652527+00
VI	Virgin Islands	2022-04-11 22:45:53.65335+00	2022-04-11 22:45:53.65335+00
AS	American Samoa	2022-04-11 22:45:53.654282+00	2022-04-11 22:45:53.654282+00
BI	Bureau of Indian Education	2022-04-11 22:45:53.655379+00	2022-04-11 22:45:53.655379+00
NA	NA	2022-04-11 22:45:53.656314+00	2022-04-11 22:45:53.656314+00
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.cities (id, name, us_state_code, created_at, updated_at) FROM stdin;
1	Denver	CO	2022-04-11 22:45:59.560679+00	2022-04-11 22:45:59.560679+00
2	Brooklyn	NY	2022-04-11 22:45:59.566952+00	2022-04-11 22:45:59.566952+00
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
1	8th	2022-04-11 22:45:53.908993+00	2022-04-11 22:45:53.908993+00
2	9th	2022-04-11 22:45:53.910024+00	2022-04-11 22:45:53.910024+00
3	10th	2022-04-11 22:45:53.910999+00	2022-04-11 22:45:53.910999+00
4	11th	2022-04-11 22:45:53.911921+00	2022-04-11 22:45:53.911921+00
5	12th	2022-04-11 22:45:53.912984+00	2022-04-11 22:45:53.912984+00
6	College	2022-04-11 22:45:53.913931+00	2022-04-11 22:45:53.913931+00
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
00501	NY	0	(40.81,-73.04)	2022-04-11 22:45:53.7546+00	2022-04-11 22:45:53.7546+00
01002	MA	147482	(42.37,-72.52)	2022-04-11 22:45:53.8072+00	2022-04-11 22:45:53.8072+00
00544	NY	0	(40.81,-73.04)	2022-04-11 22:45:53.830183+00	2022-04-11 22:45:53.830183+00
01007	MA	103396	(42.27,-72.4)	2022-04-11 22:45:53.830345+00	2022-04-11 22:45:53.830345+00
01001	MA	91129	(42.06,-72.61)	2022-04-11 22:45:53.866357+00	2022-04-11 22:45:53.866357+00
01003	MA	0	(42.39,-72.52)	2022-04-11 22:45:53.877898+00	2022-04-11 22:45:53.877898+00
01005	MA	24883	(42.42,-72.1)	2022-04-11 22:45:53.88108+00	2022-04-11 22:45:53.88108+00
01004	MA	0	(42.37,-72.52)	2022-04-11 22:45:53.881165+00	2022-04-11 22:45:53.881165+00
01009	MA	0	(42.2,-72.34)	2022-04-11 22:45:53.882567+00	2022-04-11 22:45:53.882567+00
01008	MA	7667	(42.18,-72.93)	2022-04-11 22:45:53.884696+00	2022-04-11 22:45:53.884696+00
00000	NA	0	(0,0)	2022-04-11 22:45:53.886857+00	2022-04-11 22:45:53.886857+00
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools (id, name, approved, partner, city_id, created_at, updated_at, mongo_id, legacy_city_name) FROM stdin;
01801ace-2690-914c-53bb-076a56d57efa	Unapproved School	f	f	1	2022-04-11 22:45:59.569598+00	2022-04-11 22:45:59.569598+00	\N	\N
01801ace-2690-1b02-196c-7fc727478e4c	Approved School	t	f	1	2022-04-11 22:45:59.581812+00	2022-04-11 22:45:59.581812+00	\N	\N
01801ace-2690-464c-3df5-45ee2c9f2ad5	Approved Partner School	t	t	2	2022-04-11 22:45:59.583243+00	2022-04-11 22:45:59.583243+00	\N	\N
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
1	sms	2022-04-11 22:45:54.43453+00	2022-04-11 22:45:54.43453+00
2	push	2022-04-11 22:45:54.435635+00	2022-04-11 22:45:54.435635+00
3	voice	2022-04-11 22:45:54.436462+00	2022-04-11 22:45:54.436462+00
4	email	2022-04-11 22:45:54.439558+00	2022-04-11 22:45:54.439558+00
\.


--
-- Data for Name: notification_priority_groups; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_priority_groups (id, name, priority, created_at, updated_at) FROM stdin;
1	follow-up	-1	2022-04-11 22:45:54.440934+00	2022-04-11 22:45:54.440934+00
2	Partner volunteers - not notified in the last 3 days AND they don't have "high level subjects"	1	2022-04-11 22:45:54.442086+00	2022-04-11 22:45:54.442086+00
3	Regular volunteers - not notified in the last 3 days AND they don't have "high level subjects"	2	2022-04-11 22:45:54.442987+00	2022-04-11 22:45:54.442987+00
4	Partner volunteers - not notified in the last 24 hours AND they don't have "high level subjects"	3	2022-04-11 22:45:54.444104+00	2022-04-11 22:45:54.444104+00
5	Regular volunteers - not notified in the last 24 hours AND they don't have "high level subjects"	4	2022-04-11 22:45:54.445062+00	2022-04-11 22:45:54.445062+00
6	All volunteers - not notified in the last 24 hours	5	2022-04-11 22:45:54.446102+00	2022-04-11 22:45:54.446102+00
7	All volunteers - not notified in the last 60 mins	6	2022-04-11 22:45:54.447065+00	2022-04-11 22:45:54.447065+00
8	All volunteers - not notified in the last 15 mins	7	2022-04-11 22:45:54.448064+00	2022-04-11 22:45:54.448064+00
9	Verizon volunteers - not notified in the last 24 hours AND they don't have "high level subjects"	8	2022-04-11 22:45:54.448953+00	2022-04-11 22:45:54.448953+00
10	Verizon volunteers - not notified in the last 3 days AND they don't have "high level subjects"	9	2022-04-11 22:45:54.450064+00	2022-04-11 22:45:54.450064+00
11	LEGACY: Regular volunteers - not notified in the last 7 days	-1	2022-04-11 22:45:54.451569+00	2022-04-11 22:45:54.451569+00
12	LEGACY: Partner volunteers - not notified in the last 7 days	-1	2022-04-11 22:45:54.452719+00	2022-04-11 22:45:54.452719+00
13	LEGACY: Partner volunteers - not notified in the last 3 days	-1	2022-04-11 22:45:54.454+00	2022-04-11 22:45:54.454+00
14	LEGACY: All volunteers - not notified in the last 15 mins who don't have "high level subjects"	-1	2022-04-11 22:45:54.456422+00	2022-04-11 22:45:54.456422+00
15	LEGACY: Mizuho and Atlassian volunteers - Not notified in last 3 days	-1	2022-04-11 22:45:54.457883+00	2022-04-11 22:45:54.457883+00
16	LEGACY: null	-1	2022-04-11 22:45:54.458888+00	2022-04-11 22:45:54.458888+00
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_types (id, type, created_at, updated_at) FROM stdin;
1	initial	2022-04-11 22:45:54.432224+00	2022-04-11 22:45:54.432224+00
2	followup	2022-04-11 22:45:54.433344+00	2022-04-11 22:45:54.433344+00
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
1	approved	2022-04-11 22:45:53.926109+00	2022-04-11 22:45:53.926109+00
2	submitted	2022-04-11 22:45:53.927209+00	2022-04-11 22:45:53.927209+00
3	rejected	2022-04-11 22:45:53.928116+00	2022-04-11 22:45:53.928116+00
4	empty	2022-04-11 22:45:53.929125+00	2022-04-11 22:45:53.929125+00
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
1	prealgebra	2022-04-11 22:45:53.972805+00	2022-04-11 22:45:53.972805+00
2	statistics	2022-04-11 22:45:53.973978+00	2022-04-11 22:45:53.973978+00
3	geometry	2022-04-11 22:45:53.974993+00	2022-04-11 22:45:53.974993+00
4	biology	2022-04-11 22:45:53.97598+00	2022-04-11 22:45:53.97598+00
5	chemistry	2022-04-11 22:45:53.976936+00	2022-04-11 22:45:53.976936+00
6	physicsOne	2022-04-11 22:45:53.977811+00	2022-04-11 22:45:53.977811+00
7	physicsTwo	2022-04-11 22:45:53.978713+00	2022-04-11 22:45:53.978713+00
8	environmentalScience	2022-04-11 22:45:53.979676+00	2022-04-11 22:45:53.979676+00
9	essays	2022-04-11 22:45:53.980651+00	2022-04-11 22:45:53.980651+00
10	applications	2022-04-11 22:45:53.981591+00	2022-04-11 22:45:53.981591+00
11	planning	2022-04-11 22:45:53.982525+00	2022-04-11 22:45:53.982525+00
12	satMath	2022-04-11 22:45:53.983375+00	2022-04-11 22:45:53.983375+00
13	satReading	2022-04-11 22:45:53.98431+00	2022-04-11 22:45:53.98431+00
14	collegeCounseling	2022-04-11 22:45:53.985342+00	2022-04-11 22:45:53.985342+00
15	humanitiesEssays	2022-04-11 22:45:53.986354+00	2022-04-11 22:45:53.986354+00
16	algebraOne	2022-04-11 22:45:53.987552+00	2022-04-11 22:45:53.987552+00
17	algebraTwo	2022-04-11 22:45:53.988735+00	2022-04-11 22:45:53.988735+00
18	trigonometry	2022-04-11 22:45:53.98975+00	2022-04-11 22:45:53.98975+00
19	precalculus	2022-04-11 22:45:53.990709+00	2022-04-11 22:45:53.990709+00
20	calculusAB	2022-04-11 22:45:53.991659+00	2022-04-11 22:45:53.991659+00
21	calculusBC	2022-04-11 22:45:53.992552+00	2022-04-11 22:45:53.992552+00
22	upchieve101	2022-04-11 22:45:53.993516+00	2022-04-11 22:45:53.993516+00
23	reading	2022-04-11 22:45:53.994475+00	2022-04-11 22:45:53.994475+00
24	anatomy	2022-04-11 22:45:53.995492+00	2022-04-11 22:45:53.995492+00
\.


--
-- Data for Name: quiz_certification_grants; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) FROM stdin;
1	1	2022-04-11 22:45:54.330311+00	2022-04-11 22:45:54.330311+00
2	2	2022-04-11 22:45:54.331727+00	2022-04-11 22:45:54.331727+00
3	3	2022-04-11 22:45:54.333477+00	2022-04-11 22:45:54.333477+00
4	4	2022-04-11 22:45:54.334981+00	2022-04-11 22:45:54.334981+00
5	5	2022-04-11 22:45:54.336129+00	2022-04-11 22:45:54.336129+00
6	6	2022-04-11 22:45:54.337416+00	2022-04-11 22:45:54.337416+00
7	7	2022-04-11 22:45:54.338946+00	2022-04-11 22:45:54.338946+00
8	8	2022-04-11 22:45:54.340352+00	2022-04-11 22:45:54.340352+00
9	9	2022-04-11 22:45:54.341429+00	2022-04-11 22:45:54.341429+00
10	10	2022-04-11 22:45:54.342463+00	2022-04-11 22:45:54.342463+00
11	11	2022-04-11 22:45:54.343523+00	2022-04-11 22:45:54.343523+00
12	12	2022-04-11 22:45:54.344872+00	2022-04-11 22:45:54.344872+00
13	13	2022-04-11 22:45:54.346117+00	2022-04-11 22:45:54.346117+00
14	11	2022-04-11 22:45:54.347173+00	2022-04-11 22:45:54.347173+00
14	10	2022-04-11 22:45:54.348372+00	2022-04-11 22:45:54.348372+00
15	15	2022-04-11 22:45:54.349516+00	2022-04-11 22:45:54.349516+00
17	16	2022-04-11 22:45:54.350748+00	2022-04-11 22:45:54.350748+00
17	17	2022-04-11 22:45:54.351883+00	2022-04-11 22:45:54.351883+00
17	1	2022-04-11 22:45:54.352797+00	2022-04-11 22:45:54.352797+00
16	16	2022-04-11 22:45:54.354491+00	2022-04-11 22:45:54.354491+00
16	1	2022-04-11 22:45:54.359471+00	2022-04-11 22:45:54.359471+00
18	18	2022-04-11 22:45:54.360811+00	2022-04-11 22:45:54.360811+00
19	16	2022-04-11 22:45:54.36188+00	2022-04-11 22:45:54.36188+00
19	17	2022-04-11 22:45:54.362983+00	2022-04-11 22:45:54.362983+00
19	1	2022-04-11 22:45:54.36399+00	2022-04-11 22:45:54.36399+00
19	18	2022-04-11 22:45:54.36497+00	2022-04-11 22:45:54.36497+00
19	19	2022-04-11 22:45:54.365808+00	2022-04-11 22:45:54.365808+00
20	16	2022-04-11 22:45:54.366781+00	2022-04-11 22:45:54.366781+00
20	17	2022-04-11 22:45:54.367697+00	2022-04-11 22:45:54.367697+00
20	1	2022-04-11 22:45:54.368626+00	2022-04-11 22:45:54.368626+00
20	18	2022-04-11 22:45:54.369591+00	2022-04-11 22:45:54.369591+00
20	19	2022-04-11 22:45:54.37119+00	2022-04-11 22:45:54.37119+00
20	20	2022-04-11 22:45:54.372205+00	2022-04-11 22:45:54.372205+00
21	16	2022-04-11 22:45:54.373177+00	2022-04-11 22:45:54.373177+00
21	17	2022-04-11 22:45:54.37406+00	2022-04-11 22:45:54.37406+00
21	1	2022-04-11 22:45:54.374962+00	2022-04-11 22:45:54.374962+00
21	18	2022-04-11 22:45:54.375865+00	2022-04-11 22:45:54.375865+00
21	19	2022-04-11 22:45:54.377026+00	2022-04-11 22:45:54.377026+00
21	20	2022-04-11 22:45:54.378061+00	2022-04-11 22:45:54.378061+00
21	21	2022-04-11 22:45:54.379072+00	2022-04-11 22:45:54.379072+00
\.


--
-- Data for Name: quiz_subcategories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_subcategories (id, name, quiz_id, created_at, updated_at) FROM stdin;
1	numbers	1	2022-04-11 22:45:53.998019+00	2022-04-11 22:45:53.998019+00
2	arithmetic properties	1	2022-04-11 22:45:53.999323+00	2022-04-11 22:45:53.999323+00
3	exponents	1	2022-04-11 22:45:54.000217+00	2022-04-11 22:45:54.000217+00
4	exponents and radicals	1	2022-04-11 22:45:54.001107+00	2022-04-11 22:45:54.001107+00
5	polynomials	1	2022-04-11 22:45:54.002092+00	2022-04-11 22:45:54.002092+00
6	fractions	1	2022-04-11 22:45:54.002998+00	2022-04-11 22:45:54.002998+00
7	linear equations	16	2022-04-11 22:45:54.003941+00	2022-04-11 22:45:54.003941+00
8	rational exponents and radicals	16	2022-04-11 22:45:54.004907+00	2022-04-11 22:45:54.004907+00
9	application of linear equations	16	2022-04-11 22:45:54.006013+00	2022-04-11 22:45:54.006013+00
10	two variable equations	16	2022-04-11 22:45:54.007066+00	2022-04-11 22:45:54.007066+00
11	rational expressions	16	2022-04-11 22:45:54.008164+00	2022-04-11 22:45:54.008164+00
12	complex numbers	16	2022-04-11 22:45:54.009155+00	2022-04-11 22:45:54.009155+00
13	functions_domain_range	17	2022-04-11 22:45:54.010181+00	2022-04-11 22:45:54.010181+00
14	higher_degree_polynomials	17	2022-04-11 22:45:54.011061+00	2022-04-11 22:45:54.011061+00
15	square_root_equations	17	2022-04-11 22:45:54.012462+00	2022-04-11 22:45:54.012462+00
16	roots_of_polynomials	17	2022-04-11 22:45:54.01357+00	2022-04-11 22:45:54.01357+00
17	multiply_polynomials_binomial	17	2022-04-11 22:45:54.014554+00	2022-04-11 22:45:54.014554+00
18	rational_radical_absolute	17	2022-04-11 22:45:54.015524+00	2022-04-11 22:45:54.015524+00
19	logarithms_properties	17	2022-04-11 22:45:54.016546+00	2022-04-11 22:45:54.016546+00
20	rational_expressions	17	2022-04-11 22:45:54.017714+00	2022-04-11 22:45:54.017714+00
21	systems_of_linear_equations	17	2022-04-11 22:45:54.018781+00	2022-04-11 22:45:54.018781+00
22	arithmetic_and_geometric_sequences	17	2022-04-11 22:45:54.01974+00	2022-04-11 22:45:54.01974+00
23	functions_domain	17	2022-04-11 22:45:54.020847+00	2022-04-11 22:45:54.020847+00
24	solving_linear_equations	17	2022-04-11 22:45:54.021954+00	2022-04-11 22:45:54.021954+00
25	function_transformations_shifts	17	2022-04-11 22:45:54.023039+00	2022-04-11 22:45:54.023039+00
26	graphing_quadratic_functions	17	2022-04-11 22:45:54.024046+00	2022-04-11 22:45:54.024046+00
27	exponential_functions_growth	17	2022-04-11 22:45:54.024943+00	2022-04-11 22:45:54.024943+00
28	rounding_and_scientific_notation	17	2022-04-11 22:45:54.025959+00	2022-04-11 22:45:54.025959+00
29	square root_equations_quadratic	17	2022-04-11 22:45:54.026866+00	2022-04-11 22:45:54.026866+00
30	advanced_factoring_techniques	17	2022-04-11 22:45:54.02776+00	2022-04-11 22:45:54.02776+00
31	congruence and similarity	3	2022-04-11 22:45:54.028916+00	2022-04-11 22:45:54.028916+00
32	vertices	3	2022-04-11 22:45:54.029929+00	2022-04-11 22:45:54.029929+00
33	angles	3	2022-04-11 22:45:54.031105+00	2022-04-11 22:45:54.031105+00
34	circles	3	2022-04-11 22:45:54.032069+00	2022-04-11 22:45:54.032069+00
35	triangles	3	2022-04-11 22:45:54.032919+00	2022-04-11 22:45:54.032919+00
36	rectangles	3	2022-04-11 22:45:54.033799+00	2022-04-11 22:45:54.033799+00
37	angles	18	2022-04-11 22:45:54.034734+00	2022-04-11 22:45:54.034734+00
38	triangles	18	2022-04-11 22:45:54.035657+00	2022-04-11 22:45:54.035657+00
39	right triangles	18	2022-04-11 22:45:54.036617+00	2022-04-11 22:45:54.036617+00
40	quadrants	18	2022-04-11 22:45:54.037677+00	2022-04-11 22:45:54.037677+00
41	radians	18	2022-04-11 22:45:54.038656+00	2022-04-11 22:45:54.038656+00
42	unit circles	18	2022-04-11 22:45:54.039735+00	2022-04-11 22:45:54.039735+00
43	inequalities	18	2022-04-11 22:45:54.040623+00	2022-04-11 22:45:54.040623+00
44	representing data numerically	2	2022-04-11 22:45:54.041506+00	2022-04-11 22:45:54.041506+00
45	representing data graphically	2	2022-04-11 22:45:54.042478+00	2022-04-11 22:45:54.042478+00
46	two means	2	2022-04-11 22:45:54.043384+00	2022-04-11 22:45:54.043384+00
47	two proportions	2	2022-04-11 22:45:54.044313+00	2022-04-11 22:45:54.044313+00
48	levels of measurement	2	2022-04-11 22:45:54.045191+00	2022-04-11 22:45:54.045191+00
49	types of sampling	2	2022-04-11 22:45:54.046182+00	2022-04-11 22:45:54.046182+00
50	finding probability	2	2022-04-11 22:45:54.047229+00	2022-04-11 22:45:54.047229+00
51	finding x from z score	2	2022-04-11 22:45:54.048474+00	2022-04-11 22:45:54.048474+00
52	z score	2	2022-04-11 22:45:54.049384+00	2022-04-11 22:45:54.049384+00
53	basic set operations	2	2022-04-11 22:45:54.050422+00	2022-04-11 22:45:54.050422+00
54	compound events	2	2022-04-11 22:45:54.05147+00	2022-04-11 22:45:54.05147+00
55	conditional probability	2	2022-04-11 22:45:54.052466+00	2022-04-11 22:45:54.052466+00
56	independent probability	2	2022-04-11 22:45:54.053529+00	2022-04-11 22:45:54.053529+00
57	permutations and combinations	2	2022-04-11 22:45:54.054588+00	2022-04-11 22:45:54.054588+00
58	random variables distributions	2	2022-04-11 22:45:54.055399+00	2022-04-11 22:45:54.055399+00
59	relationships between variables	2	2022-04-11 22:45:54.056269+00	2022-04-11 22:45:54.056269+00
60	confidence intervals	2	2022-04-11 22:45:54.057196+00	2022-04-11 22:45:54.057196+00
61	interpreting pvalue	2	2022-04-11 22:45:54.058236+00	2022-04-11 22:45:54.058236+00
62	finding the test statistic	2	2022-04-11 22:45:54.059149+00	2022-04-11 22:45:54.059149+00
63	rectangular coordinates	19	2022-04-11 22:45:54.060111+00	2022-04-11 22:45:54.060111+00
64	linear inequalities	19	2022-04-11 22:45:54.066799+00	2022-04-11 22:45:54.066799+00
65	functions	19	2022-04-11 22:45:54.06778+00	2022-04-11 22:45:54.06778+00
66	rational exponents	19	2022-04-11 22:45:54.068712+00	2022-04-11 22:45:54.068712+00
67	quadratic functions	19	2022-04-11 22:45:54.069598+00	2022-04-11 22:45:54.069598+00
68	logarithms and exponents	19	2022-04-11 22:45:54.070592+00	2022-04-11 22:45:54.070592+00
69	absolute extrema	20	2022-04-11 22:45:54.071567+00	2022-04-11 22:45:54.071567+00
70	antiderivatives	20	2022-04-11 22:45:54.072463+00	2022-04-11 22:45:54.072463+00
71	area between curves	20	2022-04-11 22:45:54.073565+00	2022-04-11 22:45:54.073565+00
72	chain rule	20	2022-04-11 22:45:54.074557+00	2022-04-11 22:45:54.074557+00
73	concavity	20	2022-04-11 22:45:54.075567+00	2022-04-11 22:45:54.075567+00
74	continuity	20	2022-04-11 22:45:54.076545+00	2022-04-11 22:45:54.076545+00
75	derivatives	20	2022-04-11 22:45:54.077616+00	2022-04-11 22:45:54.077616+00
76	differential equations	20	2022-04-11 22:45:54.079027+00	2022-04-11 22:45:54.079027+00
77	fundamental theorem	20	2022-04-11 22:45:54.080161+00	2022-04-11 22:45:54.080161+00
78	lhopitals rule	20	2022-04-11 22:45:54.081317+00	2022-04-11 22:45:54.081317+00
79	implicit differentiation	20	2022-04-11 22:45:54.082453+00	2022-04-11 22:45:54.082453+00
80	mean value theorem	20	2022-04-11 22:45:54.083446+00	2022-04-11 22:45:54.083446+00
81	optimization	20	2022-04-11 22:45:54.084489+00	2022-04-11 22:45:54.084489+00
82	reimann sums	20	2022-04-11 22:45:54.085571+00	2022-04-11 22:45:54.085571+00
83	related rates	20	2022-04-11 22:45:54.086679+00	2022-04-11 22:45:54.086679+00
84	relative extrema	20	2022-04-11 22:45:54.087901+00	2022-04-11 22:45:54.087901+00
85	absolute extrema	21	2022-04-11 22:45:54.08886+00	2022-04-11 22:45:54.08886+00
86	antiderivatives	21	2022-04-11 22:45:54.08988+00	2022-04-11 22:45:54.08988+00
87	area between curves	21	2022-04-11 22:45:54.090794+00	2022-04-11 22:45:54.090794+00
88	chain rule	21	2022-04-11 22:45:54.091684+00	2022-04-11 22:45:54.091684+00
89	derivatives	21	2022-04-11 22:45:54.092642+00	2022-04-11 22:45:54.092642+00
90	differential equations	21	2022-04-11 22:45:54.093543+00	2022-04-11 22:45:54.093543+00
91	fundamental theorem of calculus	21	2022-04-11 22:45:54.094482+00	2022-04-11 22:45:54.094482+00
92	implicit differentiation	21	2022-04-11 22:45:54.095497+00	2022-04-11 22:45:54.095497+00
93	infinite sequences	21	2022-04-11 22:45:54.096482+00	2022-04-11 22:45:54.096482+00
94	limits	21	2022-04-11 22:45:54.097445+00	2022-04-11 22:45:54.097445+00
95	integration by parts	21	2022-04-11 22:45:54.098543+00	2022-04-11 22:45:54.098543+00
96	mean value theorem	21	2022-04-11 22:45:54.099456+00	2022-04-11 22:45:54.099456+00
97	optimization	21	2022-04-11 22:45:54.100363+00	2022-04-11 22:45:54.100363+00
98	parametric	21	2022-04-11 22:45:54.101194+00	2022-04-11 22:45:54.101194+00
99	reimann sums	21	2022-04-11 22:45:54.102116+00	2022-04-11 22:45:54.102116+00
100	relative extrema	21	2022-04-11 22:45:54.103072+00	2022-04-11 22:45:54.103072+00
101	taylor polynomials	21	2022-04-11 22:45:54.104074+00	2022-04-11 22:45:54.104074+00
102	basic	9	2022-04-11 22:45:54.105075+00	2022-04-11 22:45:54.105075+00
103	commonapp	9	2022-04-11 22:45:54.106018+00	2022-04-11 22:45:54.106018+00
104	answer	9	2022-04-11 22:45:54.106944+00	2022-04-11 22:45:54.106944+00
105	dhistory	9	2022-04-11 22:45:54.107983+00	2022-04-11 22:45:54.107983+00
106	optional	9	2022-04-11 22:45:54.108924+00	2022-04-11 22:45:54.108924+00
107	supplemental	9	2022-04-11 22:45:54.109849+00	2022-04-11 22:45:54.109849+00
108	exam	11	2022-04-11 22:45:54.110741+00	2022-04-11 22:45:54.110741+00
109	type	11	2022-04-11 22:45:54.111655+00	2022-04-11 22:45:54.111655+00
110	LOR	11	2022-04-11 22:45:54.112703+00	2022-04-11 22:45:54.112703+00
111	basic	11	2022-04-11 22:45:54.113561+00	2022-04-11 22:45:54.113561+00
112	timeline	10	2022-04-11 22:45:54.114611+00	2022-04-11 22:45:54.114611+00
113	resume	10	2022-04-11 22:45:54.115735+00	2022-04-11 22:45:54.115735+00
114	schools	10	2022-04-11 22:45:54.116648+00	2022-04-11 22:45:54.116648+00
115	fees	10	2022-04-11 22:45:54.117661+00	2022-04-11 22:45:54.117661+00
116	FinAid	10	2022-04-11 22:45:54.118456+00	2022-04-11 22:45:54.118456+00
117	LOR	10	2022-04-11 22:45:54.119409+00	2022-04-11 22:45:54.119409+00
118	basic	10	2022-04-11 22:45:54.120309+00	2022-04-11 22:45:54.120309+00
119	biochemistry	4	2022-04-11 22:45:54.1214+00	2022-04-11 22:45:54.1214+00
120	the cell	4	2022-04-11 22:45:54.122436+00	2022-04-11 22:45:54.122436+00
121	cell division	4	2022-04-11 22:45:54.123353+00	2022-04-11 22:45:54.123353+00
122	cellular respiration	4	2022-04-11 22:45:54.124258+00	2022-04-11 22:45:54.124258+00
123	photosynthesis and plants	4	2022-04-11 22:45:54.125274+00	2022-04-11 22:45:54.125274+00
124	classical genetics	4	2022-04-11 22:45:54.126111+00	2022-04-11 22:45:54.126111+00
125	molecular genetics	4	2022-04-11 22:45:54.127148+00	2022-04-11 22:45:54.127148+00
126	animal behavior and physiology	4	2022-04-11 22:45:54.128139+00	2022-04-11 22:45:54.128139+00
127	ecology	4	2022-04-11 22:45:54.129316+00	2022-04-11 22:45:54.129316+00
128	human physiology and anatomy	4	2022-04-11 22:45:54.130308+00	2022-04-11 22:45:54.130308+00
129	evolution and taxonomy	4	2022-04-11 22:45:54.13127+00	2022-04-11 22:45:54.13127+00
130	chemical reactions	5	2022-04-11 22:45:54.132204+00	2022-04-11 22:45:54.132204+00
131	atoms, compounds, and ions	5	2022-04-11 22:45:54.133172+00	2022-04-11 22:45:54.133172+00
132	stoichiometry	5	2022-04-11 22:45:54.134098+00	2022-04-11 22:45:54.134098+00
133	electron structure of atoms	5	2022-04-11 22:45:54.135013+00	2022-04-11 22:45:54.135013+00
134	periodic table	5	2022-04-11 22:45:54.135973+00	2022-04-11 22:45:54.135973+00
135	chemical bonds	5	2022-04-11 22:45:54.136941+00	2022-04-11 22:45:54.136941+00
136	gases	5	2022-04-11 22:45:54.137891+00	2022-04-11 22:45:54.137891+00
137	states of matter and intermolecular forces	5	2022-04-11 22:45:54.138787+00	2022-04-11 22:45:54.138787+00
138	chemical equilibrium	5	2022-04-11 22:45:54.139734+00	2022-04-11 22:45:54.139734+00
139	acids and bases	5	2022-04-11 22:45:54.140699+00	2022-04-11 22:45:54.140699+00
140	buffers, titrations, and solubility equilibria	5	2022-04-11 22:45:54.141554+00	2022-04-11 22:45:54.141554+00
141	thermodynamics	5	2022-04-11 22:45:54.142465+00	2022-04-11 22:45:54.142465+00
142	redox reactions and electrochemistry	5	2022-04-11 22:45:54.143339+00	2022-04-11 22:45:54.143339+00
143	kinetics	5	2022-04-11 22:45:54.144276+00	2022-04-11 22:45:54.144276+00
144	nuclear chemistry	5	2022-04-11 22:45:54.145249+00	2022-04-11 22:45:54.145249+00
145	kinematics	5	2022-04-11 22:45:54.146308+00	2022-04-11 22:45:54.146308+00
146	kinematics	6	2022-04-11 22:45:54.147296+00	2022-04-11 22:45:54.147296+00
147	newton's laws	6	2022-04-11 22:45:54.148207+00	2022-04-11 22:45:54.148207+00
148	rotational mechanics	6	2022-04-11 22:45:54.149168+00	2022-04-11 22:45:54.149168+00
149	work and energy	6	2022-04-11 22:45:54.150078+00	2022-04-11 22:45:54.150078+00
150	momentum and collisions	6	2022-04-11 22:45:54.15102+00	2022-04-11 22:45:54.15102+00
151	thermodynamics	6	2022-04-11 22:45:54.152004+00	2022-04-11 22:45:54.152004+00
152	electrostatics	6	2022-04-11 22:45:54.152852+00	2022-04-11 22:45:54.152852+00
153	magnetism	6	2022-04-11 22:45:54.153795+00	2022-04-11 22:45:54.153795+00
154	waves and sound	6	2022-04-11 22:45:54.154871+00	2022-04-11 22:45:54.154871+00
155	refraction and reflection	6	2022-04-11 22:45:54.155869+00	2022-04-11 22:45:54.155869+00
156	gravity/gen relativity	6	2022-04-11 22:45:54.156982+00	2022-04-11 22:45:54.156982+00
157	Fluids - density and pressure	7	2022-04-11 22:45:54.157934+00	2022-04-11 22:45:54.157934+00
158	Fluids - dynamics	7	2022-04-11 22:45:54.158885+00	2022-04-11 22:45:54.158885+00
159	THD - Ideal Gases	7	2022-04-11 22:45:54.159771+00	2022-04-11 22:45:54.159771+00
160	thermodynamics	7	2022-04-11 22:45:54.160699+00	2022-04-11 22:45:54.160699+00
161	Electric Field	7	2022-04-11 22:45:54.161589+00	2022-04-11 22:45:54.161589+00
162	Electric Potential	7	2022-04-11 22:45:54.162571+00	2022-04-11 22:45:54.162571+00
163	Magnetic Fields	7	2022-04-11 22:45:54.163591+00	2022-04-11 22:45:54.163591+00
164	Magnetic Induction	7	2022-04-11 22:45:54.164525+00	2022-04-11 22:45:54.164525+00
165	Electromagnetic Waves	7	2022-04-11 22:45:54.165473+00	2022-04-11 22:45:54.165473+00
166	Optics - refraction and reflection	7	2022-04-11 22:45:54.166333+00	2022-04-11 22:45:54.166333+00
167	Quantum & Atomic Physics	7	2022-04-11 22:45:54.167257+00	2022-04-11 22:45:54.167257+00
168	dynamics 2	7	2022-04-11 22:45:54.168174+00	2022-04-11 22:45:54.168174+00
169	Electric Circuits	7	2022-04-11 22:45:54.16899+00	2022-04-11 22:45:54.16899+00
170	earth systems and resources	8	2022-04-11 22:45:54.169831+00	2022-04-11 22:45:54.169831+00
171	ecology	8	2022-04-11 22:45:54.170773+00	2022-04-11 22:45:54.170773+00
172	energy resources and consumption	8	2022-04-11 22:45:54.171695+00	2022-04-11 22:45:54.171695+00
173	global change	8	2022-04-11 22:45:54.172591+00	2022-04-11 22:45:54.172591+00
174	impact of human health and environment	8	2022-04-11 22:45:54.173462+00	2022-04-11 22:45:54.173462+00
175	interdependence of organisms	8	2022-04-11 22:45:54.174299+00	2022-04-11 22:45:54.174299+00
176	land and water resources and use	8	2022-04-11 22:45:54.175136+00	2022-04-11 22:45:54.175136+00
177	introduction to environmental science	8	2022-04-11 22:45:54.176067+00	2022-04-11 22:45:54.176067+00
178	natural biogeochemical cycles	8	2022-04-11 22:45:54.177093+00	2022-04-11 22:45:54.177093+00
179	pollution	8	2022-04-11 22:45:54.178004+00	2022-04-11 22:45:54.178004+00
180	populations	8	2022-04-11 22:45:54.178934+00	2022-04-11 22:45:54.178934+00
181	the atmosphere	8	2022-04-11 22:45:54.180054+00	2022-04-11 22:45:54.180054+00
182	upchieve	22	2022-04-11 22:45:54.181013+00	2022-04-11 22:45:54.181013+00
183	linear_equations	12	2022-04-11 22:45:54.181975+00	2022-04-11 22:45:54.181975+00
184	linear_inequalities	12	2022-04-11 22:45:54.182996+00	2022-04-11 22:45:54.182996+00
185	linear_functions	12	2022-04-11 22:45:54.183906+00	2022-04-11 22:45:54.183906+00
186	quadratic_problems	12	2022-04-11 22:45:54.184817+00	2022-04-11 22:45:54.184817+00
187	nonlinear_equations	12	2022-04-11 22:45:54.186014+00	2022-04-11 22:45:54.186014+00
188	rational_expressions	12	2022-04-11 22:45:54.187269+00	2022-04-11 22:45:54.187269+00
189	isolating_quantities	12	2022-04-11 22:45:54.188643+00	2022-04-11 22:45:54.188643+00
190	linear_systems	12	2022-04-11 22:45:54.189612+00	2022-04-11 22:45:54.189612+00
191	ratios_rates	12	2022-04-11 22:45:54.190707+00	2022-04-11 22:45:54.190707+00
192	units	12	2022-04-11 22:45:54.191693+00	2022-04-11 22:45:54.191693+00
193	percentages	12	2022-04-11 22:45:54.192649+00	2022-04-11 22:45:54.192649+00
194	linear_and_exponential	12	2022-04-11 22:45:54.193533+00	2022-04-11 22:45:54.193533+00
195	data_inferences	12	2022-04-11 22:45:54.194422+00	2022-04-11 22:45:54.194422+00
196	volume_word_problems	12	2022-04-11 22:45:54.195321+00	2022-04-11 22:45:54.195321+00
197	complex_numbers	12	2022-04-11 22:45:54.196342+00	2022-04-11 22:45:54.196342+00
198	circle_equations	12	2022-04-11 22:45:54.197446+00	2022-04-11 22:45:54.197446+00
199	table_data	12	2022-04-11 22:45:54.19864+00	2022-04-11 22:45:54.19864+00
200	scatterplots	12	2022-04-11 22:45:54.199835+00	2022-04-11 22:45:54.199835+00
201	graphs	12	2022-04-11 22:45:54.200855+00	2022-04-11 22:45:54.200855+00
202	shape_of_distributions	12	2022-04-11 22:45:54.201938+00	2022-04-11 22:45:54.201938+00
203	right_triangle_problems	12	2022-04-11 22:45:54.202947+00	2022-04-11 22:45:54.202947+00
204	congruence_and_similarity	12	2022-04-11 22:45:54.203975+00	2022-04-11 22:45:54.203975+00
205	explict_v_implicit	13	2022-04-11 22:45:54.205066+00	2022-04-11 22:45:54.205066+00
206	point_of_view	13	2022-04-11 22:45:54.206094+00	2022-04-11 22:45:54.206094+00
207	analyzing_relationships	13	2022-04-11 22:45:54.207156+00	2022-04-11 22:45:54.207156+00
208	citing_evidence	13	2022-04-11 22:45:54.208181+00	2022-04-11 22:45:54.208181+00
209	summarizing	13	2022-04-11 22:45:54.20926+00	2022-04-11 22:45:54.20926+00
210	analogical_reasoning	13	2022-04-11 22:45:54.210222+00	2022-04-11 22:45:54.210222+00
211	structure_passage	13	2022-04-11 22:45:54.21108+00	2022-04-11 22:45:54.21108+00
212	word_choice	13	2022-04-11 22:45:54.212118+00	2022-04-11 22:45:54.212118+00
213	graphs_and_data	13	2022-04-11 22:45:54.2131+00	2022-04-11 22:45:54.2131+00
214	purpose_of_text	13	2022-04-11 22:45:54.213996+00	2022-04-11 22:45:54.213996+00
215	analyzing_arguments	13	2022-04-11 22:45:54.2149+00	2022-04-11 22:45:54.2149+00
216	connecting_texts	13	2022-04-11 22:45:54.215914+00	2022-04-11 22:45:54.215914+00
217	history_passages	13	2022-04-11 22:45:54.217106+00	2022-04-11 22:45:54.217106+00
218	strategies	13	2022-04-11 22:45:54.218328+00	2022-04-11 22:45:54.218328+00
219	types_of_essays	15	2022-04-11 22:45:54.219402+00	2022-04-11 22:45:54.219402+00
220	essay_structure	15	2022-04-11 22:45:54.220356+00	2022-04-11 22:45:54.220356+00
221	point_of_view	15	2022-04-11 22:45:54.221477+00	2022-04-11 22:45:54.221477+00
222	persuasive_techniques	15	2022-04-11 22:45:54.222487+00	2022-04-11 22:45:54.222487+00
223	citations	15	2022-04-11 22:45:54.223548+00	2022-04-11 22:45:54.223548+00
224	independent_and_dependent_clauses	15	2022-04-11 22:45:54.224653+00	2022-04-11 22:45:54.224653+00
225	punctuation	15	2022-04-11 22:45:54.225588+00	2022-04-11 22:45:54.225588+00
226	verb_tense	15	2022-04-11 22:45:54.226523+00	2022-04-11 22:45:54.226523+00
227	subject_verb_agreement	15	2022-04-11 22:45:54.227533+00	2022-04-11 22:45:54.227533+00
228	specificity_and_coherence	15	2022-04-11 22:45:54.228608+00	2022-04-11 22:45:54.228608+00
229	plagiarism	15	2022-04-11 22:45:54.229744+00	2022-04-11 22:45:54.229744+00
230	nonnvarying_sentence_length	15	2022-04-11 22:45:54.230655+00	2022-04-11 22:45:54.230655+00
231	wordiness	15	2022-04-11 22:45:54.231851+00	2022-04-11 22:45:54.231851+00
232	grammatical_errors	15	2022-04-11 22:45:54.232725+00	2022-04-11 22:45:54.232725+00
233	common_requests	15	2022-04-11 22:45:54.23359+00	2022-04-11 22:45:54.23359+00
234	inference	13	2022-04-11 22:45:54.23445+00	2022-04-11 22:45:54.23445+00
235	integumentary	24	2022-04-11 22:45:54.235353+00	2022-04-11 22:45:54.235353+00
236	little_detail	13	2022-04-11 22:45:54.236205+00	2022-04-11 22:45:54.236205+00
237	lymphatic	24	2022-04-11 22:45:54.237615+00	2022-04-11 22:45:54.237615+00
238	muscular	24	2022-04-11 22:45:54.238711+00	2022-04-11 22:45:54.238711+00
239	nervous	24	2022-04-11 22:45:54.23969+00	2022-04-11 22:45:54.23969+00
240	probingqs	23	2022-04-11 22:45:54.240562+00	2022-04-11 22:45:54.240562+00
241	questions	23	2022-04-11 22:45:54.241441+00	2022-04-11 22:45:54.241441+00
242	reproductive	24	2022-04-11 22:45:54.242339+00	2022-04-11 22:45:54.242339+00
243	respiratory	24	2022-04-11 22:45:54.243284+00	2022-04-11 22:45:54.243284+00
244	sense_organs	24	2022-04-11 22:45:54.244162+00	2022-04-11 22:45:54.244162+00
245	skeletal	24	2022-04-11 22:45:54.244981+00	2022-04-11 22:45:54.244981+00
246	texttype	23	2022-04-11 22:45:54.24595+00	2022-04-11 22:45:54.24595+00
247	tissues	24	2022-04-11 22:45:54.246976+00	2022-04-11 22:45:54.246976+00
248	urinary	24	2022-04-11 22:45:54.247977+00	2022-04-11 22:45:54.247977+00
249	vocab_in_context	13	2022-04-11 22:45:54.248864+00	2022-04-11 22:45:54.248864+00
250	vocabulary	23	2022-04-11 22:45:54.249805+00	2022-04-11 22:45:54.249805+00
251	activatebk	23	2022-04-11 22:45:54.250705+00	2022-04-11 22:45:54.250705+00
252	author_technique	13	2022-04-11 22:45:54.2517+00	2022-04-11 22:45:54.2517+00
253	backgroundknowledge	23	2022-04-11 22:45:54.252662+00	2022-04-11 22:45:54.252662+00
254	big_picture	13	2022-04-11 22:45:54.25377+00	2022-04-11 22:45:54.25377+00
255	cells	24	2022-04-11 22:45:54.255473+00	2022-04-11 22:45:54.255473+00
256	circulatory_system	24	2022-04-11 22:45:54.256863+00	2022-04-11 22:45:54.256863+00
257	comprehensionsupport	23	2022-04-11 22:45:54.258074+00	2022-04-11 22:45:54.258074+00
258	context	23	2022-04-11 22:45:54.259194+00	2022-04-11 22:45:54.259194+00
259	corrections	23	2022-04-11 22:45:54.26024+00	2022-04-11 22:45:54.26024+00
260	digestive	24	2022-04-11 22:45:54.261289+00	2022-04-11 22:45:54.261289+00
261	editing	23	2022-04-11 22:45:54.262283+00	2022-04-11 22:45:54.262283+00
262	endocrine	24	2022-04-11 22:45:54.263589+00	2022-04-11 22:45:54.263589+00
263	evidence_support	13	2022-04-11 22:45:54.264841+00	2022-04-11 22:45:54.264841+00
264	function	13	2022-04-11 22:45:54.265983+00	2022-04-11 22:45:54.265983+00
265	strategies	12	2022-04-11 22:45:54.26697+00	2022-04-11 22:45:54.26697+00
266	unit circle	18	2022-04-11 22:45:54.268055+00	2022-04-11 22:45:54.268055+00
267	dynamics 1	6	2022-04-11 22:45:54.269144+00	2022-04-11 22:45:54.269144+00
268	energy 1	6	2022-04-11 22:45:54.270125+00	2022-04-11 22:45:54.270125+00
269	dynamics 2	6	2022-04-11 22:45:54.271197+00	2022-04-11 22:45:54.271197+00
270	energy 2	6	2022-04-11 22:45:54.27221+00	2022-04-11 22:45:54.27221+00
271	pythagorean theorem	18	2022-04-11 22:45:54.273194+00	2022-04-11 22:45:54.273194+00
272	degrees and radians	18	2022-04-11 22:45:54.274292+00	2022-04-11 22:45:54.274292+00
273	graphing trig functions	18	2022-04-11 22:45:54.2753+00	2022-04-11 22:45:54.2753+00
274	inverse trig functions	18	2022-04-11 22:45:54.27628+00	2022-04-11 22:45:54.27628+00
275	trigonometric identities	18	2022-04-11 22:45:54.277352+00	2022-04-11 22:45:54.277352+00
276	complex numbers	19	2022-04-11 22:45:54.278491+00	2022-04-11 22:45:54.278491+00
277	conic sections	19	2022-04-11 22:45:54.279605+00	2022-04-11 22:45:54.279605+00
278	graphing exponential functions	19	2022-04-11 22:45:54.280671+00	2022-04-11 22:45:54.280671+00
279	graphing polynomials	19	2022-04-11 22:45:54.281735+00	2022-04-11 22:45:54.281735+00
280	graphing rational functions	19	2022-04-11 22:45:54.282884+00	2022-04-11 22:45:54.282884+00
281	logarithms	19	2022-04-11 22:45:54.283909+00	2022-04-11 22:45:54.283909+00
282	inverse functions	19	2022-04-11 22:45:54.285022+00	2022-04-11 22:45:54.285022+00
283	polynomial division	19	2022-04-11 22:45:54.286076+00	2022-04-11 22:45:54.286076+00
284	rational expressions	19	2022-04-11 22:45:54.287391+00	2022-04-11 22:45:54.287391+00
285	sequences series	19	2022-04-11 22:45:54.288687+00	2022-04-11 22:45:54.288687+00
286	exponential logarithmic equations	19	2022-04-11 22:45:54.290179+00	2022-04-11 22:45:54.290179+00
287	other equations	19	2022-04-11 22:45:54.291287+00	2022-04-11 22:45:54.291287+00
288	quadratic and absolute	19	2022-04-11 22:45:54.292317+00	2022-04-11 22:45:54.292317+00
289	solving quadratic equations	19	2022-04-11 22:45:54.293301+00	2022-04-11 22:45:54.293301+00
290	transformations functions	19	2022-04-11 22:45:54.294278+00	2022-04-11 22:45:54.294278+00
291	vectors	19	2022-04-11 22:45:54.295406+00	2022-04-11 22:45:54.295406+00
292	trig functions	18	2022-04-11 22:45:54.296567+00	2022-04-11 22:45:54.296567+00
293	random variables and distributions	2	2022-04-11 22:45:54.297836+00	2022-04-11 22:45:54.297836+00
294	kinematics 2	6	2022-04-11 22:45:54.298925+00	2022-04-11 22:45:54.298925+00
295	DC Circuits	6	2022-04-11 22:45:54.299889+00	2022-04-11 22:45:54.299889+00
296	rotational motion	6	2022-04-11 22:45:54.300985+00	2022-04-11 22:45:54.300985+00
297	polynomials	12	2022-04-11 22:45:54.302006+00	2022-04-11 22:45:54.302006+00
298	functions	12	2022-04-11 22:45:54.303025+00	2022-04-11 22:45:54.303025+00
299	angles	12	2022-04-11 22:45:54.304079+00	2022-04-11 22:45:54.304079+00
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
1	This student was extremely rude or inappropriate	2022-04-11 22:45:54.426495+00	2022-04-11 22:45:54.426495+00
2	I am worried for the immediate safety of this student	2022-04-11 22:45:54.42789+00	2022-04-11 22:45:54.42789+00
3	LEGACY: Student was unresponsive	2022-04-11 22:45:54.428869+00	2022-04-11 22:45:54.428869+00
4	LEGACY: Technical issue	2022-04-11 22:45:54.429972+00	2022-04-11 22:45:54.429972+00
5	LEGACY: Other	2022-04-11 22:45:54.431178+00	2022-04-11 22:45:54.431178+00
\.


--
-- Data for Name: required_email_domains; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) FROM stdin;
01801ace-1083-520e-7d31-0df4c36c2ce3	mailtrap.com	01801ace-1081-b1a0-57a5-3ab7c783d79e	2022-04-11 22:45:53.924885+00	2022-04-11 22:45:53.924885+00
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
1	Absent student	2022-04-11 22:45:54.415451+00	2022-04-11 22:45:54.415451+00
2	Absent volunteer	2022-04-11 22:45:54.416478+00	2022-04-11 22:45:54.416478+00
3	Low session rating from coach	2022-04-11 22:45:54.417293+00	2022-04-11 22:45:54.417293+00
4	Low session rating from student	2022-04-11 22:45:54.41818+00	2022-04-11 22:45:54.41818+00
5	Low coach rating from student	2022-04-11 22:45:54.418998+00	2022-04-11 22:45:54.418998+00
6	Reported	2022-04-11 22:45:54.419914+00	2022-04-11 22:45:54.419914+00
7	Only looking for answers	2022-04-11 22:45:54.421015+00	2022-04-11 22:45:54.421015+00
8	Rude or inappropriate	2022-04-11 22:45:54.421944+00	2022-04-11 22:45:54.421944+00
9	Comment from student	2022-04-11 22:45:54.422769+00	2022-04-11 22:45:54.422769+00
10	Comment from volunteer	2022-04-11 22:45:54.423689+00	2022-04-11 22:45:54.423689+00
11	Has been unmatched	2022-04-11 22:45:54.42452+00	2022-04-11 22:45:54.42452+00
12	Has had technical issues	2022-04-11 22:45:54.425401+00	2022-04-11 22:45:54.425401+00
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
01801ace-107d-2634-400a-673b01ede814	Brooklyn	01801ace-1079-bbcd-65bb-2a634780b287	2022-04-11 22:45:53.918735+00	2022-04-11 22:45:53.918735+00
01801ace-107d-1425-2bbd-99be07a683b9	Denver	01801ace-1079-bbcd-65bb-2a634780b287	2022-04-11 22:45:53.92021+00	2022-04-11 22:45:53.92021+00
01801ace-107d-6f30-7915-1093b20d8667	Oakland	01801ace-1079-bbcd-65bb-2a634780b287	2022-04-11 22:45:53.921366+00	2022-04-11 22:45:53.921366+00
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
01801ace-26f9-92ec-4af7-b187ae7ba48a	\N	01801ace-2690-1b02-196c-7fc727478e4c	\N	\N	\N	\N	\N	2022-04-11 22:45:59.677937+00	2022-04-11 22:45:59.677937+00
01801ace-26f9-e8b6-e1a8-12324d4d4f83	\N	01801ace-2690-464c-3df5-45ee2c9f2ad5	\N	\N	\N	\N	\N	2022-04-11 22:45:59.679125+00	2022-04-11 22:45:59.679125+00
01801ace-26f9-4f95-a152-932bc34f93c3	\N	\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.680092+00	2022-04-11 22:45:59.680092+00
\.


--
-- Data for Name: training_courses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.training_courses (id, name, created_at, updated_at) FROM stdin;
1	upchieve101	2022-04-11 22:45:53.93031+00	2022-04-11 22:45:53.93031+00
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
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	1	2022-04-11 22:45:59.600404+00	2022-04-11 22:45:59.600404+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	16	2022-04-11 22:45:59.601602+00	2022-04-11 22:45:59.601602+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	17	2022-04-11 22:45:59.602914+00	2022-04-11 22:45:59.602914+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	11	2022-04-11 22:45:59.603878+00	2022-04-11 22:45:59.603878+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	4	2022-04-11 22:45:59.604849+00	2022-04-11 22:45:59.604849+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	20	2022-04-11 22:45:59.605765+00	2022-04-11 22:45:59.605765+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	5	2022-04-11 22:45:59.606764+00	2022-04-11 22:45:59.606764+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	9	2022-04-11 22:45:59.60781+00	2022-04-11 22:45:59.60781+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	3	2022-04-11 22:45:59.608715+00	2022-04-11 22:45:59.608715+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	6	2022-04-11 22:45:59.609649+00	2022-04-11 22:45:59.609649+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	19	2022-04-11 22:45:59.610487+00	2022-04-11 22:45:59.610487+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	18	2022-04-11 22:45:59.611366+00	2022-04-11 22:45:59.611366+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	15	2022-04-11 22:45:59.612405+00	2022-04-11 22:45:59.612405+00
01801ace-269f-3154-7703-1c7ceda68b2b	1	2022-04-11 22:45:59.613291+00	2022-04-11 22:45:59.613291+00
01801ace-269f-3154-7703-1c7ceda68b2b	16	2022-04-11 22:45:59.614185+00	2022-04-11 22:45:59.614185+00
01801ace-269f-3154-7703-1c7ceda68b2b	17	2022-04-11 22:45:59.615089+00	2022-04-11 22:45:59.615089+00
01801ace-269f-3154-7703-1c7ceda68b2b	10	2022-04-11 22:45:59.616017+00	2022-04-11 22:45:59.616017+00
01801ace-269f-3154-7703-1c7ceda68b2b	4	2022-04-11 22:45:59.616861+00	2022-04-11 22:45:59.616861+00
01801ace-269f-3154-7703-1c7ceda68b2b	20	2022-04-11 22:45:59.617797+00	2022-04-11 22:45:59.617797+00
01801ace-269f-3154-7703-1c7ceda68b2b	5	2022-04-11 22:45:59.618585+00	2022-04-11 22:45:59.618585+00
01801ace-269f-3154-7703-1c7ceda68b2b	9	2022-04-11 22:45:59.619381+00	2022-04-11 22:45:59.619381+00
01801ace-269f-3154-7703-1c7ceda68b2b	3	2022-04-11 22:45:59.620266+00	2022-04-11 22:45:59.620266+00
01801ace-269f-3154-7703-1c7ceda68b2b	6	2022-04-11 22:45:59.621145+00	2022-04-11 22:45:59.621145+00
01801ace-269f-3154-7703-1c7ceda68b2b	11	2022-04-11 22:45:59.62205+00	2022-04-11 22:45:59.62205+00
01801ace-269f-3154-7703-1c7ceda68b2b	19	2022-04-11 22:45:59.622852+00	2022-04-11 22:45:59.622852+00
01801ace-269f-3154-7703-1c7ceda68b2b	18	2022-04-11 22:45:59.623695+00	2022-04-11 22:45:59.623695+00
01801ace-269f-7c70-8f18-0f380e0034ce	1	2022-04-11 22:45:59.624658+00	2022-04-11 22:45:59.624658+00
01801ace-269f-7c70-8f18-0f380e0034ce	16	2022-04-11 22:45:59.625573+00	2022-04-11 22:45:59.625573+00
01801ace-269f-7c70-8f18-0f380e0034ce	17	2022-04-11 22:45:59.626472+00	2022-04-11 22:45:59.626472+00
01801ace-269f-7c70-8f18-0f380e0034ce	10	2022-04-11 22:45:59.627377+00	2022-04-11 22:45:59.627377+00
01801ace-269f-7c70-8f18-0f380e0034ce	4	2022-04-11 22:45:59.628402+00	2022-04-11 22:45:59.628402+00
01801ace-269f-7c70-8f18-0f380e0034ce	20	2022-04-11 22:45:59.629492+00	2022-04-11 22:45:59.629492+00
01801ace-269f-7c70-8f18-0f380e0034ce	5	2022-04-11 22:45:59.630494+00	2022-04-11 22:45:59.630494+00
01801ace-269f-7c70-8f18-0f380e0034ce	9	2022-04-11 22:45:59.631331+00	2022-04-11 22:45:59.631331+00
01801ace-269f-7c70-8f18-0f380e0034ce	3	2022-04-11 22:45:59.63222+00	2022-04-11 22:45:59.63222+00
01801ace-269f-7c70-8f18-0f380e0034ce	6	2022-04-11 22:45:59.633063+00	2022-04-11 22:45:59.633063+00
01801ace-269f-7c70-8f18-0f380e0034ce	11	2022-04-11 22:45:59.633906+00	2022-04-11 22:45:59.633906+00
01801ace-269f-7c70-8f18-0f380e0034ce	19	2022-04-11 22:45:59.634797+00	2022-04-11 22:45:59.634797+00
01801ace-269f-7c70-8f18-0f380e0034ce	18	2022-04-11 22:45:59.6357+00	2022-04-11 22:45:59.6357+00
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
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	1	1	t	2022-04-11 22:45:59.636612+00	2022-04-11 22:45:59.636612+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	16	1	t	2022-04-11 22:45:59.637836+00	2022-04-11 22:45:59.637836+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	17	1	t	2022-04-11 22:45:59.638725+00	2022-04-11 22:45:59.638725+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	10	1	t	2022-04-11 22:45:59.639743+00	2022-04-11 22:45:59.639743+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	4	1	t	2022-04-11 22:45:59.640735+00	2022-04-11 22:45:59.640735+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	20	1	t	2022-04-11 22:45:59.641639+00	2022-04-11 22:45:59.641639+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	5	1	t	2022-04-11 22:45:59.642566+00	2022-04-11 22:45:59.642566+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	9	1	t	2022-04-11 22:45:59.643464+00	2022-04-11 22:45:59.643464+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	3	1	t	2022-04-11 22:45:59.644326+00	2022-04-11 22:45:59.644326+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	6	1	t	2022-04-11 22:45:59.645283+00	2022-04-11 22:45:59.645283+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	11	1	t	2022-04-11 22:45:59.646204+00	2022-04-11 22:45:59.646204+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	19	1	t	2022-04-11 22:45:59.647115+00	2022-04-11 22:45:59.647115+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	18	1	t	2022-04-11 22:45:59.648017+00	2022-04-11 22:45:59.648017+00
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	15	1	t	2022-04-11 22:45:59.648882+00	2022-04-11 22:45:59.648882+00
01801ace-269f-3154-7703-1c7ceda68b2b	1	1	t	2022-04-11 22:45:59.649758+00	2022-04-11 22:45:59.649758+00
01801ace-269f-3154-7703-1c7ceda68b2b	16	1	t	2022-04-11 22:45:59.650636+00	2022-04-11 22:45:59.650636+00
01801ace-269f-3154-7703-1c7ceda68b2b	17	1	t	2022-04-11 22:45:59.651449+00	2022-04-11 22:45:59.651449+00
01801ace-269f-3154-7703-1c7ceda68b2b	10	1	t	2022-04-11 22:45:59.652233+00	2022-04-11 22:45:59.652233+00
01801ace-269f-3154-7703-1c7ceda68b2b	4	1	t	2022-04-11 22:45:59.653247+00	2022-04-11 22:45:59.653247+00
01801ace-269f-3154-7703-1c7ceda68b2b	20	1	t	2022-04-11 22:45:59.654168+00	2022-04-11 22:45:59.654168+00
01801ace-269f-3154-7703-1c7ceda68b2b	5	1	t	2022-04-11 22:45:59.655006+00	2022-04-11 22:45:59.655006+00
01801ace-269f-3154-7703-1c7ceda68b2b	9	1	t	2022-04-11 22:45:59.655882+00	2022-04-11 22:45:59.655882+00
01801ace-269f-3154-7703-1c7ceda68b2b	3	1	t	2022-04-11 22:45:59.656805+00	2022-04-11 22:45:59.656805+00
01801ace-269f-3154-7703-1c7ceda68b2b	6	1	t	2022-04-11 22:45:59.657755+00	2022-04-11 22:45:59.657755+00
01801ace-269f-3154-7703-1c7ceda68b2b	11	1	t	2022-04-11 22:45:59.658704+00	2022-04-11 22:45:59.658704+00
01801ace-269f-3154-7703-1c7ceda68b2b	19	1	t	2022-04-11 22:45:59.659629+00	2022-04-11 22:45:59.659629+00
01801ace-269f-3154-7703-1c7ceda68b2b	18	1	t	2022-04-11 22:45:59.660491+00	2022-04-11 22:45:59.660491+00
01801ace-269f-7c70-8f18-0f380e0034ce	1	1	t	2022-04-11 22:45:59.66143+00	2022-04-11 22:45:59.66143+00
01801ace-269f-7c70-8f18-0f380e0034ce	16	1	t	2022-04-11 22:45:59.662312+00	2022-04-11 22:45:59.662312+00
01801ace-269f-7c70-8f18-0f380e0034ce	17	1	t	2022-04-11 22:45:59.66323+00	2022-04-11 22:45:59.66323+00
01801ace-269f-7c70-8f18-0f380e0034ce	10	1	t	2022-04-11 22:45:59.664129+00	2022-04-11 22:45:59.664129+00
01801ace-269f-7c70-8f18-0f380e0034ce	4	1	t	2022-04-11 22:45:59.664982+00	2022-04-11 22:45:59.664982+00
01801ace-269f-7c70-8f18-0f380e0034ce	20	1	t	2022-04-11 22:45:59.665854+00	2022-04-11 22:45:59.665854+00
01801ace-269f-7c70-8f18-0f380e0034ce	5	1	t	2022-04-11 22:45:59.666703+00	2022-04-11 22:45:59.666703+00
01801ace-269f-7c70-8f18-0f380e0034ce	9	1	t	2022-04-11 22:45:59.667675+00	2022-04-11 22:45:59.667675+00
01801ace-269f-7c70-8f18-0f380e0034ce	3	1	t	2022-04-11 22:45:59.668539+00	2022-04-11 22:45:59.668539+00
01801ace-269f-7c70-8f18-0f380e0034ce	6	1	t	2022-04-11 22:45:59.669383+00	2022-04-11 22:45:59.669383+00
01801ace-269f-7c70-8f18-0f380e0034ce	11	1	t	2022-04-11 22:45:59.670355+00	2022-04-11 22:45:59.670355+00
01801ace-269f-7c70-8f18-0f380e0034ce	19	1	t	2022-04-11 22:45:59.671231+00	2022-04-11 22:45:59.671231+00
01801ace-269f-7c70-8f18-0f380e0034ce	18	1	t	2022-04-11 22:45:59.6722+00	2022-04-11 22:45:59.6722+00
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
01801ace-269f-4fb7-cb61-4b3eb6ab4b1a	\N	America/New_York	t	t	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.593124+00	2022-04-11 22:45:59.593124+00	\N	\N
01801ace-269f-3154-7703-1c7ceda68b2b	\N	America/New_York	t	t	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.59468+00	2022-04-11 22:45:59.59468+00	\N	\N
01801ace-269f-7c70-8f18-0f380e0034ce	\N	America/Denver	t	t	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.595873+00	2022-04-11 22:45:59.595873+00	\N	\N
01801ace-269f-7470-b42f-cf64351b4f2c	\N	America/New_York	t	f	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.597062+00	2022-04-11 22:45:59.597062+00	\N	\N
01801ace-269f-acf7-3c9a-43f3785160ea	\N	America/New_York	f	f	\N	\N	\N	Volunteer College	\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.598169+00	2022-04-11 22:45:59.598169+00	\N	\N
01801ace-269f-00dc-79eb-17d6f0e20d79	\N	America/New_York	t	t	\N	\N	\N		\N	\N	\N	\N	\N	\N	2022-04-11 22:45:59.59934+00	2022-04-11 22:45:59.59934+00	\N	\N
\.


--
-- Data for Name: volunteer_reference_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_reference_statuses (id, name, created_at, updated_at) FROM stdin;
1	sent	2022-04-11 22:45:53.931668+00	2022-04-11 22:45:53.931668+00
2	submitted	2022-04-11 22:45:53.93288+00	2022-04-11 22:45:53.93288+00
3	approved	2022-04-11 22:45:53.933815+00	2022-04-11 22:45:53.933815+00
4	rejected	2022-04-11 22:45:53.934724+00	2022-04-11 22:45:53.934724+00
5	removed	2022-04-11 22:45:53.935627+00	2022-04-11 22:45:53.935627+00
6	unsent	2022-04-11 22:45:53.936765+00	2022-04-11 22:45:53.936765+00
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

SELECT pg_catalog.setval('upchieve.cities_id_seq', 2, true);


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

