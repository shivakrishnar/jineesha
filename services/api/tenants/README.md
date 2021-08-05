## asure.hr.services - tenants

This service has been refactored to run locally with `serverless-offline`:

-   The `authorizer` has been removed from all endpoints in `serverless.yml`.
-   All handlers now use an enhanced `gatewayEventHandlerV2` to verify the access token and build the `SecurityContext` object. (This supports both V1 and V2 tokens.)
-   The `serverless-offline` package has been added as to `devDependencies`.
-   Scripts `start` and `test:local` have been added to `package.json` in this folder.

### How to Run Integration Tests against a Local Instance

1. Run the service locally as described in the parent README.
2. In the `integration-tests` folder, make a copy of `development.config.json` named `local.config.json`, setting
   `"nonProxiedApiDomain": "http://localhost:4100`
3. In _this_ folder, authenticate with your AWS account, then: `npm run test:local`
