'use strict';

let hellosign = jest.genMockFromModule('hellosign-sdk');
const mockData = require('../esignature/unit-tests/mock-data');

hellosign = (params) => {
    return {
        template: {
            get: () => {
                return {
                    template: mockData.helloSignTemplate,
                };
            },
            createEmbeddedDraft: () => {
                return {
                    template: mockData.helloSignTemplateDraft,
                };
            },
        },
        signatureRequest: {
            get: () => {
                return {
                    signature_request: mockData.helloSignSignatureRequest,
                };
            },
            list: (request) => {
                const requestModifier = request.query;
                switch (requestModifier) {
                    case 'metadata:returnNothing':
                        return { signature_requests: [] };
                    case 'metadata:errorNotFound':
                        throw { message: 'Signature not found' };
                    default:
                        return { signature_requests: mockData.helloSignSignatureRequests };
                }
            },
            createEmbeddedWithTemplate: () => {
                return {
                    signature_request: mockData.helloSignSignatureRequest,
                };
            },
            createEmbeddedDraft: () => {
                return {
                    template: mockData.helloSignEditUrl,
                };
            },
        },
        embedded: {
            getSignUrl: () => {
                return {
                    embedded: mockData.helloSignSignUrl,
                };
            },
        },
    };
};

module.exports = hellosign;
