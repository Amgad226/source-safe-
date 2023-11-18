<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
Source Safe 2023
Working on a project called ‘Source Safe’, it is a web-based system for managing collaborative file work. It prevents parallel modifications by categorizing files as "free" or "in use" for specific users. Access rights are controlled through file grouping. Key functionalities include check-in and check-out, allowing users to reserve, modify, and replace files. Bulk check-in ensures file availability consistency. The system prevents concurrent reservations, ensuring exclusive access. Reporting features estimate booking and editing operations by file or user. Source Safe scales to support up to 100 simultaneous users. It offers efficient collaboration, version control, and secure file management in networked environments. 

## Installation

```bash
$ docker-compose up
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
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
