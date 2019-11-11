import * as fs from 'fs';
import * as request from 'supertest';
import * as uuidV4 from 'uuid/v4';
import * as utils from '../../utils';
import * as documentsService from './documents.service';

const configs = utils.getConfig();
const baseUri = `${configs.nonProxiedApiDomain}/integrations`;

let accessToken: string;
let deleteAccessToken: string;
let document: any;
let createdDocument: any;

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const companyDocumentSchema = JSON.parse(fs.readFileSync('services/integrations/models/CompanyDocument.json').toString());
const updateEmployeeDocumentSchema = JSON.parse(fs.readFileSync('services/integrations/models/UpdateEmployeeDocument.json').toString());

const schemas = [errorMessageSchema, companyDocumentSchema, updateEmployeeDocumentSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    CompanyDocument = 'CompanyDocument',
    UpdateEmployeeDocument = 'UpdateEmployeeDocument',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('update company document', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            deleteAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            createdDocument = await documentsService.createCompanyDocument(baseUri, accessToken);
            document = documentsService.getValidPatchCompanyDocumentObject();

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    afterAll(async (done) => {
        try {
            await documentsService.deleteCompanyDocument(baseUri, deleteAccessToken, createdDocument.id);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if companyID is not found', (done) => {
        const unknownCompanyId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if documentId is invalid', (done) => {
        const invalidDocumentId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${invalidDocumentId}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if documentId is not found', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.nonExistingDocumentId
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a supplied field is invalid', (done) => {
        const invalidRequest = {
            title: 123,
            category: 'bobam',
            isPublishedToEmployee: true,
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if an additional field is provided', (done) => {
        const invalidRequest = {
            title: 'title',
            category: 'bobam',
            isPublishedToEmployee: true,
            extraField: 'man playing handball',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if fileName does not have an extension', (done) => {
        const invalidRequest = {
            fileObject: {
                file: 'test',
                fileName: 'this is a name without an extension',
            },
            title: 'title',
            category: 'bobam',
            isPublishedToEmployee: true,
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 200 when a non-signatory company document is updated', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${createdDocument.id}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, response.body);
                });
            });
    });

    test('must return a 200 when a legacy company document title is updated', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.legacyCompanyDocumentId
        }`;

        const updatedDocument = {
            title: 'Updated Document Title',
        };

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(updatedDocument)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    const responsePayload = response.body;
                    expect(responsePayload.title).toBe(updatedDocument.title);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, responsePayload);
                });
            });
    });

    test(`must return a 200 when a legacy company document's category is updated`, (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.legacyCompanyDocumentId
        }`;

        const updatedDocument = {
            category: 'Updated Document Category',
        };

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(updatedDocument)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    const responsePayload = response.body;
                    expect(responsePayload.category).toBe(updatedDocument.category);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, responsePayload);
                });
            });
    });

    test(`must return a 200 when a legacy company document's employee published status is updated`, (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.legacyCompanyDocumentId
        }`;

        const updatedDocument = {
            isPublishedToEmployee: !document.isPublishedToEmployee,
        };

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(updatedDocument)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    const responsePayload = response.body;
                    expect(responsePayload.isPublishedToEmployee).toBe(!document.isPublishedToEmployee);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, responsePayload);
                });
            });
    });

    test(`must return a 200 when a legacy company document's file is updated`, (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.legacyCompanyDocumentId
        }`;

        const updatedDocument = Object.assign({}, document);
        delete updatedDocument.title;
        delete updatedDocument.category;
        delete updatedDocument.isPublishedToEmployee;
        updatedDocument.fileObject.fileName = 'Updated File name.png';

        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(updatedDocument)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    const responsePayload = response.body;
                    expect(responsePayload.fileName).toBe(updatedDocument.fileObject.fileName);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, responsePayload);
                });
            });
    });

    test(`must return a 200 when all of a legacy company document's metadata updated`, (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/${
            configs.esignature.legacyCompanyDocumentId
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, response.body);
                });
            });
    });
});

describe('update employee document', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            deleteAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            createdDocument = await documentsService.createEmployeeDocument(baseUri, accessToken);
            document = documentsService.getValidPatchEmployeeDocumentObject();

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    afterAll(async (done) => {
        try {
            await documentsService.deleteEmployeeDocument(baseUri, deleteAccessToken, createdDocument.id);

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(401)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return undefined;
                });
            });
    });

    test('must return a 400 if tenantID is invalid', (done) => {
        const invalidTenantId = '99999999';
        const uri: string = `/tenants/${invalidTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if tenantID is not found', (done) => {
        const unknownTenantId = uuidV4();
        const uri: string = `/tenants/${unknownTenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if companyID is not found', (done) => {
        const unknownCompanyId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if employeeID is not found', (done) => {
        const unknownEmployeeId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${unknownEmployeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if documentId is invalid', (done) => {
        const invalidDocumentId = 999999999;
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${
            configs.employeeId
        }/documents/${invalidDocumentId}`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 404 if documentId is not found', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            configs.esignature.nonExistingDocumentId
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(404)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a supplied field is invalid', (done) => {
        const invalidRequest = {
            title: 123,
            isPrivate: false,
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if an additional field is provided', (done) => {
        const invalidRequest = {
            title: 'title',
            isPrivate: true,
            extraField: 'man playing handball',
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if fileName does not have an extension', (done) => {
        const invalidRequest = {
            fileObject: {
                file: 'test',
                fileName: 'this is a name without an extension',
            },
            title: 'title',
            isPrivate: true,
        };
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(invalidRequest)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 200 when an employee document is updated', (done) => {
        const uri: string = `/tenants/${configs.tenantId}/companies/${configs.companyId}/employees/${configs.employeeId}/documents/${
            createdDocument.id
        }`;
        request(baseUri)
            .patch(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.UpdateEmployeeDocument, response.body);
                });
            });
    });
});
