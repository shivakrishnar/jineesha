import 'reflect-metadata'; // required by asure.auth dependency

import * as brnv from 'bank-routing-number-validator';
import * as Yup from 'yup';
import * as utilService from '../../../util.service';
import { Headers } from '../../models/headers';
import * as directDepositService from './direct-deposit.service';

import { ApplicationRoleLevel } from '../../../internal-api/authentication/ApplicationRoleLevelEnum';
import { IGatewayEventInput } from '../../../util.service';

import { DirectDepositAction, IDirectDepositEvent, NotificationEventType } from '../../../internal-api/notification/events';
import { PaginatedResult } from '../../../pagination/paginatedResult';

const headerSchema = {
    authorization: { required: true, type: String },
};

const betaFlagResourceUriSchema = {
    tenantId: { required: true, type: String },
};

const directDepositsResourceUriSchema = {
    tenantId: { required: true, type: String },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
};

const directDepositsResourceUriSchemaPatch = {
    tenantId: { required: true, type: String },
    companyId: { required: true, type: String },
    employeeId: { required: true, type: String },
    id: { required: true, type: String },
};

const bankAccountValidationSchema = {
    routingNumber: { required: true, type: String },
    accountNumber: { required: true, type: String },
    designation: { required: true, type: String },
};

const postValidationSchema = {
    bankAccount: { required: true, type: Object },
    amountType: { required: true, type: String },
    amount: { required: true, type: Number },
};

const patchValidationSchema = {
    amountType: { required: false, type: String },
    amount: { required: false, type: Number },
};

const bankAccountSchema = Yup.object().shape({
    routingNumber: Yup.string()
        .min(9, 'routingNumber must be nine characters.')
        .max(9, 'routingNumber must be nine characters.')
        .required()
        .test('routing-number-bad-format', 'routingNumber must be in a valid format.', (value) => brnv.ABARoutingNumberIsValid(value)),
    accountNumber: Yup.string()
        .max(20, 'accountNumber must be a maximum of 20 characters.')
        .test('accountNumber-empty', 'accountNumber is a required field', (value) => (value ? value.trim() !== '' : true))
        .matches(new RegExp('^[a-zA-Z0-9]+$'), { message: 'accountNumber cannot contain special characters.' })
        .required(),
    designation: Yup.string()
        .required()
        .oneOf(
            ['Checking', 'Savings', 'MoneyMarket'],
            "designation must be one of the following values: 'Checking', 'Savings', 'MoneyMarket'.",
        ),
});

const directDepositPostSchema = Yup.object().shape({
    bankAccount: Yup.object().required(),
    amountType: Yup.string()
        .required()
        .oneOf(
            ['Flat', 'Percentage', 'Balance Remainder'],
            "amountType must be one of the following values: 'Flat', 'Percentage', 'Balance Remainder'",
        ),
    amount: Yup.mixed()
        .when('amountType', {
            is: 'Percentage',
            then: Yup.number()
                .max(100, 'amount must be less than 100% when amountType is Percentage.')
                .required()
                .test('amount-not-number', 'amount must be a number.', (value) => typeof value === 'number')
                .test('amount-too-small', 'amount must be greater than 0.', (value) => {
                    if (value && !Number.isNaN(parseFloat(value))) {
                        return parseFloat(value) > 0;
                    } else if (value === ' ') {
                        return false;
                    }
                    return true;
                }),
            otherwise: Yup.number(),
        })
        .when('amountType', {
            is: 'Flat',
            then: Yup.number()
                .required()
                .test('amount-not-number', 'amount must be a number.', (value) => typeof value === 'number')
                .test('amount-too-small', 'amount must be greater than 0.', (value) => {
                    if (value && !Number.isNaN(parseFloat(value))) {
                        return parseFloat(value) > 0;
                    } else if (value === ' ') {
                        return false;
                    }
                    return true;
                }),
            otherwise: Yup.number(),
        }),
});

const directDepositPatchSchema = Yup.object().shape({
    amountType: Yup.mixed()
        .oneOf(
            ['Flat', 'Percentage', 'Balance Remainder'],
            "amountType must be one of the following values: 'Flat', 'Percentage', 'Balance Remainder'",
        )
        .required(),
    amount: Yup.mixed()
        .when('amountType', {
            is: 'Percentage',
            then: Yup.number()
                .required('amount is required when amountType is supplied.')
                .max(100, 'amount must be less than 100% when amountType is Percentage.')
                .test('amount-not-number', 'amount must be a number.', (value) => typeof value === 'number')
                .test('amount-too-small', 'amount must be greater than 0.', (value) => {
                    if (value && !Number.isNaN(parseFloat(value))) {
                        return parseFloat(value) > 0;
                    } else if (value === ' ') {
                        return false;
                    }
                    return true;
                }),
            otherwise: Yup.number(),
        })
        .when('amountType', {
            is: 'Flat',
            then: Yup.number()
                .required()
                .test('amount-not-number', 'amount must be a number.', (value) => typeof value === 'number')
                .test('amount-too-small', 'amount must be greater than 0.', (value) => {
                    if (value && !Number.isNaN(parseFloat(value))) {
                        return parseFloat(value) > 0;
                    } else if (value === ' ') {
                        return false;
                    }
                    return true;
                }),
            otherwise: Yup.number(),
        }),
});

