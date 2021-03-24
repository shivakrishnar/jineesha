import 'reflect-metadata'; // required by asure.auth dependency

import * as jwt from 'jsonwebtoken';
import * as utilService from '../../../util.service';
import * as notificationService from '../notification.service';
import * as mockData from './mock-data';

import { setup } from '../../../unit-test-mocks/mock';

jest.mock('jsonwebtoken');

describe('notification.service.request', () => {
    beforeEach(() => {
        setup();
        (jwt.decode as jest.Mock).mockImplementation(() => ({ applicationId: '123456' }))
    });


    test('successfully send request email to employee', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listAlerts') {
                return Promise.resolve(mockData.alertDBResponse);
            } else if (payload.queryName === 'esignatureMetadata') {
                return Promise.resolve(mockData.esignatureMetadataDBResponse)
            } else if (payload.queryName === 'smtpCredentials') {
                return Promise.resolve(mockData.smtpCredentialsDBResponse)
            }
        });

        (utilService as any).getSecret = jest.fn(() => {
            return JSON.stringify({ username: 'randomuser', password: 'randompassword' })
        });

        return await notificationService
            .processEvent(mockData.requestEvent)
            .then((response) => {
                expect(response).toEqual(true);
            })  
    });
});