import 'reflect-metadata'; // required by asure.auth dependency
import * as utilService from '../../../util.service';
import * as helpers from '../src/helpers';
import * as employeeImportService from '../src/EmployeeImport.Service';
import * as mockData from './mock-data';
import * as mockDataCommon from './mock-data/mock-data-common';
import { setup } from '../../../unit-test-mocks/mock';
import { PaginatedResult } from '../../../pagination/paginatedResult';
import { ErrorMessage } from '../../../errors/errorMessage';
import * as webSocketNotification from '../../ws-notification/src/ws-notification.Service';
import * as configService from '../../../config.service';

describe('employeeImport.service.listDataImportTypes', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of all data import types', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportTypes') {
                return Promise.resolve(mockData.dataImportTypes);
            }
        });

        await employeeImportService.listDataImportTypes(mockDataCommon.tenantId).then((response) => {
            expect(response).toEqual(mockData.dataImportTypeResponse.recordset);
        });
    });

    test('returns empty for wrong tenant id', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportTypes') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.listDataImportTypes('123456789').then((response) => {
            expect(response).toEqual([]);
        });
    });
});

describe('employeeImport.service.listDataImports', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of data imports', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportByCompany') {
                return Promise.resolve(mockData.dataImports);
            }
        });

        await employeeImportService
            .listDataImports(mockDataCommon.tenantId, mockDataCommon.companyId, '', null, mockDataCommon.domainName, mockDataCommon.path)
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportsResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportsResponse.results);
            });
    });

    test('returns the list of data imports by data import type id', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportByCompanyAndDataImportType') {
                return Promise.resolve(mockData.dataImportsByDataImportTypeId);
            }
        });

        await employeeImportService
            .listDataImports(mockDataCommon.tenantId, 
                             mockDataCommon.companyId, 
                             mockDataCommon.dataImportTypeId, 
                             null, 
                             mockDataCommon.domainName, 
                             mockDataCommon.path)
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportsByDataImportTypeResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportsByDataImportTypeResponse.results);
            });
    });

    test('returns undefined when the company has no imports', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportByCompanyAndDataImportType') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService
            .listDataImports(mockDataCommon.tenantId, 
                             '123456789', 
                             mockDataCommon.dataImportTypeId, 
                             null, 
                             mockDataCommon.domainName, 
                             mockDataCommon.path)
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.service.listDataImportEventDetails', () => {
    beforeEach(() => {
        setup();
    });

    test('returns the list of data import event details', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportEventDetail') {
                return Promise.resolve(mockData.dataImportEventDetails);
            }
        });

        await employeeImportService
            .listDataImportEventDetails(
                mockDataCommon.tenantId,
                mockDataCommon.companyId,
                mockDataCommon.dataImportEventId,
                null,
                mockDataCommon.domainName,
                mockDataCommon.path,
            )
            .then((response) => {
                expect(response).toBeInstanceOf(PaginatedResult);
                expect(response.results.length).toBe(mockData.dataImportEventDetailsResponse.results.length);
                expect(response.results).toEqual(mockData.dataImportEventDetailsResponse.results);
            });
    });

    test('returns undefined when the company has no import event detail', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'listDataImportEventDetail') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService
            .listDataImportEventDetails(
                mockDataCommon.tenantId,
                mockDataCommon.companyId,
                mockDataCommon.dataImportEventId,
                null,
                mockDataCommon.domainName,
                mockDataCommon.path,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.getTemplate', () => {
    beforeEach(() => {
        setup();
    });

    test('returns undefined if data import type is wrong', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.getTemplate(mockDataCommon.tenantId, mockDataCommon.dataImportTypeId).then((response) => {
            expect(response).toBe(undefined);
        });
    });

    test('returns URL Presigned', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.queryReturnedDataImportTypeById);
            }
        });

        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('https://server/TemplateAR.xlsx');
        });

        await employeeImportService.getTemplate(mockDataCommon.tenantId, mockDataCommon.dataImportTypeId).then((response) => {
            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('mimeType');
        });
    });

    test('returns error when nothing is found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.queryReturnedDataImportTypeById);
            }
        });

        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('');
        });

        await employeeImportService.getTemplate(mockDataCommon.tenantId, mockDataCommon.dataImportTypeId).catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.developerMessage).toEqual('File not found');
        });
    });
});

