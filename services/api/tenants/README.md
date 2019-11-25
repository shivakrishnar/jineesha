## asure.hr.services - tenants

This service has been refactored to run locally with `serverless-offline`:

  - The `authorizer` has been removed from all endpoints in `serverless.yml`.
  - All handlers now use an enhanced `gatewayEventHandlerV2` to verify the access token and build the `SecurityContext` object. (This supports both V1 and V2 tokens.)
  - The `serverless-offline` package has been added as to `devDependencies`.
  - Scripts `start` and `test:local` have been added to `package.json` in this folder.

Below are instructions for running and testing locally. For information on other aspects of working with this project (such as deployment and testing), please see the [top-level README](../../../README.md).

### How to Run Locally

1. Ensure `npm install` has been run in the following folders:
    - `/asure.hr.services`
    - `/asure.hr.services/services/internal-api`
    - `/asure.hr.services/services/integrations`
    - `/asure.hr.services/services/api/direct-deposits`
2. Run `npm install` in this folder.
3. Authenticate with your AWS account, then: `npm start`

After a minute or two, the service will be running on `http://localhost:4100`. With a valid access token, you can make requests (with curl, Postman, etc) using this base URL, for example, `http://localhost:4100/internal/tenants/c807d7f9-b391-4525-ac0e-31dbc0cf202b/employees`.

### How to Run Integration Tests against a Local Instance

1. Run the service locally as described above in a separate terminal window.
2. In the `integration-tests` folder, make a copy of `development.config.json` named `local.config.json`, setting `"nonProxiedApiDomain": "http://localhost:4100"`
3. In *this* folder, authenticate with your AWS account, then: `npm run test:local`
