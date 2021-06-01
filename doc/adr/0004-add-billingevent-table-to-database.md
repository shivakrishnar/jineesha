# 4. Add BillingEvent table to database

Date: 2021-05-24

## Status

Accepted

## Context

There are currently two e-signature product tiers that we offer to our clients: simple and enhanced. There are different monthly flat costs associated with each product tier, in addition to a small fee that is charged for every signature request that is sent by the company. The billing report that is generated each month currently only lists companies that have generated signature requests within that month and does not list companies that are on an e-signature product tier but have not sent any signature requests. In order to ensure that these companies were getting billed the proper amount, we needed to update the billing report to capture companies that are either currently on the enhanced tier or switched to the enhanced tier within the month, regardless of how many signature requests they have sent.

With our current database structure, we are unable to easily track changes to a company's e-signature product tier.

## Decision

We will create two new database tables: BillingEvent and BillingEventType. Both tables will be designed in such a way that they can be easily extended upon in the event that we need to capture more data.

BillingEventType will be a system-level table that will contain every type of billable action that a user can perform. We will load two records in this table by default: EnhancedEsignatureEnabled and EnhancedEsignatureDisabled.

BillingEvent will be a company-level table that will contain a history of every billable action that a user has performed on a company. This table will contain four columns: ID, CompanyID, BillingEventTypeID and Date. It was decided that CompanyID will be nullable to support cases where a billing event needs to be captured at the tenant level. EmployeeID was intentionally excluded because it is unlikely that BillingEvents will need to be captured at the employee level.

## Consequences

Adding these two tables will allow us to easily keep track of changes to a company's e-signature product tier. There are no foreseeable consequences of this change.
