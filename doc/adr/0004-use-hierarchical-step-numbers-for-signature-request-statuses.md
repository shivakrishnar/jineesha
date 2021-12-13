# 4. Use hierarchical step numbers for signature request statuses

Date: 2021-03-26

## Status

Accepted

## Context

This API allows for the issuing, tracking and updating of signature requests, and other documents. In support of this we have a table in the database "SignatureStatus" that defines the different statuses that a given document can have. In addition to Name and ID a status has a "step number" which is needed to track where in the process the request is. 0 is currently used for non-signable documents. 1 and 2 represent the basic flow of needs signature to signed.

We are adding a canceled status, and as we add statuses and expand the range of step numbers we want to establish a consistent and extensibe step numbering scheme to place the canceled status into. We may need to track additional statuses or additional status flows in the future, one could imagine cases where flows like _needs signature/signed/approved_, _needs signature/partially signed/signed_, or _scheduled/needs signature/signed_ could find use in our system. We also prefer a scheme that does not require updates to the current step numbers.

## Decision

To meet the needs of clarity and extensibilty we have agreed to use two digit integer step numbers, and organizing them hierarchically similar to http status codes. We will make use of the first (tens) digit of new steps to categorize steps into flows if any are added to the system.

Becuse certain statuses are likely to be used in common between many flows, the integers 1-9 will be reserved for common ordinal statuses. 1-9 will be used for statuses that are deemed likely to appear in multiple flows, for example, many flows might use a _needs signature(1)_ or _signed(2)_ state. If a reserved 1-9 status is used in a flow it should appear before any higher numbered reserved (1-9) statuses, though some common ordinal statuses may be skipped. Our current basic signing flow of needs signature(1)/signed(2) is an example of proper use of common ordinal status numbers. An example of a potential complex signing flow described in terms of "step name(step number)" could be _created(30)/pre-check(31)/needs signature(1)/incomplete(32)/reviewing(33)/approved(3)_

Negative numbers will be reserved for common terminal statuses. Currently the only common terminal status is _canceled(-1)_. If other terminl statuses arise that are likely to be useful in multiple flows, such as bad data, API failure, or stale signature request, they could also be given negative step numbers.

Zero will be reserved as a terminal status for non-signable documents.

## Consequences

No changes to the current system need be made to accommodate this decision. This will make understanding status codes, and how they relate to each other, easier for developers, as certain key information is now inherent to the status codes themselves. This decision will obligate us to maintain this standard when adding future statuses, which could lead to some significant deliberation when deciding if a status should be treated as common. Further, if at some point a unique status flow arises that demands more than 10 steps that will be difficult to intuitively accomodate in this scheme.
