### asure.hr.services

This project contains all of the RESTful services used by the HR application. The overall
architecture uses AWS Lambda, API Gateway with a SQL Server-based RDS backend.

##### Prerequisites
* [Serverless](https://serverless.com/)
* [Node 8.0 + ](https://nodejs.org/en/)
* [Jest](https://jestjs.io/)
* IAM permissions to allow for the creation of the pertinent AWS resources needed for this project.
* An existing custom [VPC](https://aws.amazon.com/vpc/) within which these services are to be deployed.
    

#### How to Run Unit Tests
1. Clone this repository
2. Install the correct dependencies: `npm install`
3. Run unit tests: `jest`

_To execute the unit tests and see code coverage, run: `jest --coverage`_

#### How to Run Integration Tests
1. Clone this repository
2. Install the correct dependencies: `npm install`
3. Deploy the services: `sls deploy --variables development.serverless.variables.json`
4. Run the integration tests: `jest -c jest.integration.test.config.json`

_To execute the integration tests and see code coverage, run: `jest -c jest.integration.test.config.json`_

#### How to Deploy to AWS
1. Clone this repository
2. Install the correct dependencies: `npm install`
3. Deploy the services: `sls deploy --variables development.serverless.variables.json`


#### Testing against your AWS environment

1. Deploy [asure.dynamite](https://bitbucket.org/iSystemsTeam/asure.dynamite/src/master/) into your personal AWS account
2. Update `development.serverless.variables.json` with the relevant variables from the prior deployment output. 
3. Follow the steps in [How to Deploy to AWS](#How-to-Deploy-to-AWS)