/**
 * Returns a listing of an employee's direct deposits.
 */
export const list = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('directDeposits.handler.list');

    const { tenantId, employeeId } = event.pathParameters;
    const email = securityContext.principal.email;

    await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeDirectDepositList', 'CanRead');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const {
        requestContext: { domainName, path },
    } = event;

    const directDeposits: PaginatedResult = await directDepositService.list(
        employeeId,
        tenantId,
        event.queryStringParameters,
        domainName,
        path,
    );
    if (securityContext.currentRoleLevel === ApplicationRoleLevel.Employee) {
        directDeposits.results.map((directDeposit) => directDeposit.obfuscate());
    }

    if (directDeposits.results.length === 0) {
        return { statusCode: 204, headers: new Headers() };
    }

    return directDeposits;
});

/**
 * Creates a direct deposit for an employee.
 */
export const create = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('directDeposits.handler.post');

    const { tenantId, employeeId, companyId } = event.pathParameters;
    const email = securityContext.principal.email;

    await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeDirectDepositList', 'CanCreate');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);
    await utilService.validateRequestBody(directDepositPostSchema, requestBody);
    await utilService.validateRequestBody(bankAccountSchema, requestBody.bankAccount);
    // Validate that the request body doesn't have any extra fields
    utilService.checkAdditionalProperties(postValidationSchema, requestBody, 'direct deposit');
    utilService.checkAdditionalProperties(bankAccountValidationSchema, requestBody.bankAccount, 'bank account');

    const accessToken = event.headers.authorization.replace(/Bearer /i, '');

    const directDeposit = await directDepositService.create(employeeId, companyId, tenantId, accessToken, requestBody, email);
    if (securityContext.currentRoleLevel === ApplicationRoleLevel.Employee) {
        directDeposit.obfuscate();
    }

    utilService.sendEventNotification({
        urlParameters: event.pathParameters,
        invokerEmail: email,
        type: NotificationEventType.DirectDepositEvent,
        actions: [DirectDepositAction.Submitted, DirectDepositAction.ApprovalRequest],
        directDepositId: directDeposit.id,
    } as IDirectDepositEvent); // Async call to invoke notification lambda - DO NOT AWAIT!!

    return { statusCode: 201, headers: new Headers(), body: directDeposit };
});

/**
 * Updates a direct deposit for an employee.
 */
export const update = utilService.gatewayEventHandlerV2(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
    console.info('directDeposits.handler.patch');

    const { tenantId, employeeId, companyId } = event.pathParameters;
    const email = securityContext.principal.email;

    await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeDirectDepositList', 'CanUpdate');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchemaPatch);
    utilService.checkBoundedIntegralValues(event.pathParameters);
    await utilService.validateRequestBody(directDepositPatchSchema, requestBody);
    // await utilService.validateRequestBody(directDepositPatchSchemaAmount, requestBody);
    // Validate that the request body doesn't have any extra fields
    utilService.checkAdditionalProperties(patchValidationSchema, requestBody, 'direct deposit');

    const accessToken = event.headers.authorization.replace(/Bearer /i, '');
    const id = event.pathParameters.id;

    const directDeposit = await directDepositService.update(employeeId, tenantId, requestBody, id, accessToken, email, companyId);
    if (securityContext.currentRoleLevel === ApplicationRoleLevel.Employee) {
        directDeposit.obfuscate();
    }
    return { statusCode: 200, headers: new Headers(), body: directDeposit };
});

/**
 * Deletes a direct deposit for an employee.
 */
export const remove = utilService.gatewayEventHandlerV2(async ({ securityContext, event }: IGatewayEventInput) => {
    console.info('directDeposits.handler.delete');

    const { tenantId, employeeId, companyId } = event.pathParameters;
    const email = securityContext.principal.email;

    await securityContext.checkSecurityRoles(tenantId, employeeId, email, 'EmployeeDirectDepositList', 'CanDelete');

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchemaPatch);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const accessToken = event.headers.authorization.replace(/Bearer /i, '');
    const directDepositId = event.pathParameters.id;

    await directDepositService.remove(employeeId, tenantId, directDepositId, accessToken, email, companyId);

    return { statusCode: 204, headers: new Headers() };
});

/**
 * Returns a listing of beta flags for tenant.
 */
export const listBetaFlags = utilService.gatewayEventHandlerV2(async ({ event }: IGatewayEventInput) => {
    console.info('directDeposits.handler.listBetaFlags');

    const { tenantId } = event.pathParameters;

    utilService.normalizeHeaders(event);
    utilService.validateAndThrow(event.headers, headerSchema);
    utilService.validateAndThrow(event.pathParameters, betaFlagResourceUriSchema);
    utilService.checkBoundedIntegralValues(event.pathParameters);

    const betaFlags = await directDepositService.listBetaFlags(
        tenantId,
    );

    if (betaFlags.length === 0) {
        return { statusCode: 204, headers: new Headers() };
    }

    return betaFlags;
});