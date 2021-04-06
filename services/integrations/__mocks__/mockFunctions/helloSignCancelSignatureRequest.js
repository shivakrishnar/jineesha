class mockCancel {
    static cancel = jest.fn(() => {
        return {};
    });
}

export const cancelMock = mockCancel.cancel;
