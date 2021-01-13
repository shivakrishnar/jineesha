'use strict';

let AWS = jest.genMockFromModule('aws-sdk');
const mockData = require('../esignature/unit-tests/mock-data');

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
};

const promise = () => {
    return { catch: catchMethod };
};
const catchMethod = () => {
    console.log('catch');
};

module.exports = AWS;
