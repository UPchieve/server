UPchieve Web App
===================

> Web app providing api endpoints and serving a SPA frontend.

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

[Contributing Guide](CONTRIBUTING.md)

## GITLAB

NOTE: Active development on this project has moved to https://gitlab.com/upchieve/subway, no more pushes should go straight to the Github repo.

**Table of Contents**

- [UPchieve Web App](#upchieve-web-app)
  - [GITLAB](#gitlab)
  - [Local Development](#local-development)
    - [Local Dependencies](#local-dependencies)
    - [App Dependencies](#app-dependencies)
    - [Prepare to run the server](#prepare-to-run-the-server)
    - [Run the app](#run-the-app)
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

The recommended tool for runtime version management is [`nvm`][nvm]. To use `nvm` on Windows, first install the appropriate Linux shell distribution using [`WSL`][wsl] (Windows Subsystem for Linux). We currently run on Node v16.8.0, you can switch to this using

```shell
$ nvm install v16.8.0 && nvm use v16.8.0
```

After switching npm versions using nvm, you will need to run `$ npm install`. Next install [`Docker`][Docker] and start according to their instructions for your operating system.

[wsl]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[nvm]: https://github.com/nvm-sh/nvm
[Docker]: https://www.docker.com/products/docker-desktop

### App Dependencies
On Linux systems you may need to install [`docker-compose` manually](https://docs.docker.com/compose/install/); on Windows and MacOS it ships with base docker. A docker-compose yaml specifies how to spin up Mongo, Redis, PostgreSQL, and PGAdmin containers to support the server.
 
1. Run the following command to start the containers
```shell
$ docker-compose up -d
```
2. Seed the mongo and postgres database by running `npm run dev:init`
3. Confirm the seeds worked by making a query in a DB admin tool
    - connect via `localhost:5432` with the admin or subway users OR
    - use PGAdmin at [`http://localhost:80`](http://localhost:80) with username `admin` and password `Password123`
4. Run the follow command to stop and remove the containers when finished
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
4. (optional) Run `npm run worker:dev` to start the worker process. The dev worker will automatically attempt to connect to your local Redis instance and read jobs from there. Additionally, you can run `npm run add-cron-jobs` to add all repeatable jobs to the job queue.

### Run the app

Once you have the dependencies running and installed, run the following commands to build the frontend and start the server in development mode.

```
$ npm run dev:frontend
```

This will kick off a build of the frontend assets and watch the frontend files to rebuild. Once the first build is done, you can run the following in a separate shell instance.

```
$ npm run dev:backend
```
to start the dev server and a watch for changes to the frontend build and server code. Then you can visit `http://localhost:3000` and you're good to go!

Even though the frontend is doing a production build, Vue dev tools should still be available as long as your NODE_ENV is `dev` which is the default.

## Test Users

The database is populated with the following users for local development:

| email                     | password      |
|:--------------------------|:--------------|
| `student1@upchieve.org`   | `Password123` |
| `student2@upchieve.org`   | `Password123` |
| `volunteer1@upchieve.org` | `Password123` |
| `volunteer2@upchieve.org` | `Password123` |
| `volunteer3@upchieve.org` | `Password123` |

By default, none of the test users have an `approvedHighschool` set. The volunteers are all admins by default, and `volunteer1@upchieve.org` and `volunteer2@upchieve.org` have also passed all of their certifications. `volunteer3@upchieve.org` has not passed any quizzes.

Structure
---------

The repo is split into two components, the server, and the frontend Vue SPA.

Server code is found in the `server` directory, and SPA code in the `src` directory.

The SPA is managed using the vue-cli-service which is opinionated about directory structure.

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
A [Bull](https://github.com/OptimalBits/bull) worker reading from a local [Redis](https://redis.io/) database. Job definitions live in `worker/jobs` and are registered in `worker/jobs/index.ts`. A script `scripts/add-cron-jobs.ts` will insert all repeatable jobs into the local Redis database.

### Worker Jobs
- [Update Elapsed Availability](worker/jobs/updateElapsedAvailability.ts): updates all volunteers' elapsed availabilities every day at 4 am.

## Component Library

We are transitioning to [Storybook](https://storybook.js.org/) to manage our frontend component library, with the goal
of having a cohesive look that is easily expressed by any contributor as we continue to build the site out.

Our Storybook is hosted at the Gitlab pages site for this repository: https://upchieve.gitlab.io/subway/

Each component from `src/components` is imported into a `Component.stories.js` file in `src/stories`. A story
represents one possible rendered state of that component.

Our goal is to have 100% of our components shifted into Storybook, and do refactoring as we go to make them
easier/more logical to use.

Storybook is capable of doing nested component testing all the way up through full view rendering. We'll update
this documentation as we decide how much we want to use storybook beyond atomic components.

All _new_ components should go into Storybook, with stories for each of their states.

### Testing

Story states can be imported into unit tests for a component to check things like applied classes and simple behaviors.

Additionally, we use [Storyshots](https://storybook.js.org/docs/react/workflows/snapshot-testing) to check rendered html for a given component to ensure changes aren't breaking the
rendering.

#### Known issue with visually testing SVG components:

Our unit tests do not incorporate visual testing for SVG components (refer to this [component](src/views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue) and its [unit test](tests/unit/components/RecentSubjectCard.spec.js)). The SVG components get successfully rendered on the application itself but not within unit or snapshot test markups.

So, after extensive research and exhausting nearly all possible options of rendering and testing SVGs, as of August 4 2021, we realized that this has been a prolonged JSDOM/JavaScript [issue](https://github.com/vuejs/vue-test-utils/issues/369) and not something that is occuring due to vue-test-utils or jest capabilities. Hence, consider it acceptable to not visually test SVGs for the time being.
