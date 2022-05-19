'use strict';

let AWS = jest.genMockFromModule('aws-sdk');
const mockData = require('../services/integrations/esignature/unit-tests/mock-data');
const { awsMockMethods, catchMethod, promiseResult } = require('../services/unit-test-mocks/aws-sdk-mock');

const promise = () => {
    return { catch: catchMethod };
};

// TODO: refactor this to utilize new mocking solution
AWS = {
    S3: class {
        constructor({ region }) {
            console.log(region);
            return this;
        }

        getSignedUrl() {
            return 'www.mysignedurl.com';
        }

        upload() {
            console.log('upload');
            return { promise };
        }

        deleteObject() {
            console.log('deleteObject');
            return { promise };
        }

        copyObject() {
            console.log('copyObject');
            return { promise };
        }

        headObject(objectInfo) {
            return objectInfo.Bucket
                ? {
                      promise: () => {
                          return {
                              catch: catchMethod,
                              Metadata: mockData.documentMetadataS3Response,
                          };
                      },
                  }
                : undefined;
        }

        getObject(objectInfo) {
            const metadata = Object.assign({}, mockData.documentMetadataS3Response);
            switch (objectInfo.Bucket) {
                case 'jpg':
                    metadata.filename = 'test.jpg';
                    break;
                case 'png':
                    metadata.filename = 'test.png';
                default:
            }
            return {
                promise: () => {
                    return {
                        catch: catchMethod,
                        Metadata: metadata,
                        Body: 'test',
                    };
                },
            };
        }
    },
    DynamoDB: {
        DocumentClient: class {
            constructor() {
                return this;
            }

            query(params) {
                if (params.ExpressionAttributeValues[':TenantID'] === mockData.nonExistentTenantId) {
                    return {
                        promise: () => {
                            return {
                                catch: catchMethod,
                                Items: [],
                            };
                        },
                    };
                }

                let IsDirectClient = false;
                if (params.ExpressionAttributeValues[':TenantID'] === mockData.directClientTenantId) {
                    IsDirectClient = true;
                }
                return {
                    promise: () => {
                        return {
                            catch: catchMethod,
                            Items: [
                                {
                                    IsDirectClient,
                                },
                            ],
                        };
                    },
                };
            }

            scan = awsMockMethods.dynamodb.scan
            update = awsMockMethods.dynamodb.update || promiseResult
        },
    },
    SSM: class {
        constructor() {
            return this;
        }

        getParameter(params) {
            let response = mockData.directClientPricingData;
            if (params.Name.includes('indirectClientPricingData')) {
                response = mockData.indirectClientPricingData;
            } else if (params.Name.includes('legacyClientCutOffDate')) {
                response = mockData.legacyClientCutOffDate;
            }
            return {
                promise: () => {
                    return {
                        Parameter: {
                            Value: response,
                        },
                    };
                },
            };
        }
    },
    SNS: class {
        constructor() {
            return this
        }

        publish = awsMockMethods.sns.publish || promiseResult
    }
};


module.exports = AWS;
