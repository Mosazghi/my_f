--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Ubuntu 16.3-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.3 (Ubuntu 16.3-0ubuntu0.24.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _sqlx_migrations; Type: TABLE; Schema: public; Owner: mosa
--

CREATE TABLE public._sqlx_migrations (
    version bigint NOT NULL,
    description text NOT NULL,
    installed_on timestamp with time zone DEFAULT now() NOT NULL,
    success boolean NOT NULL,
    checksum bytea NOT NULL,
    execution_time bigint NOT NULL
);


ALTER TABLE public._sqlx_migrations OWNER TO postgres;

--
-- Name: refrigerator_items; Type: TABLE; Schema: public; Owner: mosa
--

CREATE TABLE public.refrigerator_items (
    barcode text NOT NULL,
    name text,
    quantity integer NOT NULL,
    expiration_date date NOT NULL,
    created_at date DEFAULT CURRENT_TIMESTAMP,
    image_url text,
    weight text,
    nutrition json
);


ALTER TABLE public.refrigerator_items OWNER TO postgres;

--
-- Data for Name: _sqlx_migrations; Type: TABLE DATA; Schema: public; Owner: mosa
--

COPY public._sqlx_migrations (version, description, installed_on, success, checksum, execution_time) FROM stdin;
20240705223220	init	2024-07-06 00:48:59.576813+02	t	\\xb06e9e4057e4354e2623182e0ad24753e32b28a05b0455da0fbc1f3806b95baf693559899f999a34807329fae9707da0	8215496
20240705224828	rename to image url	2024-07-06 00:48:59.58549+02	t	\\xf9901f85e765ad4f0182bf45bec0f41f9b5117a5243e0e5fb70600be357c4e39acfb9ddf8dbcba42b12e113b56277121	379655
20240705225201	add weight colum	2024-07-06 00:52:42.013839+02	t	\\x12f5ee0735e443644ba682b53d701d5bc1a4487ef8684aa6531a9fb432e3969a5f3ad744ebce27d7f4535de6110881fd	7951243
20240705230223	rename to nutrition	2024-07-06 01:02:41.889323+02	t	\\xe55e537c679a8b85f644848fff03dfcd2b274bb33aa2f816c61f15b45b82e7aaf093f141bac6293b6a215a081c7857d9	7748201
20240705230626	alter nutrition	2024-07-06 01:11:07.376902+02	t	\\x4f182527592f2ffd997e0b752fa3c46c725266784c90d3b6b953580301e9a9571282e9e9078984a68ccce0ddd9f44339	8655880
20240706072006	alter weight	2024-07-06 09:22:32.393387+02	t	\\x7050093eea0cbc6be30d05c3415c53b2ea9f53fbc8a472edf72dddd8a355dd0efb038e1df1e139deffe304a129736481	14403115
20240710161821	alter created at	2024-07-10 18:19:14.266694+02	t	\\x7022ddffbb284a0d55f9d0dc7dde5503eae6820d2ec244a801ca2be9bbe43234690fb2894e5bfa416a660058b19ef04d	6951477
\.


--
-- Data for Name: refrigerator_items; Type: TABLE DATA; Schema: public; Owner: mosa
--

COPY public.refrigerator_items (barcode, name, quantity, expiration_date, created_at, image_url, weight, nutrition) FROM stdin;
7046110011355	Jordan Vaskerull 77stk Refill	90	2024-07-26	2024-07-11	https://bilder.ngdata.no/7046110011355/meny/large.jpg	90p	[]
7025110206411	Coop Karbonader 	8	2025-07-15	2024-07-15	https://api.vetduat.no/api/images/large/7025110206411	400g	[{"unit": "kcal", "amount": 149.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 622.0, "display_name": "Energi"}, {"unit": "g", "amount": 0.0, "display_name": "Enumettet fett"}, {"unit": "g", "amount": 6.9, "display_name": "Fett"}, {"unit": "g", "amount": 0.0, "display_name": "Flerumettet fett"}, {"unit": "g", "amount": 8.9, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 3.0, "display_name": "Mettet fett"}, {"unit": "g", "amount": 11.0, "display_name": "Protein"}, {"unit": "g", "amount": 1.6, "display_name": "Salt"}, {"unit": "g", "amount": 1.7, "display_name": "Sukkerarter"}]
7025165311467	Coop Frøknekkebrød med Gresskar og Salt 200g	1	2024-07-16	2024-07-16	https://api.vetduat.no/api/images/large/7025165311467	0.2kg	[{"unit": "kcal", "amount": 465.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 1946.0, "display_name": "Energi"}, {"unit": "g", "amount": 38.0, "display_name": "Fett"}, {"unit": "g", "amount": 3.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 18.0, "display_name": "Kostfiber"}, {"unit": "g", "amount": 4.6, "display_name": "Mettet fett"}, {"unit": "g", "amount": 20.0, "display_name": "Protein"}, {"unit": "g", "amount": 0.1, "display_name": "Salt"}, {"unit": "g", "amount": 1.4, "display_name": "Sukkerarter"}]
5410673006035	Ben's Original Hurtigris Løs 3min	0	2025-07-15	2024-07-15	https://api.vetduat.no/api/images/large/5410673006035	700g	[{"unit": "kcal", "amount": 148.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 626.0, "display_name": "Energi"}, {"unit": "g", "amount": 0.5, "display_name": "Fett"}, {"unit": "g", "amount": 32.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 0.8, "display_name": "Kostfiber"}, {"unit": "g", "amount": 0.1, "display_name": "Mettet fett"}, {"unit": "g", "amount": 3.1, "display_name": "Protein"}, {"unit": "g", "amount": 0.01, "display_name": "Salt"}, {"unit": "g", "amount": 0.5, "display_name": "Sukkerarter"}]
7340191101364	Coop Mudcake 400g	0	2024-07-17	2024-07-17	https://cdcimg.coop.no/rte/RTE2/7340191101364.png	\N	[{"unit": "kcal", "amount": 394.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 1655.0, "display_name": "Energi"}, {"unit": "g", "amount": 14.0, "display_name": "Fett"}, {"unit": "g", "amount": 62.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 1.9, "display_name": "Mettet fett"}, {"unit": "g", "amount": 4.1, "display_name": "Protein"}, {"unit": "g", "amount": 0.43, "display_name": "Salt"}, {"unit": "g", "amount": 42.0, "display_name": "Sukkerarter"}]
7024850082996	Kjøttdeig av Storfe/svin 18% 650g	9	2024-07-21	2024-07-15	https://api.vetduat.no/api/images/large/7024850082996	0.65kg	[{"unit": "kcal", "amount": 244.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 1013.0, "display_name": "Energi"}, {"unit": "g", "amount": 7.9, "display_name": "Enumettet fett"}, {"unit": "g", "amount": 20.0, "display_name": "Fett"}, {"unit": "g", "amount": 2.0, "display_name": "Flerumettet fett"}, {"unit": "g", "amount": 0.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 0.0, "display_name": "Kostfiber"}, {"unit": "g", "amount": 7.6, "display_name": "Mettet fett"}, {"unit": "g", "amount": 16.0, "display_name": "Protein"}, {"unit": "g", "amount": 1.0, "display_name": "Salt"}, {"unit": "g", "amount": 0.0, "display_name": "Sukkerarter"}]
7025110161925	X-tra Kyllingfilet 1,4kg	2	2026-07-17	2024-07-17	https://cdcimg.coop.no/rte/RTE2/7025110161925.png	\N	[{"unit": "kcal", "amount": 102.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 429.0, "display_name": "Energi"}, {"unit": "g", "amount": 1.9, "display_name": "Fett"}, {"unit": "g", "amount": 0.2, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 0.5, "display_name": "Mettet fett"}, {"unit": "g", "amount": 21.0, "display_name": "Protein"}, {"unit": "g", "amount": 0.5, "display_name": "Salt"}, {"unit": "g", "amount": 0.2, "display_name": "Sukkerarter"}]
7340011316985	Änglamark Mørk Sjokolade 70% 100g	5	2024-07-17	2024-07-17	https://cdcimg.coop.no/rte/RTE2/7340011316985.png	\N	[{"unit": "kcal", "amount": 619.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 2565.0, "display_name": "Energi"}, {"unit": "g", "amount": 49.0, "display_name": "Fett"}, {"unit": "g", "amount": 33.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 29.0, "display_name": "Mettet fett"}, {"unit": "g", "amount": 7.4, "display_name": "Protein"}, {"unit": "g", "amount": 0.0, "display_name": "Salt"}, {"unit": "g", "amount": 27.0, "display_name": "Sukkerarter"}]
7037204612428	Kjøttdeig av Storfe 1kg Snabb	2	2024-07-17	2024-07-17	https://api.vetduat.no/api/images/large/7037204612428	1kg	[{"unit": "kcal", "amount": 227.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 943.0, "display_name": "Energi"}, {"unit": "g", "amount": 6.7, "display_name": "Enumettet fett"}, {"unit": "g", "amount": 18.0, "display_name": "Fett"}, {"unit": "g", "amount": 0.8, "display_name": "Flerumettet fett"}, {"unit": "g", "amount": 0.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 7.9, "display_name": "Mettet fett"}, {"unit": "g", "amount": 17.0, "display_name": "Protein"}, {"unit": "g", "amount": 0.8, "display_name": "Salt"}, {"unit": "g", "amount": 0.0, "display_name": "Sukkerarter"}]
7032069734384	Edamamebønner 400g Fryst Rema 1000	10	2024-07-17	2024-07-17	https://api.vetduat.no/api/images/large/7032069734384	400g	[{"unit": "kcal", "amount": 130.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 541.0, "display_name": "Energi"}, {"unit": "g", "amount": 2.6, "display_name": "Enumettet fett"}, {"unit": "g", "amount": 7.2, "display_name": "Fett"}, {"unit": "g", "amount": 3.3, "display_name": "Flerumettet fett"}, {"unit": "g", "amount": 2.8, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 5.0, "display_name": "Kostfiber"}, {"unit": "g", "amount": 1.0, "display_name": "Mettet fett"}, {"unit": "g", "amount": 11.0, "display_name": "Protein"}, {"unit": "g", "amount": 0.0, "display_name": "Salt"}, {"unit": "g", "amount": 2.5, "display_name": "Sukkerarter"}]
7025168060041	Coop Jegerbrød Skåret 750g	3	2024-07-17	2024-07-17	https://api.vetduat.no/api/images/large/7025168060041	0.75kg	[{"unit": "kcal", "amount": 272.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 1138.0, "display_name": "Energi"}, {"unit": "g", "amount": 5.1, "display_name": "Fett"}, {"unit": "g", "amount": 43.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 6.0, "display_name": "Kostfiber"}, {"unit": "g", "amount": 0.6, "display_name": "Mettet fett"}, {"unit": "g", "amount": 10.0, "display_name": "Protein"}, {"unit": "g", "amount": 0.9, "display_name": "Salt"}, {"unit": "g", "amount": 1.9, "display_name": "Sukkerarter"}]
7340191100671	LOL!!	24	2024-07-11	2024-07-11	https://api.vetduat.no/api/images/large/7340191100671	100g	[{"unit": "kcal", "amount": 503.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 2103.0, "display_name": "Energi"}, {"unit": "g", "amount": 0.0, "display_name": "Enumettet fett"}, {"unit": "g", "amount": 26.0, "display_name": "Fett"}, {"unit": "g", "amount": 0.0, "display_name": "Flerumettet fett"}, {"unit": "g", "amount": 57.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 8.1, "display_name": "Kostfiber"}, {"unit": "g", "amount": 16.0, "display_name": "Mettet fett"}, {"unit": "g", "amount": 0.0, "display_name": "Polyoler"}, {"unit": "g", "amount": 6.3, "display_name": "Protein"}, {"unit": "g", "amount": 0.02, "display_name": "Salt"}, {"unit": "g", "amount": 0.0, "display_name": "Stivelse"}, {"unit": "g", "amount": 53.0, "display_name": "Sukkerarter"}]
5700382353385	Rice Paper	6	2024-07-17	2024-07-17	https://api.vetduat.no/api/images/large/5700382353385	200g	[{"unit": "kcal", "amount": 342.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 1451.0, "display_name": "Energi"}, {"unit": "g", "amount": 0.0, "display_name": "Fett"}, {"unit": "g", "amount": 85.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 0.0, "display_name": "Mettet fett"}, {"unit": "g", "amount": 0.0, "display_name": "Protein"}, {"unit": "g", "amount": 0.6, "display_name": "Salt"}, {"unit": "g", "amount": 5.0, "display_name": "Sukkerarter"}]
7025168001594	Coop Kongebrød 900g	0	2024-07-17	2024-07-17	https://api.vetduat.no/api/images/large/7025168001594	0.9kg	[{"unit": "kcal", "amount": 273.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 1140.0, "display_name": "Energi"}, {"unit": "g", "amount": 5.1, "display_name": "Fett"}, {"unit": "g", "amount": 45.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 4.9, "display_name": "Kostfiber"}, {"unit": "g", "amount": 0.6, "display_name": "Mettet fett"}, {"unit": "g", "amount": 8.8, "display_name": "Protein"}, {"unit": "g", "amount": 0.9, "display_name": "Salt"}, {"unit": "g", "amount": 1.1, "display_name": "Sukkerarter"}]
7025110160423	Coop Vegetardag Pølser Chili/Ost 330g	92	2024-07-20	2024-07-19	https://cdcimg.coop.no/rte/RTE2/7025110160423.png	50kg	[{"unit": "kcal", "amount": 233.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 967.0, "display_name": "Energi"}, {"unit": "g", "amount": 0.0, "display_name": "Enumettet fett"}, {"unit": "g", "amount": 18.0, "display_name": "Fett"}, {"unit": "g", "amount": 0.0, "display_name": "Flerumettet fett"}, {"unit": "g", "amount": 7.7, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 0.0, "display_name": "Kostfiber"}, {"unit": "g", "amount": 2.7, "display_name": "Mettet fett"}, {"unit": "g", "amount": 0.0, "display_name": "Polyoler"}, {"unit": "g", "amount": 10.0, "display_name": "Protein"}, {"unit": "g", "amount": 1.7, "display_name": "Salt"}, {"unit": "g", "amount": 0.0, "display_name": "Stivelse"}, {"unit": "g", "amount": 0.6, "display_name": "Sukkerarter"}]
7025165004246	Coop Telegramkake 2kg	2	2024-07-26	2024-07-20	https://api.vetduat.no/api/images/large/7025165004246	2kg	[{"unit": "kcal", "amount": 222.0, "display_name": "Kalorier"}, {"unit": "kj", "amount": 930.0, "display_name": "Energi"}, {"unit": "g", "amount": 9.0, "display_name": "Fett"}, {"unit": "g", "amount": 34.0, "display_name": "Karbohydrater"}, {"unit": "g", "amount": 5.3, "display_name": "Mettet fett"}, {"unit": "g", "amount": 1.6, "display_name": "Protein"}, {"unit": "g", "amount": 0.27, "display_name": "Salt"}, {"unit": "g", "amount": 23.0, "display_name": "Sukkerarter"}]
\.


--
-- Name: _sqlx_migrations _sqlx_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mosa
--

ALTER TABLE ONLY public._sqlx_migrations
    ADD CONSTRAINT _sqlx_migrations_pkey PRIMARY KEY (version);


--
-- Name: refrigerator_items refrigerator_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mosa
--

ALTER TABLE ONLY public.refrigerator_items
    ADD CONSTRAINT refrigerator_items_pkey PRIMARY KEY (barcode);


--
-- PostgreSQL database dump complete
--