describe('employeeImport.Service.uploadUrl', () => {
    beforeEach(() => {
        setup();
    });

    test('should return error cause filename is empty', async () => {
        await employeeImportService.uploadUrl(mockDataCommon.tenantId, mockDataCommon.companyId, '').catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.message).toEqual('The parameter fileName is required');
        });
    });

    test('returns URL Presigned', async () => {
        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('https://server/TemplateAR.xlsx');
        });

        await employeeImportService.uploadUrl(mockDataCommon.tenantId, mockDataCommon.companyId, 'Template.xlsx').then((response) => {
            expect(response).toHaveProperty('url');
            expect(response).toHaveProperty('mimeType');
        });
    });

    test('returns error when not found the URL pre-signed', async () => {
        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('');
        });

        await employeeImportService.uploadUrl(mockDataCommon.tenantId, mockDataCommon.companyId, 'Template.xlsx').catch((error) => {
            expect(error).toBeInstanceOf(ErrorMessage);
            expect(error.developerMessage).toEqual('URL pre-signed not found.');
        });
    });

});

describe('employeeImport.Service.dataImports', () => {

    beforeEach(() => {
        setup();
    }); 

    test('should return undefined when did not find the file uploaded', async () => {
        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('https://server/import-ee.xlsx');
        });

        (helpers as any).getFileFromPreSignedURL = jest.fn((transaction, params) => {
            return Promise.resolve('');
        });

        await employeeImportService.dataImports(mockDataCommon.tenantId, 
                                                mockDataCommon.companyId, 
                                                mockDataCommon.dataImportTypeId,
                                                'import-ee.xlsx', 
                                                1, 
                                                '').then((response) => {
            expect(response).toBe(undefined);
        });
    });

    test('should return undefined when did not find DataImportEventID after insert script', async () => {
        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('https://server/import-ee.xlsx');
        });

        (helpers as any).getFileFromPreSignedURL = jest.fn((transaction, params) => {
            return Promise.resolve(mockData.resultCSVAlternateRate);
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'insertDataImportEvent') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'insertDataImportEventDetail') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService.dataImports(mockDataCommon.tenantId, 
                                                mockDataCommon.companyId, 
                                                mockDataCommon.dataImportTypeId,
                                                'import-ee.xlsx', 
                                                1, 
                                                '').then((response) => {
            expect(response).toBe(undefined);
        });
    });

    test('should returns the inputs of the call to step function', async () => {
        (utilService as any).getSignedUrlSync = jest.fn((transaction, params) => {
            return Promise.resolve('https://server/import-ee.xlsx');
        });

        (helpers as any).getFileFromPreSignedURL = jest.fn((transaction, params) => {
            return Promise.resolve(mockData.resultCSVAlternateRate);
        });

        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'insertDataImportEvent') {
                return Promise.resolve(mockData.resultInsertDataImportEvent);
            }
            else if (payload.queryName === 'insertDataImportEventDetail') {
                return Promise.resolve(mockData.resultInsertDataImportEvent);
            }
        });

        (utilService as any).StartStateMachineExecution = jest.fn((transaction, params) => {
            return Promise.resolve({});
        });

        await employeeImportService.dataImports(mockDataCommon.tenantId, 
                                                mockDataCommon.companyId, 
                                                mockDataCommon.dataImportTypeId,
                                                'import-ee.xlsx', 
                                                1, 
                                                '').then((response) => {
            expect(response).toHaveProperty('tenantId');      
            expect(response).toHaveProperty('companyId');
            expect(response).toHaveProperty('dataImportTypeId');
            expect(response).toHaveProperty('fileName');
            expect(response).toHaveProperty('dataImportEventId');
            expect(response).toHaveProperty('csvRelativePath');
            expect(response).toHaveProperty('userId');
            expect(response).toHaveProperty('hrAccessToken');

        });
    });

});

