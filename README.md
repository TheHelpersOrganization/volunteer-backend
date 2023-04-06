## Volunteer Backend

[![Build Status](https://dev.azure.com/TheHelpersOrg/The%20Helpers/_apis/build/status%2FTheHelpersOrganization.volunteer-backend?branchName=master)](https://dev.azure.com/TheHelpersOrg/The%20Helpers/_build/latest?definitionId=2&branchName=master)

## Running the app

### Local

To run the server without Docker we need this pre-requisite:

- Postgres server running

Commands:

```bash
# development
$ npm run start

# production mode
$ npm run start:prod
```

### Docker

```bash
# build image
$ docker build -t my-app .

# run container from image
$ docker run -p 3000:3000 --volume 'pwd':/usr/src/app --network --env-file .env my-app

# run using docker compose
$ docker compose up
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrations

```bash
# using docker
$ docker compose exec app npm run migration:run

# generate migration (replace CreateUsers with name of the migration)
$ npm run migration:generate --name=CreateUsers

# run migration
$ npm run migration:run

# revert migration
$ npm run migration:revert
```
