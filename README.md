UPchieve API Server and Worker
===================

> Web app providing api endpoints and serving a SPA frontend.

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

[Contributing Guide](CONTRIBUTING.md)

## GITLAB
NOTE: Active development on this project has moved to https://gitlab.com/upchieve/subway, no more pushes should go straight to the Github repo.

## IMPORTANT: THE FRONTEND IS IN A SEPARATE REPOSITORY
This repository is the backend API server and queue worker only. To work on the frontend, you also need to follow [the readme for the frontend repo](https://gitlab.com/upchieve/application/high-line).

**Table of Contents**

- [UPchieve API Server and Worker](#upchieve-api-server-and-worker)
  - [GITLAB](#gitlab)
  - [Local Development](#local-development)
    - [Local Dependencies](#local-dependencies)
    - [App Dependencies](#app-dependencies)
    - [Prepare to run the server](#prepare-to-run-the-server)
    - [Run the app](#run-the-app)
    - [Database updates](#database-updates)
      - [Important files](#important-files)
      - [Package.json Scripts](#packagejson-scripts)
      - [Migrations](#migrations)
  - [Test Users](#test-users)
  - [Structure](#structure)
  - [Server](#server)
    - [Config](#config)
    - [Models](#models)
    - [Router](#router)
    - [Services](#services)
  - [Endpoints](#endpoints)
  - [Worker](#worker)
    - [Worker Jobs](#worker-jobs)
  - [Component Library](#component-library)
    - [Testing](#testing)
      - [Known issue with visually testing SVG components:](#known-issue-with-visually-testing-svg-components)

Local Development
-----------------
### Local Dependencies

The recommended tool for runtime version management is [`nvm`][nvm]. To use `nvm` on Windows, first install the appropriate Linux shell distribution using [`WSL`][wsl] (Windows Subsystem for Linux). We currently run on Node v16.16.0, you can switch to this using

```shell
$ nvm install v16.16.0 && nvm use v16.16.0
```

After switching npm versions using nvm, you will need to run `$ npm install`. Next install [`Docker`][Docker] and start according to their instructions for your operating system.

[wsl]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[nvm]: https://github.com/nvm-sh/nvm
[Docker]: https://www.docker.com/products/docker-desktop

### App Dependencies
On Linux systems you may need to install [`docker-compose` manually](https://docs.docker.com/compose/install/); on Windows and MacOS it ships with base docker. A docker-compose yaml specifies how to spin up Mongo, Redis, PostgreSQL, and PGAdmin containers to support the server, and also seeds the PostgreSQL database with test data.

1. Run the following command to start the containers
```shell
$ docker-compose up -d
```
2. Confirm PostgreSQL is running and the database is properly seeded by making a query in a DB admin tool
    - connect via `$ psql --host 127.0.0.1 --port 5432 --username admin --dbname upchieve` and password `Password123` OR
    - use PGAdmin at [`http://localhost:80`](http://localhost:80) with username `admin@upchieve.org` and password `Password123`

When you want to stop and remove the containers, run:
```shell
$ docker-compose down
```

### Prepare to run the server
The below steps are tested on a Macintosh.

1. Confirm the database container dependencies above are running with `docker ps`
2. Custom properties are currently required for the server to connect data sources on a desktop computer, so run or add to your profile the below commands:
```
export SUBWAY_REDIS_HOST=localhost
export SUBWAY_DB_HOST=localhost
```
3. (optional) If you want to test Twilio voice calling functionality, set the `host` property to `[your public IP address]:3000` (minus the brackets), and configure your router/firewall to allow connections to port 3000 from the Internet. Twilio will need to connect to your system to obtain TwiML instructions.
4. (optional) Run `npm run dev:worker` to start the worker process. The dev worker will automatically attempt to connect to your local Redis instance and read jobs from there. Additionally, you can run `npm run add-cron-jobs` to add all repeatable jobs to the job queue.

### Run the app

#### IMPORTANT: THE FRONTEND IS IN A SEPARATE REPOSITORY
This repository is the backend API server and queue worker only. To work on the frontend, you also need to follow [the readme for the frontend repo](https://gitlab.com/upchieve/application/high-line).

Once you have the dependencies running and installed, you can run the following

```
$ npm run dev:backend
```
to start the dev server and a watch for changes to the server code. Once you also have the frontend running you can visit http://localhost:8080 and you're good to go!

### Database updates

If you change anything in the `.sql` files in `server/models`, run [`npm run pgtyped`](https://pgtyped.vercel.app/) to pick up the changes and regenerate the associated `.ts` files. This generates typescript versions of the queries that can be referenced in code, as well as entity types.

#### Important files
All database administration files live in `/database`. The `db_init` directory houses files used to bring up a fresh database for local dev or staging. To bring up a fresh database run:
1. `schema.sql` to create the UPchieve schema
2. `auth.sql` to create relevant app roles and grant them permission over the schema
3. `test_seeds.sql` to fill the db with static seeds and test data for local development
4. `seed_migrations.sql` to populate the `public.seed_migrations` table so we know how to apply future seed migrations

#### Package.json Scripts
1. `db:reset`: resets the local postgres container's `pchieve` database to an empty state
2. `db:schema`: applies `db_init/schema.sql` to the local db
3. `db:auth`: applies `db_init/auth.sql` to the local tb
4. `db:seeds`: applies `db_init/test_seeds.sql` to the local db
5. `db:reset-schema`: runs 1-3 above
6. `db:reset-seeds`: runs 1-4 above; equivalent to restarting the docker container
7. `db:build-seeds`: runs 1-3, builds static seeds from `seeds/static`, and applies all seed migrations
8. `db:dump`: dumps contents of local db to `schema.sql`, `test_seeds.sql`, and `seed_migrations.sql`
9. `db:schema-new`: creates a new blank schema migration (same as `dbmate new`)
10. `db:seeds-new`: creates a new blank seed migration (same as `dbmate new`)
11. `db:schema-up`: applies any pending schema migrations without writing out the new schema
12. `db:schema-down`: rollsback the most recent applied schema migration without writing out the new schema
13. `db:seeds-up` applies any pending seed migrations

#### Migrations
When writing a schema migration include both rollout and rollback instructions - for example:
```sql
-- migrate:up
ALTER TABLE upchieve.schools
  ADD COLUMN legacy_city_name text;

-- migrate:down
ALTER TABLE upchieve.schools
  DROP COLUMN legacy_city_name;
```
Test that the rollback script actually works by running `npm run db:schema-down`. Note that a `seeds-down` script does not exist because writing reversible seed migrations is often mroe trouble than it's worth.

Notes:
- If the database/schema end up in an irrecoverable state, you can drop everything with `npm run db:reset-seeds` to get the database to a fresh state (alternatively destroy and rebuild the container)
- After verifying the migrations are good dump the schema and data for the next developer with `npm run db:dump`
- Everything in `db_init` is programmatically generated and can be ignored in diff examinations

## Test Users

The database is populated with the following users for local development:

| email                     | password      | properties                                             |
|:--------------------------|:--------------|--------------------------------------------------------|
| `student1@upchieve.org`   | `Password123` | approved school                                        |
| `student2@upchieve.org`   | `Password123` | partner student, approved school                       |
| `student3@upchieve.org`   | `Password123` | partner student, no school                             |
| `volunteer1@upchieve.org` | `Password123` | approved, onboarded, partner volunteer                 |
| `volunteer2@upchieve.org` | `Password123` | approved, onboarded, gets special reporting            |
| `volunteer3@upchieve.org` | `Password123` | approved, onboarded, open sign up, different time zone |
| `volunteer4@upchieve.org` | `Password123` | approved, not onboarded                                |
| `volunteer5@upchieve.org` | `Password123` | not approved, not onboarded                            |
| `volunteer6@upchieve.org` | `Password123` | admin                                                  |


Structure
---------

The app is split into two components, the server/worker, and the frontend Vue SPA.

Server code is found in the `server` directory, and SPA code in a [separate repository](https://gitlab.com/upchieve/application/high-line).

## Server

The `server` folder of the repository provides the bootstrap file `main.ts` and a
package definitions file.

### Config

`config.ts` contains a map of configuration keys for running the server. All
keys and sensitive information should be placed in this file.

### Models

Model definitions that map to database models, along with related methods to act
on those models, such as parsing, validation, and data transformations. Ideally models are
encapsulated in their files, and only expose methods that return interfaces of data,
rather than actual Mongo Documents. We are in the process of migrating to this
practice across all models.

### Router

Directory structure mimics the endpoint structure exposed by the server. Each
file provides one or more endpoint routes, responsible for request
acceptance/rejection and error handling.

### Services

Routes use services to perform the business logic of the server, providing
separation of concerns: the services have no need to be aware of how the
endpoints work. Instead, a controller provides ways to allow the routes to
trigger something (a user update, e.g.).

## Endpoints

See all current endpoints in the [Swagger UI](./server/swagger/swagger.yaml) documentation

If you have the local backend dev running you can go [here](https://localhost:3000/docs) for a local version.

## Worker
Our application runs several asynchronous jobs. These jobs are put into a queue, managed by [BullMQ](https://github.com/OptimalBits/bull), that lives in a Redis instance.
These jobs might be triggered programmatically, on a schedule, or manually using BullMQ's UI called TaskForce.sh.

- Job definitions live in `worker/jobs`
- Jobs need to be registered in the jobProcessors list in `worker/jobs/index.ts`

There are three ways to enqueue jobs:
- Schedule them in `scripts/add-cron-jobs.ts`, which will insert them into the local Redis database. Do this for jobs that need to repeat regularly.
- Programmatically (example: search code base for `QueueService.add(...)`)
- Manually using the TaskForce.sh UI (Ask a teammate to add you!)
  - Go to TaskForce -> Dashboard -> Production queue -> "Add a new job"

### Testing locally

You can run the worker queue locally as well as enqueue specific jobs:
- To run the queue, do `npm run dev:worker`
- To enqueue jobs locally, we use the script `server/scripts/testing-jobs.ts`
  - Simply edit the value of `jobToQueue` with the job you want
- Then, in another terminal, run the script to enqueue the job: `npx ts-node server/scripts/testing-jobs.ts`
