import { setup } from '../../unit-test-mocks/mock';
import * as dbServiceMockData from '../../unit-test-mocks/mock-data/database-service-mock-data';
import * as mockData from '../../unit-test-mocks/mock-data/mock-data';
import * as utilService from '../../util.service';
import * as databaseService from './database.service';

describe('databaseService.saveDocumentToS3', () => {
    beforeEach(() => {
        setup();

        (utilService as any).checkForFileExistence = jest.fn((params: any) => {
            return dbServiceMockData.fileExistenceResponseArray;
        });
    });

    test('returns an s3 pointer and file extension', async () => {
        return await databaseService.saveDocumentToS3(dbServiceMockData.documentDBResponse, mockData.tenantId).then((response) => {
            expect(response).toEqual(dbServiceMockData.expectedS3ObjectResponse);
        });
    });
});
