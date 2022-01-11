export const employeeDBResponse = {
    recordset: [
        {
            EmailAddress: 'user@test.com',
            CurrentDisplayName: 'Charles Bartowski',
            FirstName: 'Test',
            LastName: 'User',
            EmployeeCode: '1',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const employeeInfoDBResponse = {
    recordset: [
        {
            emailAddress: 'user@test.com',
            firstName: 'Test',
            lastName: 'User',
            employeeCode: '1',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const employeeObject = {
        id: 22244,
        firstName: 'The',
        lastName: 'Rock',
        eeCode: '123',
        companyName: 'Rock Enterprises',
        isSalary: false,
        evoData: {
            employeeId: '123',
            companyId: '123',
            clientId: '123'
        }
};

export const employeeInfoWithoutEmailDBResponse = {
    recordset: [
        {
            emailAddress: null,
            firstName: 'Test',
            lastName: 'User',
            employeeCode: '1',
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

export const employeesByCodeDBResponse = {
    recordset: [
        {
            EmployeeCode: '1',
            EmailAddress: 'hugh@jass.com',
            FirstName: 'Hugh',
            LastName: 'Jass',
        },
        {
            EmployeeCode: '2',
            EmailAddress: 'matt.yoga@gmail.com',
            FirstName: 'Matt',
            LastName: 'Employee',
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const employeesWithoutEmailAddressDBResponse = {
    recordset: [
        {
            EmployeeCode: '1',
            EmailAddress: null,
            FirstName: 'Hugh',
            LastName: 'Jass',
        },
        {
            EmployeeCode: '2',
            EmailAddress: 'matt.yoga@gmail.com',
            FirstName: 'Matt',
            LastName: 'Employee',
        },
    ],
    output: {},
    rowsAffected: [2],
};

export const employeeByCodeDBResponse = {
    recordset: [
        {
            EmployeeCode: '1',
        },
    ],
    output: {},
    rowsAffected: [1],
};

export const paginatedEmployeesDBResponse = {
    recordsets: [
        [
            [
                {
                    totalCount: 2,
                },
            ],
        ],
        [
            {
                EmployeeCode: '1',
                EmailAddress: 'hugh@jass.com',
                FirstName: 'Hugh',
                LastName: 'Jass',
                IsActive: true,
            },
            {
                EmployeeCode: '2',
                EmailAddress: 'matt.yoga@gmail.com',
                FirstName: 'Matt',
                LastName: 'Employee',
                IsActive: false,
            },
        ],
    ],
    recordset: [
        {
            totalCount: 2,
        },
    ],
    output: {},
    rowsAffected: [2],
};
