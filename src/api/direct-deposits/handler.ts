import * as brnv from 'bank-routing-number-validator';
import * as Yup from 'yup';
import { Headers } from '../../models/headers';
import * as utilService from '../../util.service';
import * as directDepositService from './direct-deposit.service';

import { ApplicationRoleLevel } from '../../authentication/ApplicationRoleLevelEnum';
import { IGatewayEventInput } from '../../util.service';

const headerSchema = {
  authorization: { required: true, type: String}
};

const directDepositsResourceUriSchema = {
  tenantId: { required: true, type: String },
  companyId: { required: true, type: String },
  employeeId:   { required: true, type: String },
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

const bankAccountSchema = Yup.object().shape({
  routingNumber: Yup
    .string()
    .min(9, 'routingNumber must be nine characters.')
    .max(9, 'routingNumber must be nine characters.')
    .required()
    .test('routing-number-bad-format', 'routingNumber must be in a valid format.', (value) => brnv.ABARoutingNumberIsValid(value)),
  accountNumber: Yup
    .string()
    .test('accountNumber-empty', 'accountNumber is a required field', (value) => (value ? value.trim() !== '' : true))
    .matches(new RegExp('^[a-zA-Z0-9]+$'), { message: 'accountNumber cannot contain special characters.'})
    .required(),
  designation: Yup
    .string()
    .required()
    .oneOf(['Checking', 'Savings', 'MoneyMarket'], "designation must be one of the following values: 'Checking', 'Savings', 'MoneyMarket'."),
});

const directDepositPostSchema = Yup.object().shape({
  bankAccount: Yup
    .object()
    .required(),
  amountType: Yup
    .string()
    .required()
    .oneOf(['Flat', 'Percentage', 'Balance Remainder'], "amountType must be one of the following values: 'Flat', 'Percentage', 'Balance Remainder'"),
  amount: Yup
    .mixed()
    .when('amountType', {
      is: 'Percentage',
      then: Yup
        .number()
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
      then: Yup
        .number()
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
export const list = utilService.gatewayEventHandler(async ({ securityContext, event }: IGatewayEventInput) => {
  console.info('directDeposits.handler.list');

  const tenantId =  securityContext.principal.tenantId;
  const email =  securityContext.principal.email;

  await securityContext.checkSecurityRoles(tenantId, email, 'EmployeeDirectDepositList', 'CanRead');

  utilService.normalizeHeaders(event);
  utilService.validateAndThrow(event.headers, headerSchema);
  utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchema);

  const employeeId = event.pathParameters.employeeId;

  const directDeposits = await directDepositService.list(employeeId, tenantId);
  if (securityContext.currentRoleLevel === ApplicationRoleLevel.Employee) {
    directDeposits.results.map((directDeposit) => directDeposit.obfuscate());
  }

  return directDeposits;
});

/**
 * Creates a direct deposit for an employee.
 */
export const create = utilService.gatewayEventHandler(async ({ securityContext, event, requestBody }: IGatewayEventInput) => {
  console.info('directDeposits.handler.post');

  const tenantId = securityContext.principal.tenantId;
  const email =  securityContext.principal.email;

  await securityContext.checkSecurityRoles(tenantId, email, 'EmployeeDirectDepositList', 'CanCreate');

  utilService.normalizeHeaders(event);
  utilService.validateAndThrow(event.headers, headerSchema);
  utilService.validateAndThrow(event.pathParameters, directDepositsResourceUriSchema);
  await utilService.validateRequestBody(directDepositPostSchema, requestBody);
  await utilService.validateRequestBody(bankAccountSchema, requestBody.bankAccount);
  // Validate that the request body doesn't have any extra fields
  utilService.checkAdditionalProperties(postValidationSchema, requestBody, 'direct deposit');
  utilService.checkAdditionalProperties(bankAccountValidationSchema, requestBody.bankAccount, 'bank account');

  const employeeId = event.pathParameters.employeeId;

  const directDeposit = await directDepositService.create(employeeId, tenantId, requestBody);
  if (securityContext.currentRoleLevel === ApplicationRoleLevel.Employee) {
    directDeposit.obfuscate();
  }
  return { statusCode: 201, headers: new Headers(), body: directDeposit };
});