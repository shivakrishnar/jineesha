# 3. Add temporary GET params to listDocuments endpoint

Date: 2021-03-02

## Status

Accepted

## Context

We are running a beta of a new version of asure.esignature, so there are two versions running in production. These two versions depend on the same API. This API is also undergoing changes to support the new version of asure.esignature, and some of these changes conflict with the old version of the esignature code. Specifically, the listDocuments endpoint needs to list all documents for the new esignature version, and only onboarding documents for the old version. Because of this incompatible behavior, the API needs to differentiate between the old and new esignature versions.

We do not need a particularly robust solution to this, as we expect this to be the only endpoint impacted, and the situation will be resolved at the end of the beta. We do need the solution to be quick to implement because we have a release planned for 2021-03-08 that cannot happen without this work.

## Decision

We will update the listDocuments endpoint to accept a GET parameter that only the new version of esignatures will pass. This will be implemented as part of MJ-7409. We intend to refactor the endpoint after the beta to remove this parameter and shift the behavior of the endpoint to support only the new esignature version since we will no longer be running the old version. We will create an issue in JIRA (MJ-7508) to record the need to do this cleanup work.

## Consequences

Because of this decision we will have to write code specifically to support a beta which will end, and then we will need to clean up the temporary code. Though this is lost effort in the long term, in the short term it should mean that MJ-7409 and related stories will be ready for release on time. There is a risk that this temporary code is not cleaned up. This should not harm the functional performance of the system, but could create difficulties for future developers working in those areas of the code or trying to understand them.