describe('employeeImport.Service.setFailedDataImportEvent', () => {
    beforeEach(() => {
        setup();
    });

    test('returns error when tenantId is null', async () => {
        await employeeImportService
            .setFailedDataImportEvent(
                undefined,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'test',
                mockDataCommon.accessToken,
            )
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error.developerMessage).toBe('Expected value to tenantId and dataImportEventId not met.')
            });
    });

    test('set failed status successfully', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'updateDataImportEventError') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }            
        });

        await employeeImportService
            .setFailedDataImportEvent(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'test',
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('set failed status successfully with no user to notify', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'updateDataImportEventError') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.resultDataImportTypeById);
            }            
        });

        (utilService as any).getConnectionsFromDynamoDBUsingAccessToken = jest.fn((transaction, payload) => {
            return Promise.resolve(mockDataCommon.queryReturnedEmpty);                        
        });

        await employeeImportService
            .setFailedDataImportEvent(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'test',
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('set failed status successfully with user to notify', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'updateDataImportEventError') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.resultDataImportTypeById);
            }            
        });

        (utilService as any).getConnectionsFromDynamoDBUsingAccessToken = jest.fn((transaction, payload) => {
            return Promise.resolve(mockData.resultConnectionsToNotify);                        
        });

        (webSocketNotification as any).notifyClient = jest.fn((transaction, payload) => {
            return Promise.resolve(undefined);                        
        });

        await employeeImportService
            .setFailedDataImportEvent(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'test',
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

});

describe('employeeImport.Service.setDataImportEventStatusGlobal', () => {
    beforeEach(() => {
        setup();
    });

    test('returns error when tenantId is null', async () => {
        await employeeImportService
            .setDataImportEventStatusGlobal(
                undefined,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'Failed',
                1,
                mockDataCommon.accessToken,
            )
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error.developerMessage).toBe('Expected value to tenantId, dataImportEventId or dataImportTypeId not met.')
            });
    });

    test('set failed status successfully', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'updateDataImportEventStatus') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }            
        });

        await employeeImportService
            .setDataImportEventStatusGlobal(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'Failed',
                0,
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('set failed status successfully with no user to notify', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'updateDataImportEventStatus') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.resultDataImportTypeById);
            }            
        });

        (utilService as any).getConnectionsFromDynamoDBUsingAccessToken = jest.fn((transaction, payload) => {
            return Promise.resolve(mockDataCommon.queryReturnedEmpty);                        
        });

        await employeeImportService
            .setDataImportEventStatusGlobal(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'Failed',
                0,
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('set failed status successfully with user to notify', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'updateDataImportEventStatus') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockData.resultDataImportTypeById);
            }
        });

        (utilService as any).getConnectionsFromDynamoDBUsingAccessToken = jest.fn((transaction, payload) => {
            return Promise.resolve(mockData.resultConnectionsToNotify);
        });

        (webSocketNotification as any).notifyClient = jest.fn((transaction, payload) => {
            return Promise.resolve(undefined);
        });

        await employeeImportService
            .setDataImportEventStatusGlobal(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                'Failed',
                0,
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });
});

