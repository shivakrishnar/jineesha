## asure.hr.services - direct-deposits

### How to Run Integration Tests against a Local Instance

1. Run the service locally as described in the parent README.
2. In the `integration-tests` folder, make a copy of `development.config.json` named `local.config.json`, setting
   `"apiDomain": "http://localhost:4105/direct-deposits/development`
3. In _this_ folder, authenticate with your AWS account, then: `npm run test:local`
