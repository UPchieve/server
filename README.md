# UPchieve web server

> Web server providing endpoints for the UPchieve web client

## Build Setup

1. Install NodeJS either via [binary](https://nodejs.org/en/) or [Homebrew](http://brew.sh) (`brew install node`)

2. Clone repository

3. Copy `config.example.js` to `config.js` and setup handle to database and SMTP server.

4. In repository folder:

``` bash
# install dependencies
npm install

# optionally, set session secret
setenv SESSION_SECRET='secret'

# start server on localhost:3000
npm start
```

## Structure

The root folder of the repository provides the bootstrap file `main.js` and a package definitions file.

### config.js

`config.js` contains a map of configuration keys for running the server. All keys and sensitive information should be placed in this file.

### models

Model definitions that map to database models, along with related methods to act on those models, such as parsing, validation, and data transformations.

### router

Directory structure mimics the endpoint structure exposed by the server. Each file provides one or more endpoint routes, responsible for request acceptance/rejection and error handling.

### controllers

Routes use controllers to perform the business logic of the server, providing separation of concerns: the controllers have no need to be aware of how the endpoints work. Instead, a controller provides ways to allow the routes to trigger something (a user update, )

### services

A service is a step higher than a controller. Services provide abstract functions to one or many controllers, often to interface with third party services.

## Endpoints

### POST /auth/login

Expects the following request body:

```json
{
  "email": "String",
  "password": "String"
}
```

Authenticates the user with a session if credentials are correct.

### GET /auth/logout

Removes the user's current session.

### POST /auth/register

```json
{
  "email": "String",
  "password": "String"
}
```

Possible errors:
- Email is not valid
- Email already exists

### GET /api/user

Returns a sanitized public user record for the currently authenticated user

### PUT /api/user

Accepts a request body with fields mapping to profile fields to update for the currently authenticated user:

```json
{
  "picture": "String"
}
```

### GET /api/user/:id

Returns a sanitized public user record for a user with the given id. May perform checks on the authorization level of the current user to strip out priveliged information.

### POST /api/verify/send

Sends an email to verify the current user with unique hash. The email provided will overwrite the user record's email, in the event that the two do not match.

```json
{
  "email": "String"
}
```

### POST /api/verify/confirm

Accepts a token used to verify the current user.

```json
{
  "token": "String"
}
```

### POST /moderate/message

Expects the following request body:
```json
{
  "content": "string with the content of a message"
}
```

Makes a call to [CleanSpeak's Filter Content API](https://www.inversoft.com/docs/cleanspeak/3.x/tech/tutorials/filtering-content#using-the-filter-content-api), analyzes the API's response, and returns a boolean indicating whether or not the message is clean.

The response body looks like this if no error occurred:

```javascript
{
  "isClean": true // or false
}
```
