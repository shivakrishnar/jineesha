'use strict';

const shortid = jest.genMockFromModule('shortid');

function generate() {
    return '123';
}

shortid.generate = generate;

module.exports = shortid;
