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

        headObject() {
            return {
                Metadata: mockData.documentMetadataS3Response,
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
