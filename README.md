### asure.hr.services

This project contains all of the RESTful services used by the HR application. The overall
architecture uses AWS Lambda, API Gateway with a SQL Server-based RDS backend.

##### Prerequisites

-   [Serverless](https://serverless.com/)
-   [Node 8.0 + ](https://nodejs.org/en/)
-   [Jest](https://jestjs.io/)
-   [Dotnet Core](https://dotnet.microsoft.com/download)
-   [Docker](https://www.docker.com/)
-   IAM permissions to allow for the creation of the pertinent AWS resources needed for this project.
-   An existing custom [VPC](https://aws.amazon.com/vpc/) within which these services are to be deployed.

### How to Run Locally

Currently, only the `tenants` service has been refactored to run locally with `serverless-offline`. See [/services/api/tenants/README.md](/services/api/tenants/README.md) for instructions.

#### How to Deploy to AWS

_Deployment order is important!: deploy services in `services/internal-api` first_

1. Clone this repository
2. Install the correct dependencies: `npm install`
3. Update the `domain` value in the `development.serverless.variables.json` file with `evolution-software.com`
4. Update the `domainName` value in the `serverless.yml` file with your own custom domain. Example: `domainName: my-custom-domain-name.${file(${opt:variables}):domain}`
5. Create the custom domain in API Gateway: `sls create_domain --variables development.serverless.variables.json`
6. Deploy the services: `sls deploy --variables development.serverless.variables.json`

#### How to Run Unit Tests

1. Clone this repository
2. Install the correct dependencies: `npm install`
3. Install the requisite node depedencies in `services/api` and `services/internal-api' sub-directories with the previous command
4. Run unit tests: `npm run test`

_To execute the unit tests and see code coverage, run: `jest --coverage`_

#### How to Run Integration Tests

1. Clone this repository
2. Install the correct dependencies: `npm install`
3. Install the requisite node depedencies in `services/api` and `services/internal-api' sub-directories with the previous command
4. Change the `apiDomain` value in the `development.config.json` file to your deployed service URL.
5. Run the integration tests: `npm run test:local`

_To execute the integration tests and see code coverage, run: `jest -c jest.integration.test.config.json`_

#### Testing against your AWS environment

1. Deploy [asure.dynamite](https://bitbucket.org/iSystemsTeam/asure.dynamite/src/master/) into your personal AWS account
2. Update `development.serverless.variables.json` with the relevant variables from the prior deployment output.
3. Deploy [isystems.nightshade](https://bitbucket.org/iSystemsTeam/isystems.nightshade/src/v3/) and [isystems.goldilocks](https://bitbucket.org/iSystemsTeam/isystems.goldilocks/src/master/)
4. Follow the steps in [How to Deploy to AWS](#How-to-Deploy-to-AWS)
5. Update the following properties within `development.config.json` in the integration-tests folder with your custom domain names from the prior deployment:
    - `apiDomain`
    - `tokenUrl`

#### Documentation Tools

This repo makes use of Architectual Decision Records (ADRs). We manage these ADRs using adr-tools which can be found [here](https://github.com/npryce/adr-tools). The records themselves can be reviewed in the `./docs/adr` directory of this repo. ADR 1 and 2 document these decisions.
