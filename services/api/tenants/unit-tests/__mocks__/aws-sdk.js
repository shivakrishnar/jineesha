'use strict';

let AWS = jest.genMockFromModule('aws-sdk');

AWS = {
    S3: class {
        constructor({ region }) {
            console.log(region);
            return this;
        }

        copyObject() {
            console.log('copyObject');
            return { promise };
        }

        deleteObject() {
            console.log('deleteObject');
            return { promise };
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
