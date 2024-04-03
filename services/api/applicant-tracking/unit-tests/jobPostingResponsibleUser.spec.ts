import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as jobPostingResponsibleUserService from '../src/JobPostingResponsibleUser.Service';
import * as mockData from './mock-data/jobPostingResponsibleUser-mock-data';
import * as sharedMockData from './mock-data/shared-mock-data';
import { ErrorMessage } from '../../../errors/errorMessage';

describe('createJobPostingResponsibleUser', () => {
    test('returns error if the combination alread exists', () => {

        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            return await Promise.resolve(mockData.createJobPostingResponsibleUserDBResponseEmpty);
        });

        return jobPostingResponsibleUserService
            .createJobPostingResponsibleUser(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createJobPostingResponsibleUserRequestBody,
            )
            .catch((error) => {
                expect(error).toBeInstanceOf(ErrorMessage);
                expect(error.statusCode).toEqual(422);
                expect(error.code).toEqual(74);
                expect(error.developerMessage).toEqual(`Was not possible to create the resource`);
                expect(error.moreInfo).toEqual('');
            });
    });

    test('creates and returns a JobPostingResponsibleUser', async () => {
        (utilService as any).invokeInternalService = jest.fn(async (transaction, payload) => {
            if (payload.queryName === 'createJobPostingResponsibleUser') {
                const result = await Promise.resolve(mockData.createJobPostingResponsibleUserDBResponse);
                return result;
            } else if (payload.queryName === 'getJobPostingResponsibleUserByJobPostingAndUser') {
                const result = await Promise.resolve(mockData.getJobPostingResponsibleUserDBResponse);
                return result;
            } else {
                return {};
            }
        });

        (utilService as any).logToAuditTrail = jest.fn(() => {
            return {};
        });

        return await jobPostingResponsibleUserService
            .createJobPostingResponsibleUser(
                sharedMockData.tenantId,
                sharedMockData.userEmail,
                mockData.createJobPostingResponsibleUserRequestBody,
            )
            .then((result) => {
                expect(result).toEqual(mockData.createJobPostingResponsibleUserRequestBody);
            });
    });
});