describe('employeeImport.Service.processFinalStatusAndNotify', () => {
    beforeEach(() => {
        setup();
    });

    test('returns error when tenantId is null', async () => {
        await employeeImportService
            .processFinalStatusAndNotify(
                undefined,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                mockDataCommon.accessToken,
            )
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error.developerMessage).toBe('Expected value to tenantId and dataImportEventId not met.')
            });
    });
    
    test('should returns undefined if Import Event Detail not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportEventDetailSummary') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService
            .processFinalStatusAndNotify(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('should returns undefined if user not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportEventDetailSummary') {
                return Promise.resolve(mockData.resultDataImportDetailFailed);
            }
            else if (payload.queryName === 'updateDataImportEventStatus') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getUserFromDataImportEventID') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        await employeeImportService
            .processFinalStatusAndNotify(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('should returns undefined after send notification', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getDataImportEventDetailSummary') {
                return Promise.resolve(mockData.resultDataImportDetailPartiallyProcessed);
            }
            else if (payload.queryName === 'updateDataImportEventStatus') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getDataImportTypeById') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
            else if (payload.queryName === 'getUserFromDataImportEventID') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        (utilService as any).sendEventNotification = jest.fn((transaction, payload) => {
            return Promise.resolve(undefined);
        });

        await employeeImportService
            .processFinalStatusAndNotify(
                mockDataCommon.tenantId,
                mockDataCommon.dataImportEventId,
                mockDataCommon.dataImportTypeId,
                mockDataCommon.accessToken,
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

});

describe('employeeImport.Service.downloadImportData', () => {
    beforeEach(() => {
        setup();
    });

    test('returns error when path not found', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        const fixQueryParams: any = {
        };

        await employeeImportService
            .downloadImportData(
                mockDataCommon.tenantId,
                mockDataCommon.companyId,
                '123',
                fixQueryParams,
                '',
                ''
            )
            .catch((error) => {
                expect(error).toHaveProperty('developerMessage');
                expect(error.developerMessage).toBe('Import type not found')
            });
    });

    test('returns pre signed url from original file', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultImportTypeAndImportedFilePath);
            }
        });

        (configService as any).getEmployeeImportBucketName = jest.fn((transaction, payload) => {
            return Promise.resolve('bucketname');
        });

        (utilService as any).getSignedUrlSync = jest.fn((transaction, payload) => {
            return Promise.resolve('https://pre/signed/url');
        });

        const fixQueryParams: any = {
        };

        await employeeImportService
            .downloadImportData(
                mockDataCommon.tenantId,
                mockDataCommon.companyId,
                '123',
                fixQueryParams,
                '',
                ''
            )
            .then((response) => {
                expect(response).toHaveProperty('data');
                expect(response).toHaveProperty('mimeType');
                expect(response.data).toBe('https://pre/signed/url')
                expect(response.mimeType).toBe('.text/csv; charset=utf-8')
            });
    });

    test('returns undefined when not found CSV Rows by specific status', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultImportTypeAndImportedFilePath);
            }
            else if (payload.queryName === 'getCSVRowsByStatus') {
                return Promise.resolve(mockDataCommon.queryReturnedEmpty);
            }
        });

        (utilService as any).validateQueryParams = jest.fn((transaction, payload) => {
            return Promise.resolve(undefined);
        });

        const fixQueryParams: any = {
            status: 'Failed'
        };

        await employeeImportService
            .downloadImportData(
                mockDataCommon.tenantId,
                mockDataCommon.companyId,
                '123',
                fixQueryParams,
                '',
                ''
            )
            .then((response) => {
                expect(response).toBe(undefined);
            });
    });

    test('returns pre signed url by specific status', async () => {
        (utilService as any).invokeInternalService = jest.fn((transaction, payload) => {
            if (payload.queryName === 'getImportTypeAndImportedFilePathByImportEventID') {
                return Promise.resolve(mockData.resultImportTypeAndImportedFilePath);
            }
            else if (payload.queryName === 'getCSVRowsByStatus') {
                return Promise.resolve(mockData.resultCSVRowsAndNotes);
            }
        });

        (utilService as any).validateQueryParams = jest.fn((transaction, payload) => {
            return Promise.resolve(undefined);
        });

        const fixQueryParams: any = {
            status: 'Failed'
        };

        await employeeImportService
            .downloadImportData(
                mockDataCommon.tenantId,
                mockDataCommon.companyId,
                '123',
                fixQueryParams,
                '',
                ''
            )
            .then((response) => {
                expect(response).toHaveProperty('data');
                expect(response).toHaveProperty('mimeType');
                expect(response.mimeType).toBe('.text/csv; charset=utf-8');
            });
    });

});
