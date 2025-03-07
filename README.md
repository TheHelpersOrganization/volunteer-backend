# Volunteer Backend

[![Build Status](https://dev.azure.com/TheHelpersOrg/The%20Helpers/_apis/build/status%2FTheHelpersOrganization.volunteer-backend?branchName=master)](https://dev.azure.com/TheHelpersOrg/The%20Helpers/_build/latest?definitionId=2&branchName=master)

This project is implemented using [NestJS](https://nestjs.com/) and [Prisma](https://www.prisma.io/).

## Running the app

⚠️ Using [pnpm](https://pnpm.io/) is recommended over `npm` or `yarn`.

### Local

To run the server we need this pre-requisite:

- Postgres server running
- The .env file with the correct values, see [.env.template](.env.template) for reference

Commands:

```bash
# development
$ pnpm run start

# production mode
$ pnpm run start:prod
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
$ pnpm run test

# integration tests
$ pnpm run test:int

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Migrations

```bash
# using docker
$ docker compose exec app pnpm run migration:run

# generate migration
$ pnpm run migration:generate

# run migration
$ pnpm run migration:run

# revert migration
$ pnpm run migration:revert

# reset database migration
$ pnpm run migration:revert
```
