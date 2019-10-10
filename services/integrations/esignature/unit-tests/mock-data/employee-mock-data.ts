export const employeeDBResponse = {
    recordset: [
        {
            EmailAddress: 'user@test.com',
            CurrentDisplayName: 'Charles Bartowski',
            FirstName: 'Test',
            LastName: 'User',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const employeeEmailsByManagerDBResponse = {
    recordset: [
        {
            EmailAddress: 'employee1@test.com',
            EmployeeCode: '1',
        },
        {
            EmailAddress: 'employee2@test.com',
            EmployeeCode: '2',
        },
    ],
    output: {},
    rowsAffected: [1],
};
