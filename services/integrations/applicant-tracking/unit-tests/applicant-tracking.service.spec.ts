import 'reflect-metadata'; // required by asure.auth dependency

import * as utilService from '../../../util.service';
import * as applicantTrackingService from '../src/applicant-tracking.service';
import * as mockData from './mock-data/mock-data';
import { setup } from '../../../unit-test-mocks/mock';
import * as request from 'request-promise-native';

                 
describe('applicantTrackingService.applicantDataImport',()=> {
    beforeEach(() => {
        setup();
    });
    
    test('creates applicant data',async () => {
        (request as any).get = jest.fn((url: any)=> {
            return Promise.resolve(JSON.stringify(mockData.documentResponse));
        });


        (utilService as any).invokeInternalService = jest.fn((serviceName,payload) => {
            if (payload.queryName === 'ApplicantCreate') {
                return Promise.resolve(mockData.outputResponseObject);
            } else if (payload.queryName === 'DocumentCreate'){
                return Promise.resolve(mockData.emptyDBResponse);
            }
        });

        expect(await applicantTrackingService
            .createApplicantData(
                 mockData.tenantId
                ,mockData.companyId
                ,mockData.postObject
            )).toBeUndefined()
            
    });
});