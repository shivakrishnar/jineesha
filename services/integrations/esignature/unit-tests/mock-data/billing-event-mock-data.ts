export function getBillingEventTypeDBResponse(id, name) {
    return {
        recordset: [
            {
                ID: id || 1,
                Name: name || 'EnhancedEsignatureEnabled',
            },
        ],
        output: {},
        rowsAffected: [1],
    };
}
