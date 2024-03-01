import * as AWS from 'aws-sdk';
import * as request from 'superagent';
import * as utils from '../../utils';

const configs = utils.getConfig();

export function getValidPostEmployeeDocumentObject(): any {
    return {
        fileName: 'filename.png',
        title: 'Create employee document integration test',
        employeeId: configs.employeeId,
        isPrivate: false,
        category: 'Integration test document',
        docType: 'png'
    };
}

export function getValidPostCompanyDocumentObject(): any {
    return {
        file: utils.uriEncodeTestFile('integration-tests/test-files/test.png'),
        fileName: 'Create company document integration test.png',
        title: 'Create company document integration test',
        category: 'Integration test category',
        isPublishedToEmployee: false,
    };
}

export function getValidPostSimpleSignDocumentObject(signatureRequestId: string): any {
    return {
        signatureRequestId,
        timeZone: 'America/New_York',
    };
}

export function getValidPatchCompanyDocumentObject(): any {
    return {
        fileObject: {
            file: utils.uriEncodeTestFile('integration-tests/test-files/test.png'),
            fileName: 'Update company document integration test.png',
        },
        title: 'Update company document integration test',
        category: 'Updated integration test category',
        isPublishedToEmployee: false,
    };
}

export function getValidPatchEmployeeDocumentObject(): any {
    return {
        title: 'Update employee document integration test',
        isPrivate: false,
    };
}

export function createCompanyDocument(baseUri: string, accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const url = `${baseUri}/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        const document = getValidPostCompanyDocumentObject();
        request
            .post(url)
            .send(document)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .end((error, response) => {
                if (error) {
                    reject(response.body);
                } else {
                    resolve(response.body);
                }
            });
    });
}

async function uploadTestEmployeeDocument(): Promise<void> {
    const s3Client = new AWS.S3({
        region: 'us-east-1',

        // Tidbit: Useful for running integration tests against under different
        //         AWS profiles without fiddling with bash profile defaults.
        //         Requires use of existing AWS Profiles.
        // credentials: new AWS.SharedIniFileCredentials({
        //     profile: 'default'
        //  })
    });

    const keyPrefix = `${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}`;

    await s3Client
        .upload({
            Bucket: configs.documentsBucket,
            Key: `${keyPrefix}/filename.png`,
            Body: utils.base64EncodeFile('integration-tests/test-files/test.png'),
            Metadata: {
                fileName: 'test.png',
                employeeId: `${configs.employeeId}`,
                title: `Create employee document integration test doc`,
            },
            ContentEncoding: 'base64',
            ContentType: 'image/png',
        })
        .promise();
}

export async function createEmployeeDocument(baseUri: string, accessToken: string): Promise<any> {
    await uploadTestEmployeeDocument();

    return new Promise((resolve, reject) => {
        const url = `${baseUri}/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        request
            .get(url)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .end((error, response) => {
                if (error) {
                    reject(response.body);
                } else {
                    resolve(response.body.results[0]); // return the latest item.
                }
            });
    });
}

export function deleteCompanyDocument(baseUri: string, accessToken: string, documentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const url = `${baseUri}/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${documentId}`;
        request
            .delete(url)
            .set('Authorization', `Bearer ${accessToken}`)
            .end((error, response) => {
                if (error) {
                    reject(response.body);
                } else {
                    resolve(response.body);
                }
            });
    });
}

export function deleteEmployeeDocument(baseUri: string, accessToken: string, documentId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const url = `${baseUri}/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${documentId}`;
        request
            .delete(url)
            .set('Authorization', `Bearer ${accessToken}`)
            .end((error) => {
                if (error) {
                    reject();
                } else {
                    resolve();
                }
            });
    });
}
