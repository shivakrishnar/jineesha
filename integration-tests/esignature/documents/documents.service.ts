import * as request from 'superagent';
import * as utils from '../../utils';

const configs = utils.getConfig();

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

export function createEmployeeDocument(baseUri: string, accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const url = `${baseUri}/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents`;
        const document = getValidPostEmployeeDocumentObject();
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
        const url = `${baseUri}/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/documents/${documentId}`;
        request
            .delete(url)
            .set('Authorization', `Bearer ${accessToken}`)
            .end((error, response) => {
                if (error) {
                    reject();
                } else {
                    resolve();
                }
            });
    });
}

export function getValidPostEmployeeDocumentObject(): any {
    return {
        file: utils.uriEncodeTestFile('integration-tests/test-files/test.png'),
        fileName: 'Create employee document integration test.png',
        title: 'Create employee document integration test',
        isPrivate: false,
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
        fileObject: {
            file: utils.uriEncodeTestFile('integration-tests/test-files/test.png'),
            fileName: 'Update employee document integration test.png',
        },
        title: 'Update employee document integration test',
        isPrivate: false,
    };
}
