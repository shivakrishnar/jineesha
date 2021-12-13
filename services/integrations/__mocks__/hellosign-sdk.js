'use strict';

const cancelMock = require('mockFunctions/helloSignCancelSignatureRequest').cancelMock;
let hellosign = jest.genMockFromModule('hellosign-sdk');
const mockData = require('../esignature/unit-tests/mock-data');
const listSignatureRequests = require('../esignature/unit-tests/mock-functions/hellosign-list-requests');

hellosign = (params) => {
    return {
        template: {
            get: (id) => {
                if (id === 1000) {
                    return {
                        template: mockData.helloSignOnboardingTemplate,
                    };
                } else if (id === 2) {
                    return {
                        template: mockData.helloSignTemplate2,
                    };
                }
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
            list: listSignatureRequests,
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
            cancel: cancelMock,
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
