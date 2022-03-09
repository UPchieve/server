--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1 (Debian 14.1-1.pgdg110+1)
-- Dumped by pg_dump version 14.1

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
1	non us signup	2022-03-07 23:14:02.465851+00	2022-03-07 23:14:02.465851+00
2	session reported	2022-03-07 23:14:02.467341+00	2022-03-07 23:14:02.467341+00
3	used banned ip	2022-03-07 23:14:02.468553+00	2022-03-07 23:14:02.468553+00
4	admin	2022-03-07 23:14:02.469974+00	2022-03-07 23:14:02.469974+00
\.


--
-- Data for Name: signup_sources; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.signup_sources (id, name, created_at, updated_at) FROM stdin;
1	Web search	2022-03-07 23:14:02.471236+00	2022-03-07 23:14:02.471236+00
2	Social media	2022-03-07 23:14:02.472621+00	2022-03-07 23:14:02.472621+00
3	Friend / Classmate	2022-03-07 23:14:02.474017+00	2022-03-07 23:14:02.474017+00
4	School / Teacher	2022-03-07 23:14:02.475317+00	2022-03-07 23:14:02.475317+00
5	Parent / Relative	2022-03-07 23:14:02.47641+00	2022-03-07 23:14:02.47641+00
6	Other	2022-03-07 23:14:02.477684+00	2022-03-07 23:14:02.477684+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.users (id, verified, email_verified, phone_verified, email, password, password_reset_token, first_name, last_name, deactivated, last_activity_at, referral_code, referred_by, test_user, banned, ban_reason_id, time_tutored, signup_source_id, created_at, updated_at, phone, mongo_id) FROM stdin;
\.


