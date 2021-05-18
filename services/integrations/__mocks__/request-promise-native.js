'use strict';

const requestPromiseNative = jest.genMockFromModule('request-promise-native');

function get() {
    return '123';
}

requestPromiseNative.get = get;

module.exports = requestPromiseNative;
