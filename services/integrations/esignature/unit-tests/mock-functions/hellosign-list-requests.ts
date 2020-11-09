import * as mockData from '../mock-data';

module.exports = jest.fn((request) => {
    const requestModifier = request.query;
    switch (requestModifier) {
        case 'metadata:returnNothing':
            return { signature_requests: [] };
        case 'metadata:errorNotFound':
            throw { message: 'Signature not found' };
        case `metadata:${mockData.obKeyOneResult}`:
            return { signature_requests: [mockData.helloSignSignatureRequests[0]] };
        default:
            return { signature_requests: mockData.helloSignSignatureRequests };
    }
});
