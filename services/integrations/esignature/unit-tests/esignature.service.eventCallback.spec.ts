import 'reflect-metadata'; // required by asure.auth dependency

import * as AWS from 'aws-sdk';
import { getFileBucketName } from '../../../config.service';
import { DatabaseEvent, QueryType } from '../../../internal-api/database/events';
import { uploadSignedDocument } from '../../../internal-api/esignatures/esignatures.service';
import { ParameterizedQuery } from '../../../queries/parameterizedQuery';
import { Queries } from '../../../queries/queries';
import * as hellosignService from '../../../remote-services/hellosign.service';
import { setup } from '../../../unit-test-mocks/mock';
import * as utilService from '../../../util.service';

const tenantId = 'c807d7f9-b319-4525-ae0e-31cbd0cf202b';
const companyId = '600990';
const employeeCodes = ['abcde'];
const category = 'onboarding';
const requestId = '57fdf37cf3388e2c446e43f4d4e00d0f618dca64';
const title = 'test document';
const contentType = 'palindrome';
const extension = 'txt';
const file = 'YSBtYW4gYSBwbGFuIGEgY2FuYWwgcGFuYW1h';
const mockRequest = {
    metadata: { tenantId, companyId, employeeCodes, category },
    signature_request_id: requestId,
    title,
};

describe('esignatureService.company-categories.list', () => {
    beforeEach(() => {
        setup();
        (hellosignService as any).getFileBySignatureRequestId = jest.fn((params: any) => {
            return JSON.stringify({ data_uri: `content-type:${contentType}/${extension};, ${file}` });
        });
        Date.prototype.toISOString = jest.fn(() => '1970-01-01');
    });

    test('Saves the doc to S3 and adds the metadata to the database if it does not already exists', () => {
        // build test specific mocks
        (utilService as any).invokeInternalService = jest.fn((params: any) => {
            return { recordset: [] };
        });

        // set up expected calls
        const query = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
        query.setParameter('@companyId', companyId);
        query.setParameter('@title', `${title.replace(/'/g, "''")}`);
        query.setParameter('@category', `'${category}'`); // TODO: (MJ-2669) string interpolation no longer needed after making Category column not nullable
        query.setParameter('@uploadDate', new Date().toISOString());
        query.setParameter('@pointer', `${tenantId}/${companyId}/${requestId}.${extension}`);
        query.setParameter('@uploadedBy', 'NULL');
        query.setParameter('@isPublishedToEmployee', '1');
        const expectedPayload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;

        const expectedS3Request = {
            Bucket: getFileBucketName(),
            Key: `${tenantId}/${companyId}/${requestId}.${extension}`,
            Body: new Buffer(file, 'base64'),
            ContentEncoding: 'base64',
            ContentType: contentType,
            Metadata: {
                isESignedDocument: 'true',
            },
        };

        // run service, test expectations
        uploadSignedDocument(mockRequest).then((response) => {
            expect(AWS.S3.prototype.upload).toHaveBeenCalledWith(expectedS3Request);
            expect(utilService.invokeInternalService).toHaveBeenCalledWith(
                'queryExecutor',
                expectedPayload,
                utilService.InvocationType.RequestResponse,
            );
            expect(response).toBe(true);
        });
    });

    test('Saves the doc to S3 and leaves the database unchanged if the document already exists', () => {
        // build test specific mocks
        (utilService as any).invokeInternalService = jest.fn((params: any) => {
            return { recordset: ['this has a lenght > 0'] };
        });

        // set up expected calls
        const expectedS3Request = {
            Bucket: getFileBucketName(),
            Key: `${tenantId}/${companyId}/${requestId}.${extension}`,
            Body: new Buffer(file, 'base64'),
            ContentEncoding: 'base64',
            ContentType: contentType,
            Metadata: {
                isESignedDocument: 'true',
            },
        };

        // run service, test expectations
        global.console.info = jest.fn();
        uploadSignedDocument(mockRequest).then((response) => {
            expect(AWS.S3.prototype.upload).toHaveBeenCalledWith(expectedS3Request);
            expect(console.info).toHaveBeenCalledWith(
                `Record with pointer ${tenantId}/${companyId}/${requestId}.${extension} already found.`,
            );
            expect(response).toBe(true);
        });
    });
});
