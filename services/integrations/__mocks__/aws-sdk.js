'use strict';

let AWS = jest.genMockFromModule('aws-sdk');

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
            console.log('headObject');
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
