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
const createdCompanyDocumentIds: string[] = [];

const errorMessageSchema = JSON.parse(fs.readFileSync('services/api/models/ErrorMessage.json').toString());
const companyDocumentSchema = JSON.parse(fs.readFileSync('services/integrations/models/CompanyDocument.json').toString());
const uploadPresignedUrlSchema = JSON.parse(fs.readFileSync('services/integrations/models/UploadPresignedUrl.json').toString());

const schemas = [errorMessageSchema, companyDocumentSchema, uploadPresignedUrlSchema];

const enum schemaNames {
    ErrorMessage = 'ErrorMessage',
    CompanyDocument = 'CompanyDocument',
    UploadPresignedUrl = 'UploadPresignedUrl',
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('create company document', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            
            deleteAccessToken = await utils.getAccessToken(configs.sbAdminUser.username, configs.sbAdminUser.password);
            const jsonPayload = JSON.parse(Buffer.from(deleteAccessToken.split('.')[1], 'base64').toString())
            jsonPayload.scope.push("https://www.asuresoftware.com/iam/global.admin");
            deleteAccessToken = await utils.generateAccessToken(jsonPayload);

            document = documentsService.getValidPostCompanyDocumentObject();

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    afterAll(async (done) => {
        try {
            createdCompanyDocumentIds.forEach(async (id) => {
                await documentsService.deleteCompanyDocument(baseUri, deleteAccessToken, id);
            });

            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
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
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
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
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
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
        const uri = `/tenants/${configs.tenantId}/companies/${unknownCompanyId}/documents`;
        request(baseUri)
            .post(uri)
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
            file: 'bobam',
            fileName: 1234,
            title: 'title',
            category: 'bobam',
            isPublishedToEmployee: true,
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
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

    test('must return a 400 if a required field is not provided', (done) => {
        const invalidRequest = {
            fileName: 'name.png',
            title: 'title',
            category: 'bobam',
            isPublishedToEmployee: true,
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
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
            file: 'bobam',
            fileName: 'name.png',
            title: 'title',
            category: 'bobam',
            isPublishedToEmployee: true,
            extraField: 'man playing handball',
        };
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
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

    test('must return a 201 when a company document is created', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    createdCompanyDocumentIds.push(response.body.id);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, response.body);
                });
            });
    });

    test('must return a 201 when a company document with special characters in filename is created', (done) => {
        const testDocumentWithSpecialChars: any = Object.assign({}, document);
        testDocumentWithSpecialChars.fileName = `_Interview &&#$@ Questions Do's & Dont's $%@(1).pdf`;
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(testDocumentWithSpecialChars)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    createdCompanyDocumentIds.push(response.body.id);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, response.body);
                });
            });
    });

    test('must return a 201 when a company onboarding document with special characters in filename is created', (done) => {
        const testDocumentWithSpecialChars: any = Object.assign({}, document);
        testDocumentWithSpecialChars.fileName = `_Interview &&#$@ Questions Do's & Dont's $%@(1).pdf`;
        testDocumentWithSpecialChars.category = 'onboarding';
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(testDocumentWithSpecialChars)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(201)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    createdCompanyDocumentIds.push(response.body.id);
                    return utils.assertJson(schemas, schemaNames.CompanyDocument, response.body);
                });
            });
    });
});

describe('request upload url', () => {
    beforeAll(async (done) => {
        try {
            accessToken = await utils.getAccessToken();
            document = documentsService.getValidPostEmployeeDocumentObject();
            done();
        } catch (error) {
            done.fail(error);
        }
    });

    test('must return a 401 if a token is not provided', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
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
        const uri = `/tenants/${invalidTenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
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
        const uri = `/tenants/${unknownTenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
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

    test('must return a 400 if companyID is invalid', (done) => {
        const invalidCompanyId = '9bcwsdg9999A9999';
        const uri = `/tenants/${configs.tenantId}/companies/${invalidCompanyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
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

    test('must return a 400 if a supplied field is invalid', (done) => {
        const requestWithInvalidField: any = Object.assign({}, document);
        requestWithInvalidField.title = 1234;

        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(requestWithInvalidField)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if a required field is not provided', (done) => {
        const requestMissingRequiredField: any = Object.assign({}, document);
        delete requestMissingRequiredField.fileName;

        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(requestMissingRequiredField)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if filename does not have an extension', (done) => {
        const requestMissingFileExtension: any = Object.assign({}, document);
        requestMissingFileExtension.fileName = 'filename';

        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(requestMissingFileExtension)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 400 if category is not a string', (done) => {
        const requestWithIncorrectCategory: any = Object.assign({}, document);
        requestWithIncorrectCategory.category = 123;

        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(requestWithIncorrectCategory)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(400)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.ErrorMessage, response.body);
                });
            });
    });

    test('must return a 200 if category is not supplied', (done) => {
        const requestWithoutCategory: any = Object.assign({}, document);
        delete requestWithoutCategory.category;

        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(requestWithoutCategory)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.UploadPresignedUrl, response.body);
                });
            });
    });

    test('must return 200 with a presigned url', (done) => {
        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(document)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.UploadPresignedUrl, response.body);
                });
            });
    });

    test('must return 200 with a presigned url for filename with special characters', (done) => {
        const testDocumentWithSpecialChars: any = Object.assign({}, document);
        testDocumentWithSpecialChars.fileName = `_Interview &&#$@ Questions Do's & Dont's $%@(1).pdf`;

        const uri = `/tenants/${configs.tenantId}/companies/${configs.companyId}/documents/upload-url`;
        request(baseUri)
            .post(uri)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Content-Type', 'application/json')
            .send(testDocumentWithSpecialChars)
            .expect(utils.corsAssertions(configs.corsAllowedHeaderList))
            .expect(200)
            .end((error, response) => {
                utils.testResponse(error, response, done, () => {
                    return utils.assertJson(schemas, schemaNames.UploadPresignedUrl, response.body);
                });
            });
    });
});