--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.admin_profiles (user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tool_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.tool_types (id, name, created_at, updated_at) FROM stdin;
1	whiteboard	2022-03-07 23:14:02.52176+00	2022-03-07 23:14:02.52176+00
2	documenteditor	2022-03-07 23:14:02.523092+00	2022-03-07 23:14:02.523092+00
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.topics (id, name, icon_link, color, dashboard_order, display_name, created_at, updated_at) FROM stdin;
1	math	\N	\N	1	Math	2022-03-07 23:14:02.514592+00	2022-03-07 23:14:02.514592+00
2	science	\N	\N	4	Science	2022-03-07 23:14:02.516233+00	2022-03-07 23:14:02.516233+00
3	college	\N	\N	3	College Counseling	2022-03-07 23:14:02.517601+00	2022-03-07 23:14:02.517601+00
4	sat	\N	\N	2	Standardized Testing	2022-03-07 23:14:02.518923+00	2022-03-07 23:14:02.518923+00
5	readingWriting	\N	\N	5	Reading and Writing	2022-03-07 23:14:02.520292+00	2022-03-07 23:14:02.520292+00
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.subjects (id, name, display_name, display_order, topic_id, tool_type_id, created_at, updated_at) FROM stdin;
1	prealgebra	Prealgebra	1	1	1	2022-03-07 23:14:02.524672+00	2022-03-07 23:14:02.524672+00
2	algebraOne	Algebra 1	2	1	1	2022-03-07 23:14:02.526246+00	2022-03-07 23:14:02.526246+00
3	algebraTwo	Algebra 2	3	1	1	2022-03-07 23:14:02.527557+00	2022-03-07 23:14:02.527557+00
4	geometry	Geometry	4	1	1	2022-03-07 23:14:02.52916+00	2022-03-07 23:14:02.52916+00
5	trigonometry	Trigonometry	5	1	1	2022-03-07 23:14:02.530443+00	2022-03-07 23:14:02.530443+00
6	precalculus	Precalculus	6	1	1	2022-03-07 23:14:02.532123+00	2022-03-07 23:14:02.532123+00
7	calculusAB	Calculus AB	7	1	1	2022-03-07 23:14:02.533809+00	2022-03-07 23:14:02.533809+00
8	calculusBC	Calculus BC	8	1	1	2022-03-07 23:14:02.535568+00	2022-03-07 23:14:02.535568+00
9	statistics	Statistics	9	1	1	2022-03-07 23:14:02.536782+00	2022-03-07 23:14:02.536782+00
10	biology	Biology	1	2	1	2022-03-07 23:14:02.538306+00	2022-03-07 23:14:02.538306+00
11	chemistry	Chemistry	2	2	1	2022-03-07 23:14:02.539643+00	2022-03-07 23:14:02.539643+00
12	physicsOne	Physics 1	3	2	1	2022-03-07 23:14:02.540945+00	2022-03-07 23:14:02.540945+00
13	physicsTwo	Physics 2	4	2	1	2022-03-07 23:14:02.542199+00	2022-03-07 23:14:02.542199+00
14	environmentalScience	Environmental Science	5	2	1	2022-03-07 23:14:02.543526+00	2022-03-07 23:14:02.543526+00
15	satMath	SAT Math	1	4	1	2022-03-07 23:14:02.544691+00	2022-03-07 23:14:02.544691+00
16	satReading	SAT Reading	2	4	2	2022-03-07 23:14:02.545873+00	2022-03-07 23:14:02.545873+00
17	essays	College Essays	2	3	2	2022-03-07 23:14:02.547021+00	2022-03-07 23:14:02.547021+00
18	planning	Planning	1	3	2	2022-03-07 23:14:02.548168+00	2022-03-07 23:14:02.548168+00
19	applications	Applications	3	3	2	2022-03-07 23:14:02.54932+00	2022-03-07 23:14:02.54932+00
20	humanitiesEssays	Humanities Essays	1	5	2	2022-03-07 23:14:02.550699+00	2022-03-07 23:14:02.550699+00
21	integratedMathOne	Integrated Math One	9	1	1	2022-03-07 23:14:02.551806+00	2022-03-07 23:14:02.551806+00
22	integratedMathTwo	Integrated Math Two	9	1	1	2022-03-07 23:14:02.552909+00	2022-03-07 23:14:02.552909+00
23	integratedMathThree	Integrated Math Three	9	1	1	2022-03-07 23:14:02.554117+00	2022-03-07 23:14:02.554117+00
24	integratedMathFour	Integrated Math Four	9	1	1	2022-03-07 23:14:02.555408+00	2022-03-07 23:14:02.555408+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_roles (id, name, created_at, updated_at) FROM stdin;
1	student	2022-03-07 23:14:02.461133+00	2022-03-07 23:14:02.461133+00
2	volunteer	2022-03-07 23:14:02.462665+00	2022-03-07 23:14:02.462665+00
3	admin	2022-03-07 23:14:02.464294+00	2022-03-07 23:14:02.464294+00
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sessions (id, student_id, volunteer_id, subject_id, has_whiteboard_doc, quill_doc, volunteer_joined_at, ended_at, ended_by_role_id, reviewed, to_review, student_banned, time_tutored, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: assistments_data; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.assistments_data (id, problem_id, assignment_id, student_id, session_id, sent, created_at, updated_at, sent_at) FROM stdin;
\.


--
-- Data for Name: weekdays; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.weekdays (id, day, created_at, updated_at) FROM stdin;
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
1	prealgebra	2022-03-07 23:14:02.61493+00	2022-03-07 23:14:02.61493+00
2	statistics	2022-03-07 23:14:02.616439+00	2022-03-07 23:14:02.616439+00
3	geometry	2022-03-07 23:14:02.617764+00	2022-03-07 23:14:02.617764+00
4	biology	2022-03-07 23:14:02.6191+00	2022-03-07 23:14:02.6191+00
5	chemistry	2022-03-07 23:14:02.62036+00	2022-03-07 23:14:02.62036+00
6	physicsOne	2022-03-07 23:14:02.62164+00	2022-03-07 23:14:02.62164+00
7	physicsTwo	2022-03-07 23:14:02.622886+00	2022-03-07 23:14:02.622886+00
8	environmentalScience	2022-03-07 23:14:02.623964+00	2022-03-07 23:14:02.623964+00
9	essays	2022-03-07 23:14:02.62498+00	2022-03-07 23:14:02.62498+00
10	applications	2022-03-07 23:14:02.626078+00	2022-03-07 23:14:02.626078+00
11	planning	2022-03-07 23:14:02.627122+00	2022-03-07 23:14:02.627122+00
12	satMath	2022-03-07 23:14:02.628169+00	2022-03-07 23:14:02.628169+00
13	satReading	2022-03-07 23:14:02.62929+00	2022-03-07 23:14:02.62929+00
14	collegeCounseling	2022-03-07 23:14:02.630492+00	2022-03-07 23:14:02.630492+00
15	humanitiesEssays	2022-03-07 23:14:02.631555+00	2022-03-07 23:14:02.631555+00
16	algebraOne	2022-03-07 23:14:02.632651+00	2022-03-07 23:14:02.632651+00
17	algebraTwo	2022-03-07 23:14:02.633624+00	2022-03-07 23:14:02.633624+00
18	trigonometry	2022-03-07 23:14:02.634737+00	2022-03-07 23:14:02.634737+00
19	precalculus	2022-03-07 23:14:02.635639+00	2022-03-07 23:14:02.635639+00
20	calculusAB	2022-03-07 23:14:02.636627+00	2022-03-07 23:14:02.636627+00
21	calculusBC	2022-03-07 23:14:02.637597+00	2022-03-07 23:14:02.637597+00
\.


--
-- Data for Name: certification_subject_unlocks; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.certification_subject_unlocks (subject_id, certification_id, created_at, updated_at) FROM stdin;
21	16	2022-03-07 23:14:02.677564+00	2022-03-07 23:14:02.677564+00
21	3	2022-03-07 23:14:02.678831+00	2022-03-07 23:14:02.678831+00
21	2	2022-03-07 23:14:02.679898+00	2022-03-07 23:14:02.679898+00
22	16	2022-03-07 23:14:02.681074+00	2022-03-07 23:14:02.681074+00
22	3	2022-03-07 23:14:02.682275+00	2022-03-07 23:14:02.682275+00
22	2	2022-03-07 23:14:02.683716+00	2022-03-07 23:14:02.683716+00
22	18	2022-03-07 23:14:02.684911+00	2022-03-07 23:14:02.684911+00
23	19	2022-03-07 23:14:02.686609+00	2022-03-07 23:14:02.686609+00
23	2	2022-03-07 23:14:02.68776+00	2022-03-07 23:14:02.68776+00
24	19	2022-03-07 23:14:02.688713+00	2022-03-07 23:14:02.688713+00
1	1	2022-03-07 23:14:02.68971+00	2022-03-07 23:14:02.68971+00
9	2	2022-03-07 23:14:02.69069+00	2022-03-07 23:14:02.69069+00
4	3	2022-03-07 23:14:02.691637+00	2022-03-07 23:14:02.691637+00
10	4	2022-03-07 23:14:02.692571+00	2022-03-07 23:14:02.692571+00
11	5	2022-03-07 23:14:02.693416+00	2022-03-07 23:14:02.693416+00
12	6	2022-03-07 23:14:02.694402+00	2022-03-07 23:14:02.694402+00
13	7	2022-03-07 23:14:02.695314+00	2022-03-07 23:14:02.695314+00
14	8	2022-03-07 23:14:02.696274+00	2022-03-07 23:14:02.696274+00
17	9	2022-03-07 23:14:02.697273+00	2022-03-07 23:14:02.697273+00
19	10	2022-03-07 23:14:02.698141+00	2022-03-07 23:14:02.698141+00
18	11	2022-03-07 23:14:02.699148+00	2022-03-07 23:14:02.699148+00
15	12	2022-03-07 23:14:02.700004+00	2022-03-07 23:14:02.700004+00
16	13	2022-03-07 23:14:02.700916+00	2022-03-07 23:14:02.700916+00
20	15	2022-03-07 23:14:02.701803+00	2022-03-07 23:14:02.701803+00
2	16	2022-03-07 23:14:02.70263+00	2022-03-07 23:14:02.70263+00
3	17	2022-03-07 23:14:02.703583+00	2022-03-07 23:14:02.703583+00
5	18	2022-03-07 23:14:02.704801+00	2022-03-07 23:14:02.704801+00
6	19	2022-03-07 23:14:02.705846+00	2022-03-07 23:14:02.705846+00
7	20	2022-03-07 23:14:02.706811+00	2022-03-07 23:14:02.706811+00
8	21	2022-03-07 23:14:02.707745+00	2022-03-07 23:14:02.707745+00
\.


--
-- Data for Name: us_states; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.us_states (code, name, created_at, updated_at) FROM stdin;
AL	Alabama	2022-03-07 23:14:02.39828+00	2022-03-07 23:14:02.39828+00
AK	Alaska	2022-03-07 23:14:02.403286+00	2022-03-07 23:14:02.403286+00
AR	Arkansas	2022-03-07 23:14:02.40495+00	2022-03-07 23:14:02.40495+00
AZ	Arizona	2022-03-07 23:14:02.406139+00	2022-03-07 23:14:02.406139+00
CA	California	2022-03-07 23:14:02.407212+00	2022-03-07 23:14:02.407212+00
CO	Colorado	2022-03-07 23:14:02.408451+00	2022-03-07 23:14:02.408451+00
CT	Connecticut	2022-03-07 23:14:02.409698+00	2022-03-07 23:14:02.409698+00
DE	Delaware	2022-03-07 23:14:02.410998+00	2022-03-07 23:14:02.410998+00
DC	District of Columbia	2022-03-07 23:14:02.412172+00	2022-03-07 23:14:02.412172+00
FL	Florida	2022-03-07 23:14:02.41362+00	2022-03-07 23:14:02.41362+00
GA	Georgia	2022-03-07 23:14:02.414832+00	2022-03-07 23:14:02.414832+00
HI	Hawaii	2022-03-07 23:14:02.415982+00	2022-03-07 23:14:02.415982+00
ID	Idaho	2022-03-07 23:14:02.417291+00	2022-03-07 23:14:02.417291+00
IL	Illinois	2022-03-07 23:14:02.418474+00	2022-03-07 23:14:02.418474+00
IN	Indiana	2022-03-07 23:14:02.419642+00	2022-03-07 23:14:02.419642+00
IA	Iowa	2022-03-07 23:14:02.4208+00	2022-03-07 23:14:02.4208+00
KS	Kansas	2022-03-07 23:14:02.422118+00	2022-03-07 23:14:02.422118+00
KY	Kentucky	2022-03-07 23:14:02.42321+00	2022-03-07 23:14:02.42321+00
LA	Louisiana	2022-03-07 23:14:02.424313+00	2022-03-07 23:14:02.424313+00
ME	Maine	2022-03-07 23:14:02.425642+00	2022-03-07 23:14:02.425642+00
MD	Maryland	2022-03-07 23:14:02.426781+00	2022-03-07 23:14:02.426781+00
MA	Massachusetts	2022-03-07 23:14:02.427976+00	2022-03-07 23:14:02.427976+00
MI	Michigan	2022-03-07 23:14:02.429028+00	2022-03-07 23:14:02.429028+00
MN	Minnesota	2022-03-07 23:14:02.430012+00	2022-03-07 23:14:02.430012+00
MS	Mississippi	2022-03-07 23:14:02.431146+00	2022-03-07 23:14:02.431146+00
MO	Missouri	2022-03-07 23:14:02.432125+00	2022-03-07 23:14:02.432125+00
MT	Montana	2022-03-07 23:14:02.43313+00	2022-03-07 23:14:02.43313+00
NE	Nebraska	2022-03-07 23:14:02.434124+00	2022-03-07 23:14:02.434124+00
NV	Nevada	2022-03-07 23:14:02.43514+00	2022-03-07 23:14:02.43514+00
NH	New Hampshire	2022-03-07 23:14:02.436098+00	2022-03-07 23:14:02.436098+00
NJ	New Jersey	2022-03-07 23:14:02.437124+00	2022-03-07 23:14:02.437124+00
NM	New Mexico	2022-03-07 23:14:02.438122+00	2022-03-07 23:14:02.438122+00
NY	New York	2022-03-07 23:14:02.439096+00	2022-03-07 23:14:02.439096+00
NC	North Carolina	2022-03-07 23:14:02.440139+00	2022-03-07 23:14:02.440139+00
ND	North Dakota	2022-03-07 23:14:02.441116+00	2022-03-07 23:14:02.441116+00
OH	Ohio	2022-03-07 23:14:02.442044+00	2022-03-07 23:14:02.442044+00
OK	Oklahoma	2022-03-07 23:14:02.443197+00	2022-03-07 23:14:02.443197+00
OR	Oregon	2022-03-07 23:14:02.444466+00	2022-03-07 23:14:02.444466+00
PA	Pennsylvania	2022-03-07 23:14:02.445735+00	2022-03-07 23:14:02.445735+00
RI	Rhode Island	2022-03-07 23:14:02.446878+00	2022-03-07 23:14:02.446878+00
SC	South Carolina	2022-03-07 23:14:02.447997+00	2022-03-07 23:14:02.447997+00
SD	South Dakota	2022-03-07 23:14:02.449215+00	2022-03-07 23:14:02.449215+00
TN	Tennessee	2022-03-07 23:14:02.450369+00	2022-03-07 23:14:02.450369+00
TX	Texas	2022-03-07 23:14:02.45155+00	2022-03-07 23:14:02.45155+00
UT	Utah	2022-03-07 23:14:02.452624+00	2022-03-07 23:14:02.452624+00
VT	Vermont	2022-03-07 23:14:02.453871+00	2022-03-07 23:14:02.453871+00
VA	Virginia	2022-03-07 23:14:02.455052+00	2022-03-07 23:14:02.455052+00
WA	Washington	2022-03-07 23:14:02.456337+00	2022-03-07 23:14:02.456337+00
WV	West Virginia	2022-03-07 23:14:02.457646+00	2022-03-07 23:14:02.457646+00
WI	Wisconsin	2022-03-07 23:14:02.458788+00	2022-03-07 23:14:02.458788+00
WY	Wyoming	2022-03-07 23:14:02.459818+00	2022-03-07 23:14:02.459818+00
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.cities (id, name, us_state_code, created_at, updated_at) FROM stdin;
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
1	8	2022-03-07 23:14:02.478842+00	2022-03-07 23:14:02.478842+00
2	9	2022-03-07 23:14:02.480507+00	2022-03-07 23:14:02.480507+00
3	10	2022-03-07 23:14:02.481861+00	2022-03-07 23:14:02.481861+00
4	11	2022-03-07 23:14:02.483237+00	2022-03-07 23:14:02.483237+00
5	12	2022-03-07 23:14:02.484523+00	2022-03-07 23:14:02.484523+00
6	college	2022-03-07 23:14:02.485909+00	2022-03-07 23:14:02.485909+00
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
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools (id, name, approved, partner, city_id, us_state_code, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: ineligible_students; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.ineligible_students (id, email, postal_code, ip_address_id, school_id, grade_level_id, created_at, updated_at, mongo_id) FROM stdin;
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
1	sms	2022-03-07 23:14:02.73265+00	2022-03-07 23:14:02.73265+00
2	push	2022-03-07 23:14:02.734215+00	2022-03-07 23:14:02.734215+00
3	voice	2022-03-07 23:14:02.735449+00	2022-03-07 23:14:02.735449+00
4	email	2022-03-07 23:14:02.736458+00	2022-03-07 23:14:02.736458+00
\.


--
-- Data for Name: notification_priority_groups; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_priority_groups (id, name, priority, created_at, updated_at) FROM stdin;
1	Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"	1	2022-03-07 23:14:02.737634+00	2022-03-07 23:14:02.737634+00
2	Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"	2	2022-03-07 23:14:02.739119+00	2022-03-07 23:14:02.739119+00
3	Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"	3	2022-03-07 23:14:02.7416+00	2022-03-07 23:14:02.7416+00
4	Regular volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"	4	2022-03-07 23:14:02.74346+00	2022-03-07 23:14:02.74346+00
5	All volunteers - not notified in the last 24 hours	5	2022-03-07 23:14:02.744528+00	2022-03-07 23:14:02.744528+00
6	All volunteers - not notified in the last 60 mins	6	2022-03-07 23:14:02.745573+00	2022-03-07 23:14:02.745573+00
7	All volunteers - not notified in the last 15 mins	7	2022-03-07 23:14:02.746667+00	2022-03-07 23:14:02.746667+00
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.notification_types (id, type, created_at, updated_at) FROM stdin;
1	initial	2022-03-07 23:14:02.729809+00	2022-03-07 23:14:02.729809+00
2	followup	2022-03-07 23:14:02.731295+00	2022-03-07 23:14:02.731295+00
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
1	approved	2022-03-07 23:14:02.501307+00	2022-03-07 23:14:02.501307+00
2	submitted	2022-03-07 23:14:02.502967+00	2022-03-07 23:14:02.502967+00
3	rejected	2022-03-07 23:14:02.50455+00	2022-03-07 23:14:02.50455+00
\.


--
-- Data for Name: pre_session_surveys; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.pre_session_surveys (id, response_data, session_id, user_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quizzes (id, name, created_at, updated_at) FROM stdin;
1	prealgebra	2022-03-07 23:14:02.556633+00	2022-03-07 23:14:02.556633+00
2	statistics	2022-03-07 23:14:02.557902+00	2022-03-07 23:14:02.557902+00
3	geometry	2022-03-07 23:14:02.558947+00	2022-03-07 23:14:02.558947+00
4	biology	2022-03-07 23:14:02.560125+00	2022-03-07 23:14:02.560125+00
5	chemistry	2022-03-07 23:14:02.561074+00	2022-03-07 23:14:02.561074+00
6	physicsOne	2022-03-07 23:14:02.562232+00	2022-03-07 23:14:02.562232+00
7	physicsTwo	2022-03-07 23:14:02.563362+00	2022-03-07 23:14:02.563362+00
8	environmentalScience	2022-03-07 23:14:02.564709+00	2022-03-07 23:14:02.564709+00
9	essays	2022-03-07 23:14:02.565741+00	2022-03-07 23:14:02.565741+00
10	applications	2022-03-07 23:14:02.566821+00	2022-03-07 23:14:02.566821+00
11	planning	2022-03-07 23:14:02.567972+00	2022-03-07 23:14:02.567972+00
12	satMath	2022-03-07 23:14:02.569177+00	2022-03-07 23:14:02.569177+00
13	satReading	2022-03-07 23:14:02.570302+00	2022-03-07 23:14:02.570302+00
14	collegeCounseling	2022-03-07 23:14:02.571508+00	2022-03-07 23:14:02.571508+00
15	humanitiesEssays	2022-03-07 23:14:02.572571+00	2022-03-07 23:14:02.572571+00
16	algebraOne	2022-03-07 23:14:02.573716+00	2022-03-07 23:14:02.573716+00
17	algebraTwo	2022-03-07 23:14:02.574958+00	2022-03-07 23:14:02.574958+00
18	trigonometry	2022-03-07 23:14:02.576085+00	2022-03-07 23:14:02.576085+00
19	precalculus	2022-03-07 23:14:02.577291+00	2022-03-07 23:14:02.577291+00
20	calculusAB	2022-03-07 23:14:02.578404+00	2022-03-07 23:14:02.578404+00
21	calculusBC	2022-03-07 23:14:02.57951+00	2022-03-07 23:14:02.57951+00
\.


--
-- Data for Name: quiz_certification_grants; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_certification_grants (quiz_id, certification_id, created_at, updated_at) FROM stdin;
1	1	2022-03-07 23:14:02.638798+00	2022-03-07 23:14:02.638798+00
2	2	2022-03-07 23:14:02.640492+00	2022-03-07 23:14:02.640492+00
3	3	2022-03-07 23:14:02.641542+00	2022-03-07 23:14:02.641542+00
4	4	2022-03-07 23:14:02.642648+00	2022-03-07 23:14:02.642648+00
5	5	2022-03-07 23:14:02.64364+00	2022-03-07 23:14:02.64364+00
6	6	2022-03-07 23:14:02.644617+00	2022-03-07 23:14:02.644617+00
7	7	2022-03-07 23:14:02.645595+00	2022-03-07 23:14:02.645595+00
8	8	2022-03-07 23:14:02.646593+00	2022-03-07 23:14:02.646593+00
9	9	2022-03-07 23:14:02.647932+00	2022-03-07 23:14:02.647932+00
10	10	2022-03-07 23:14:02.64882+00	2022-03-07 23:14:02.64882+00
11	11	2022-03-07 23:14:02.649777+00	2022-03-07 23:14:02.649777+00
12	12	2022-03-07 23:14:02.650723+00	2022-03-07 23:14:02.650723+00
13	13	2022-03-07 23:14:02.651671+00	2022-03-07 23:14:02.651671+00
14	11	2022-03-07 23:14:02.652623+00	2022-03-07 23:14:02.652623+00
14	10	2022-03-07 23:14:02.653565+00	2022-03-07 23:14:02.653565+00
15	15	2022-03-07 23:14:02.65455+00	2022-03-07 23:14:02.65455+00
17	16	2022-03-07 23:14:02.655522+00	2022-03-07 23:14:02.655522+00
17	17	2022-03-07 23:14:02.656532+00	2022-03-07 23:14:02.656532+00
17	1	2022-03-07 23:14:02.657477+00	2022-03-07 23:14:02.657477+00
18	18	2022-03-07 23:14:02.658449+00	2022-03-07 23:14:02.658449+00
19	16	2022-03-07 23:14:02.659522+00	2022-03-07 23:14:02.659522+00
19	17	2022-03-07 23:14:02.660573+00	2022-03-07 23:14:02.660573+00
19	1	2022-03-07 23:14:02.661517+00	2022-03-07 23:14:02.661517+00
19	18	2022-03-07 23:14:02.662461+00	2022-03-07 23:14:02.662461+00
19	19	2022-03-07 23:14:02.663408+00	2022-03-07 23:14:02.663408+00
20	16	2022-03-07 23:14:02.6643+00	2022-03-07 23:14:02.6643+00
20	17	2022-03-07 23:14:02.665239+00	2022-03-07 23:14:02.665239+00
20	1	2022-03-07 23:14:02.666193+00	2022-03-07 23:14:02.666193+00
20	18	2022-03-07 23:14:02.667124+00	2022-03-07 23:14:02.667124+00
20	19	2022-03-07 23:14:02.668054+00	2022-03-07 23:14:02.668054+00
20	20	2022-03-07 23:14:02.669035+00	2022-03-07 23:14:02.669035+00
21	16	2022-03-07 23:14:02.669975+00	2022-03-07 23:14:02.669975+00
21	17	2022-03-07 23:14:02.670896+00	2022-03-07 23:14:02.670896+00
21	1	2022-03-07 23:14:02.671904+00	2022-03-07 23:14:02.671904+00
21	18	2022-03-07 23:14:02.673179+00	2022-03-07 23:14:02.673179+00
21	19	2022-03-07 23:14:02.674351+00	2022-03-07 23:14:02.674351+00
21	20	2022-03-07 23:14:02.67552+00	2022-03-07 23:14:02.67552+00
21	21	2022-03-07 23:14:02.676455+00	2022-03-07 23:14:02.676455+00
\.


--
-- Data for Name: quiz_subcategories; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_subcategories (id, name, quiz_id, created_at, updated_at) FROM stdin;
1	numbers	1	2022-03-07 23:14:02.580758+00	2022-03-07 23:14:02.580758+00
2	arithmetic properties	1	2022-03-07 23:14:02.582154+00	2022-03-07 23:14:02.582154+00
3	exponents	1	2022-03-07 23:14:02.583465+00	2022-03-07 23:14:02.583465+00
4	exponents and radicals	1	2022-03-07 23:14:02.58472+00	2022-03-07 23:14:02.58472+00
5	polynomials	1	2022-03-07 23:14:02.58574+00	2022-03-07 23:14:02.58574+00
6	fractions	1	2022-03-07 23:14:02.586936+00	2022-03-07 23:14:02.586936+00
7	linear equations	17	2022-03-07 23:14:02.588212+00	2022-03-07 23:14:02.588212+00
8	rational exponents and radicals	17	2022-03-07 23:14:02.589484+00	2022-03-07 23:14:02.589484+00
9	application of linear equations	17	2022-03-07 23:14:02.590642+00	2022-03-07 23:14:02.590642+00
10	two variable equations	17	2022-03-07 23:14:02.591775+00	2022-03-07 23:14:02.591775+00
11	rational expressions	17	2022-03-07 23:14:02.592916+00	2022-03-07 23:14:02.592916+00
12	complex numbers	17	2022-03-07 23:14:02.593977+00	2022-03-07 23:14:02.593977+00
13	congruence and similarity	3	2022-03-07 23:14:02.5951+00	2022-03-07 23:14:02.5951+00
14	vertices	3	2022-03-07 23:14:02.596102+00	2022-03-07 23:14:02.596102+00
15	angles	3	2022-03-07 23:14:02.597111+00	2022-03-07 23:14:02.597111+00
16	circles	3	2022-03-07 23:14:02.59815+00	2022-03-07 23:14:02.59815+00
17	triangles	3	2022-03-07 23:14:02.599426+00	2022-03-07 23:14:02.599426+00
18	rectangles	3	2022-03-07 23:14:02.600584+00	2022-03-07 23:14:02.600584+00
19	angles	18	2022-03-07 23:14:02.601619+00	2022-03-07 23:14:02.601619+00
20	triangles	18	2022-03-07 23:14:02.602756+00	2022-03-07 23:14:02.602756+00
21	right triangles	18	2022-03-07 23:14:02.603742+00	2022-03-07 23:14:02.603742+00
22	quadrants	18	2022-03-07 23:14:02.605186+00	2022-03-07 23:14:02.605186+00
23	radians	18	2022-03-07 23:14:02.606463+00	2022-03-07 23:14:02.606463+00
24	unit circles	18	2022-03-07 23:14:02.6079+00	2022-03-07 23:14:02.6079+00
25	inequalities	18	2022-03-07 23:14:02.609004+00	2022-03-07 23:14:02.609004+00
26	representing data numerically	2	2022-03-07 23:14:02.610228+00	2022-03-07 23:14:02.610228+00
27	representing data graphically	2	2022-03-07 23:14:02.611307+00	2022-03-07 23:14:02.611307+00
28	two means	2	2022-03-07 23:14:02.612525+00	2022-03-07 23:14:02.612525+00
29	representing data graphically	2	2022-03-07 23:14:02.613674+00	2022-03-07 23:14:02.613674+00
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.quiz_questions (id, question_text, possible_answers, correct_answer, quiz_subcategory_id, image_source, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: volunteer_reference_statuses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_reference_statuses (id, name, created_at, updated_at) FROM stdin;
1	sent	2022-03-07 23:14:02.507438+00	2022-03-07 23:14:02.507438+00
2	submitted	2022-03-07 23:14:02.509189+00	2022-03-07 23:14:02.509189+00
3	approved	2022-03-07 23:14:02.510594+00	2022-03-07 23:14:02.510594+00
4	rejected	2022-03-07 23:14:02.511818+00	2022-03-07 23:14:02.511818+00
5	removed	2022-03-07 23:14:02.512979+00	2022-03-07 23:14:02.512979+00
\.


--
-- Data for Name: references; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve."references" (id, user_id, first_name, last_name, email, status_id, sent_at, affiliation, relationship_length, patient, positive_role_model, agreeable_and_approachable, communicates_effectively, rejection_reason, additional_info, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: report_reasons; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.report_reasons (id, reason, created_at, updated_at) FROM stdin;
1	This student was extremely rude or inappropriate	2022-03-07 23:14:02.722288+00	2022-03-07 23:14:02.722288+00
2	I am worried for the immediate safety of this student	2022-03-07 23:14:02.723845+00	2022-03-07 23:14:02.723845+00
3	LEGACY: Student was unresponsive	2022-03-07 23:14:02.724828+00	2022-03-07 23:14:02.724828+00
4	LEGACY: Student was rude	2022-03-07 23:14:02.726094+00	2022-03-07 23:14:02.726094+00
5	LEGACY: Technical issue	2022-03-07 23:14:02.727372+00	2022-03-07 23:14:02.727372+00
6	LEGACY: Student was misusing platform	2022-03-07 23:14:02.728602+00	2022-03-07 23:14:02.728602+00
\.


--
-- Data for Name: volunteer_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_partner_orgs (id, key, name, receive_weekly_hour_summary_email, created_at, updated_at) FROM stdin;
017f66a9-4076-9cb2-d764-6d615ebc3c04	placeholder1	Placeholder 1	t	2022-03-07 23:14:02.496753+00	2022-03-07 23:14:02.496753+00
017f66a9-4076-34a6-c3ac-2a7e316c7bd4	placeholder2	Placeholder 2	f	2022-03-07 23:14:02.498134+00	2022-03-07 23:14:02.498134+00
\.


--
-- Data for Name: required_email_domains; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.required_email_domains (id, domain, volunteer_partner_org_id, created_at, updated_at) FROM stdin;
017f66a9-4078-ffd1-6210-a82d58e17190	placeholder1.com	017f66a9-4076-9cb2-d764-6d615ebc3c04	2022-03-07 23:14:02.499584+00	2022-03-07 23:14:02.499584+00
\.


--
-- Data for Name: school_nces_metadata; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.school_nces_metadata (school_id, created_at, updated_at, school_year, fipst, statename, st, sch_name, lea_name, state_agency_no, "union", st_leaid, leaid, st_schid, ncessch, schid, mstreet1, mstreet2, mstreet3, mcity, mstate, mzip, mzip4, lstreet1, lstreet2, lstreet3, lcity, lzip, lzip4, phone, website, sy_status, sy_status_text, updated_status, updated_status_text, effective_date, sch_type, sch_type_text, recon_status, out_of_state_flag, charter_text, chartauth1, chartauthn1, chartauth2, chartauthn2, nogrades, g_pk_offered, g_kg_offered, g_1_offered, g_2_offered, g_3_offered, g_4_offered, g_5_offered, g_6_offered, g_7_offered, g_8_offered, g_9_offered, g_10_offered, g_11_offered, g_12_offered, g_13_offered, g_ug_offered, g_ae_offered, gslo, gshi, level, igoffered) FROM stdin;
\.


--
-- Data for Name: sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sponsor_orgs (id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schools_sponsor_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.schools_sponsor_orgs (school_id, sponsor_org_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_flags (id, name, created_at, updated_at) FROM stdin;
1	Absent student	2022-03-07 23:14:02.708819+00	2022-03-07 23:14:02.708819+00
2	Absent volunteer	2022-03-07 23:14:02.710522+00	2022-03-07 23:14:02.710522+00
3	Low session rating from coach	2022-03-07 23:14:02.711762+00	2022-03-07 23:14:02.711762+00
4	Low session rating from student	2022-03-07 23:14:02.712733+00	2022-03-07 23:14:02.712733+00
5	Low coach rating from student	2022-03-07 23:14:02.713881+00	2022-03-07 23:14:02.713881+00
6	Reported	2022-03-07 23:14:02.715142+00	2022-03-07 23:14:02.715142+00
7	Only looking for answers	2022-03-07 23:14:02.716473+00	2022-03-07 23:14:02.716473+00
8	Rude or inappropriate	2022-03-07 23:14:02.717561+00	2022-03-07 23:14:02.717561+00
9	Comment from student	2022-03-07 23:14:02.718701+00	2022-03-07 23:14:02.718701+00
10	Has been unmatched	2022-03-07 23:14:02.719855+00	2022-03-07 23:14:02.719855+00
11	Has had technical issues	2022-03-07 23:14:02.721031+00	2022-03-07 23:14:02.721031+00
\.


--
-- Data for Name: session_messages; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_messages (id, sender_id, contents, session_id, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: session_reports; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.session_reports (id, report_reason_id, report_message, reporting_user_id, session_id, reported_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions_session_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.sessions_session_flags (session_id, session_flag_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: student_partner_orgs; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_orgs (id, key, name, signup_code, high_school_signup, college_signup, school_signup_required, created_at, updated_at) FROM stdin;
017f66a9-406c-0827-59f5-71d0eb73e529	placeholder1	Placeholder 1	\N	t	f	t	2022-03-07 23:14:02.487678+00	2022-03-07 23:14:02.487678+00
017f66a9-406d-fab9-47ba-9a4247d992fb	placeholder2	Placeholder 2	\N	t	f	f	2022-03-07 23:14:02.48919+00	2022-03-07 23:14:02.48919+00
017f66a9-406d-a35b-6180-cb0b488da801	placeholder3	Placeholder 3	\N	f	f	f	2022-03-07 23:14:02.490512+00	2022-03-07 23:14:02.490512+00
\.


--
-- Data for Name: student_partner_org_sites; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.student_partner_org_sites (id, name, student_partner_org_id, created_at, updated_at) FROM stdin;
017f66a9-4071-ce43-fe31-1340ca17dfd9	placeholder1	017f66a9-406c-0827-59f5-71d0eb73e529	2022-03-07 23:14:02.491957+00	2022-03-07 23:14:02.491957+00
017f66a9-4071-19d3-24b6-a572cb0d9ac6	placeholder2	017f66a9-406d-fab9-47ba-9a4247d992fb	2022-03-07 23:14:02.493811+00	2022-03-07 23:14:02.493811+00
017f66a9-4071-fadb-0f3a-1d7a448ba153	placeholder3	017f66a9-406d-a35b-6180-cb0b488da801	2022-03-07 23:14:02.495211+00	2022-03-07 23:14:02.495211+00
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
\.


--
-- Data for Name: training_courses; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.training_courses (id, name, created_at, updated_at) FROM stdin;
1	UPchieve 101	2022-03-07 23:14:02.505927+00	2022-03-07 23:14:02.505927+00
\.


--
-- Data for Name: user_actions; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_actions (id, user_id, session_id, action_type, action, ip_address_id, device, browser, browser_version, operating_system, operating_system_version, quiz_subcategory, quiz_category, created_at, updated_at, mongo_id) FROM stdin;
\.


--
-- Data for Name: user_product_flags; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.user_product_flags (user_id, sent_ready_to_coach_email, sent_hour_summary_intro_email, sent_inactive_thirty_day_email, sent_inactive_sixty_day_email, sent_inactive_ninety_day_email, gates_qualified, created_at, updated_at) FROM stdin;
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
-- Data for Name: volunteer_profiles; Type: TABLE DATA; Schema: upchieve; Owner: admin
--

COPY upchieve.volunteer_profiles (user_id, volunteer_partner_org_id, timezone, approved, onboarded, photo_id_s3_key, photo_id_status, linkedin_url, college, company, languages, experience, city, state, country, created_at, updated_at) FROM stdin;
\.


--
-- Name: ban_reasons_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.ban_reasons_id_seq', 4, true);


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

SELECT pg_catalog.setval('upchieve.notification_priority_groups_id_seq', 7, true);


--
-- Name: notification_types_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.notification_types_id_seq', 2, true);


--
-- Name: photo_id_statuses_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.photo_id_statuses_id_seq', 3, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_questions_id_seq', 1, false);


--
-- Name: quiz_subcategories_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quiz_subcategories_id_seq', 29, true);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.quizzes_id_seq', 21, true);


--
-- Name: report_reasons_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.report_reasons_id_seq', 6, true);


--
-- Name: session_flags_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.session_flags_id_seq', 11, true);


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

SELECT pg_catalog.setval('upchieve.volunteer_reference_statuses_id_seq', 5, true);


--
-- Name: weekdays_id_seq; Type: SEQUENCE SET; Schema: upchieve; Owner: admin
--

SELECT pg_catalog.setval('upchieve.weekdays_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

