### asure.hr.services - integrations

This contains microservices proxying external non-Asure Software 3rd party APIs.

### How to Run Integration Tests against a Local Instance

1. Run the service locally as described in the parent README.
2. In the `integration-tests` folder, make a copy of `development.config.json` named `local.config.json`, setting
   `"apiDomain": "http://localhost:4104/integrations`
3. In _this_ folder, authenticate with your AWS account, then: `npm run test:local`
