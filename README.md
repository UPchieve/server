UPchieve Web App
===================

> Web app providing api endpoints and serving a SPA frontend.

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

[Contributing Guide](CONTRIBUTING.md)

## GITLAB

NOTE: Active development on this project has moved to https://gitlab.com/upchieve/subway, no more pushes should go straight to the Github repo.

**Table of Contents**

- [Local Development](#local-development)
    - [Dependencies](#dependencies)
    - [Setup](#setup)
    - [Test Users](#test-users)
- [Structure](#structure)
    - [config.ts](#config)
    - [models](#models)
    - [router](#router)
    - [controllers](#controllers)
    - [services](#services)
- [Endpoints](#endpoints)

Local Development
-----------------
## docker-compose
Docker provides an alternative for local development. A docker-compose file exists, tied to Mongo. Here's how to work in docker-compose.

1. Build the container using the command `$ pack build upchieve/subway:local --builder heroku/buildpacks:20`
1. Navigate to this directory and run `mkdir mongo-volume` to create a directory for the MongoDB volume.
1. Run `cp config.example.ts config.ts` to copy the default config as your own config.
1. Run `docker-compose up` to launch the server.
1. After any change: Run `docker-compose down --rmi all` to destroy images and containers. Then run `docker-compose up` to see your changes.

Note: the default command ran when starting the server will populate/refresh all seed data, so any data changes to seed data will be overwritten.

## Without docker-compose
If not using docker-compose, follow these steps to start required components.

### Dependencies

The recommended tool for runtime version management is [`nvm`][nvm] and [`Docker`][Docker]. To use `nvm` on Windows, first install the appropriate Linux shell distribution using [`WSL`][wsl] (Windows Subsystem for Linux).

#### Local Node

We currently run on Node v12.20.1, you can switch to this using

```shell
$ nvm install v12.20.1 && nvm use v12.20.1
```

After switching npm versions using nvm, you will need to rerun `$ npm install`.

#### Mongo 4.2.3

Using a Volume (else data is not saved), pull and run docker image `mongo:4.2.3-bionic`. You can use any empty directory to which you have write access for your volume. 
What to expect: this command will be simultaneously running the mongo database on your local machine as the app builds for production. 

```shell-script
docker run -i --rm --name mongoContainer -p 27017-27019:27017-27019 -v <Absolute Path to directory on your drive>:/data/db mongo:4.2.3-bionic
```

Alternatively...

Run it as a background process: 

```shell-script
docker run -i -d --rm --name mongoContainer -p 27017-27019:27017-27019 -v <Absolute Path to directory on your drive>:/data/db mongo:4.2.3-bionic
```

Verify which docker containers are running: 
```shell-script
docker container ls
```

After you're done with development for the day, don't forget to stop the container running in the background:
```shell-script
docker stop mongoContainer
```

#### Redis 5.0.8

If you want, in a new terminal, pull and run docker image `redis:5.0.8`. You can use any empty directory to which you have write access for your volume. What to expect: this command will be simultaneously running on your local machine as the app builds for production. 

```shell-script
docker run -i --rm --name redis -p 6379:6379 -v <Absolute Path to directory on your drive>:/data -t redis:5.0.8
```

[wsl]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[nvm]: https://github.com/nvm-sh/nvm
[Docker]: https://www.docker.com/products/docker-desktop

### Setup
The below steps are tested on a Macintosh.

1. Confirm that Mongo and Redis container dependencies above are running alongside.
1. Custom properties are currently required for the server to connect data sources on a desktop computer, so run or add to your profile the below commands:
```
export SUBWAY_REDIS_HOST=localhost
export SUBWAY_DB_HOST=localhost
```
1. Run `npm install` to install the required dependencies.
1. Run `npx ts-node server/init` to seed the database with users, quiz questions, schools, and zip codes.
1. If you want to test Twilio voice calling functionality, set the `host` property to `[your public IP address]:3000` (minus the brackets), and configure your router/firewall to allow connections to port 3000 from the Internet. Twilio will need to connect to your system to obtain TwiML instructions.
1. (optional) Run `npm run worker:dev` to start the redis database and dev worker. The dev worker will automatically attempt to connect to your local Redis instance and read jobs from there. Additionally, you can run `ts-node ./scripts/add-cron-jobs.ts` to add all repeatable jobs to the job queue.

[bcrypt]: https://www.npmjs.com/package/bcrypt


#### Running dev

Once you have the dependencies running and installed, you should run first

```
$ npm run dev:frontend
```

This will kick off a build of the frontend assets and watch the frontend files to rebuild. Once the first build is done, you can run

```
$ npm run dev:backend
```

to start the dev server and a watch process. Then you can visit `http://localhost:3000` and you're good to go!

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
