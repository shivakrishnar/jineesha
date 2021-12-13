'use strict';

class mockCancel {
    static cancel = jest.fn(() => {
        return {};
    });
}

module.exports = {
    cancelMock: mockCancel.cancel,
};
