# 6. Add new BillingEvent type for company deletion

Date: 2022-02-10

## Status

Accepted

## Context

In order for a company to be deleted from AHR, the system needs to either delete all databases records that are associated with that company or set the CompanyID column to null before it can be successfully deleted. This includes any EsignatureMetadata records that are associated with the company. Because of this, if an admin sends out billable signature requests and also deletes a company within the same month, those billable requests will not appear on the billing report that is sent out at the end of the month. In addition to this, regardless of whether or not billable sign requests have been sent out, when a company that was on the Enhanced E-Signature tier is deleted, that company will not show up on the billing report either.

We need a solution that will allow us to retain all of this billing data even after a company has been deleted so that the service bureau can be billed properly.

## Decision

We will add a row to the BillingEvent table when a company is deleted. A new column called Metadata will be added to the BillingEvent table to hold the following pieces of data:

* company name - this is displayed on the billing report.
* company code - this is displayed on the billing report.
* company creation date - this is required to preserve the logic around legacy companies.
* number of all billable signature requests - this is displayed on the billing report for non-legacy companies.
* number of non-onboarding billable signature requests - this is displayed on the billing report for legacy companies.
* enhanced e-signature status - this will be necessary for determining which deleted companies to bill if no billable requests were sent out.
* previous e-signature billing events exist - this is a boolean that will represent whether or not the company had existing e-signature billing events (switched e-signature product tiers) within the month it was deleted. This will be necessary for determining which deleted companies to bill if no billable requests were sent out.

To keep this table as generic as possible, this will be the only column added to this table. AHR (asure.gremlins) will be updated to set the CompanyID column on the BillingEvent table to NULL so that company deletions can be carried out successfully.

We will add a new record to the BillingEventType table: CompanyDeleted. When a row is added to the BillingEvent table after a company deletion, the BillingEventTypeID will reference this new record.

The billing endpoint will be updated to include this new BillingEventType when generating the billing report.

## Consequences

Implementing these changes will allow us to properly bill service bureaus when a company is deleted from their environment. The following scenarios have been accounted for:

* A company that has been deleted and also sent out billable requests within the same month (regardless of their Enhanced E-signature status) will appear on the billing report.
* A company that has been deleted, did not send out billable requests within the same month and had Enhanced E-signature enabled for the whole month will appear on the billing report.
* A company that has been deleted, did not send out billable requests and toggled their Enhanced E-signature (either on or off) within the same month will appear on the billing report.
* A company that has been deleted, did not send out billable requests within the same month and had Enhanced E-Signature disabled for the whole month will NOT appear on the billing report.

There are no foreseeable consequences of this change.
