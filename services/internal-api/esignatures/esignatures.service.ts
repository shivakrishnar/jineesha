import * as AWS from 'aws-sdk';

import * as configService from '../../config.service';
import * as hellosignService from '../../remote-services/hellosign.service';
import * as utilService from '../../util.service';

import { DatabaseEvent, QueryType } from '../../internal-api/database/events';
import { ParameterizedQuery } from '../../queries/parameterizedQuery';
import { Queries } from '../../queries/queries';
import { InvocationType } from '../../util.service';

const s3Client = new AWS.S3({
    region: configService.getAwsRegion(),
    useAccelerateEndpoint: true,
});

/**
 * Uploads a copy of a signed e-signature document to S3
 * @param {any} request: The signature request object
 * @returns {Promise<boolean>} A Promise of the status of the execution
 */
export async function uploadSignedDocument(request: any): Promise<boolean> {
    console.info('esignatureService.uploadSignedDocument');

    const {
        metadata: { tenantId, companyId, employeeCodes, category },
        signature_request_id: requestId,
        title,
    } = request;

    try {
        const response = JSON.parse(await hellosignService.getFileBySignatureRequestId(requestId));
        const [fileData, file] = response.data_uri.split(', ');

        const fileBuffer = new Buffer(file, 'base64');
        const contentType = fileData.split(':')[1].split(';')[0];
        const extension = fileData.split(';')[0].split('/')[1];

        const key = `${tenantId}/${companyId}/${requestId}.${extension}`;

        s3Client
            .upload({
                Bucket: configService.getFileBucketName(),
                Key: key,
                Body: fileBuffer,
                ContentEncoding: 'base64',
                ContentType: contentType,
                Metadata: {
                    isESignedDocument: 'true',
                },
            })
            .promise()
            .catch((e) => {
                throw new Error(e);
            });

        // Check for duplicate records with the same pointer
        let query = new ParameterizedQuery('CheckForDuplicateFileMetadata', Queries.checkForDuplicateFileMetadata);
        query.setParameter('@pointer', key);
        let payload = {
            tenantId,
            queryName: query.name,
            query: query.value,
            queryType: QueryType.Simple,
        } as DatabaseEvent;
        const result: any = await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        if (result.recordset.length > 0) {
            console.info(`Record with pointer ${key} already found.`);
            return true;
        }

        for (const code of employeeCodes) {
            query = new ParameterizedQuery('createFileMetadata', Queries.createFileMetadata);
            query.setParameter('@companyId', companyId);
            query.setParameter('@employeeCode', `'${code}'`);
            query.setParameter('@title', `${title.replace(/'/g, "''")}`);
            query.setParameter('@category', `'${category}'`); // TODO: (MJ-2669) string interpolation no longer needed after making Category column not nullable
            query.setParameter('@uploadDate', new Date().toISOString());
            query.setParameter('@pointer', key);
            query.setParameter('@uploadedBy', 'NULL');
            query.setParameter('@isPublishedToEmployee', '1');
            payload = {
                tenantId,
                queryName: query.name,
                query: query.value,
                queryType: QueryType.Simple,
            } as DatabaseEvent;
            await utilService.invokeInternalService('queryExecutor', payload, InvocationType.RequestResponse);
        }
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
