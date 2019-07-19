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
