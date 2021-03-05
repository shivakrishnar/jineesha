# 2. Use adr-tools to manage ADRs

Date: 2021-03-02

## Status

Accepted

Amends [1. Record architecture decisions](0001-record-architecture-decisions.md)

## Context

We are using ADRs in this project, and need to manage them. In aggregate ADRs form an architectural decision log, and this log contains valuable relational information not held in any particular ADR.

ADRs are intended to capture a single decision at a single point in time. They are not intended to be deleted or updated, but superceded or amended by future ADRs. This creates valuable chains of reasoning and decisions over time in the project. This also creates an ever larger collection of ADRs which could become difficult to manage. We want a consistent method of recording the relationsips between ADRs that minimizes the amount of time spent writing boilerplate. In a similar vein, we want to reduce the duplicate effort of creating the basic structure of ADRs, and make it as easy as possible to use a consistent template.

## Decision

We will create ADRs using [adr-tools](https://github.com/npryce/adr-tools).

## Consequences

New developers writing ADRs will have to install adr-tools. Those tools should ensure that our ADRs use a consistent template, make it simple to track when an ADR is superceded or amended, and easily create new relationship between ADRs as needed.
