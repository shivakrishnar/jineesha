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

Currently, the `tenants`, `integrations`, and `direct-deposits` services have been refactored to run locally with `serverless-offline`.

1. Ensure `npm install` has been run in the following folders:
    - `/asure.hr.services`
    - `/asure.hr.services/services/internal-api`
    - `/asure.hr.services/services/integrations`
    - `/asure.hr.services/services/api/direct-deposits`
    - `/asure.hr.services/services/api/tenants`
    - `asure.hr.services/services/api/group-term-life`
2. Authenticate with your AWS account, then: `npm start`

After a minute or two, the service will be running on the designated port - Tenants runs on `http://localhost:4100` - Direct-deposits runs on `http://localhost:4105` - Integrations runs on `http://localhost:4104`

With a valid access token, you can make requests (with curl, Postman, etc) using this base URL, for example, `http://localhost:4100/internal/tenants/c807d7f9-b391-4525-ac0e-31dbc0cf202b/employees`.

### How to Run Integration Tests against a Local Instance

See the respective services README for instructions on how to run integration tests against serverless-offline

#### How to Deploy to AWS

_Deployment order is important!: deploy services in `services/internal-api` first_

1. Clone this repository
2. Install all dependencies by running `./npm_install_all.sh`
   a. or `npm install` in each folder and subfolder
3. Update the `domain` value in the `development.serverless.variables.json` file with `evolution-software.com`
4. Update the `domainName` value in the `serverless.yml` file with your own custom domain. Example: `domainName: my-custom-domain-name.${file(${opt:variables}):domain}`
5. Create the custom domain in API Gateway: `sls create_domain --variables development.serverless.variables.json`
6. Deploy the services: `sls deploy --variables development.serverless.variables.json`

#### How to Run Unit Tests

1. Clone this repository
2. Install the correct dependencies (follow step 2 above)
3. Run unit tests: `npm run test`
4. Code coverage can be found in coverage\index.html

#### How to Run Integration Tests

1. Clone this repository
2. Install the correct dependencies (follow step 2 above)
3. Change the `apiDomain` value in the `development.config.json` file to your deployed service URL.
4. Run the integration tests: `npm run test:dev`

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

#### How to Run the Linter

'npm run lint' will lint TS files
Use node V 12 or above for linting and commiting

### Deploying branch builds to dev or staging

The Jenkins pipeline for this repository allows developers to not only deploy specific services for an expedited build process, but also to deploy branch builds that are separate from the main build. This allows developers to test their changes without affecting other developers work. To deploy branch builds, go to Jenkins, start a build for your asure.hr.services branch and follow the prompts. Once your services have finished deploying, simply append the branch name to the end of the service name in the URL to access it. For example:

`https://hr-services.dev.evolution-software.com/internalMJ-1234/`

After you are done with a branch build, remember to tear it down by running the pipeline and choosing the `Tear down branch build` build type. **It is the developer's responsibility to remove any unused branch builds in order to keep the AWS environments clean!**