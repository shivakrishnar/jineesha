const defaultObj1 = {
    id: 1,
    systemId: 1,
    systemName: 'ATS',
	name: 'Admin ATS',
	isAdmin: true
};
  
const defaultObj2 = {
    id: 2,
    systemId: 1,
    systemName: 'ATS',
	name: 'Manager ATS',
	isAdmin: false
};
  
//
// getRolesByTenant
//
export const getRolesByTenantDBResponse = {
    limit: 30,
    count: 2,
    recordsets: [ 
        [
            {
                totalCount: 2
            }
        ],
        [
            {
                ...defaultObj1
            },
            {
                ...defaultObj2
            }
        ]
    ],
    recordset: [{ totalCount: 2 }],
    output: {},
    rowsAffected: [ 1, 1, 1, 2 ],
};

export const getRolesByTenantDBResponseEmpty = {
recordsets: [[{ totalCount: 0 }], []],
recordset: [{ totalCount: 0 }],
output: {},
rowsAffected: [1, 1, 1, 0],
};

export const getRolesByTenantAPIResponse = [
    {
        ...defaultObj1
    },
    {
        ...defaultObj2
    }
];

//
// getRolesById
//
export const RolesToGetById = '1';
export const RolesToGetByIdWithCharacter = '1abc';

export const getRolesByIdDBResponse = {
    recordset: [
        {
            ...defaultObj1
        }
    ]
};

export const getRolesByIdDBResponseEmpty = {
    recordset: {}
};

export const getRolesByIdAPIResponse = {
    ...defaultObj1
};

//
// createRoles
//
export const createRolesRequestBody = {
	...defaultObj1
};

export const createRolesDBResponse = {
	recordset: [{ ID: 1 }],
};

export const createRolesAPIResponse = {
	...defaultObj1
};

//
// updateRoles
//
export const updateRolesRequestBody = {
	...defaultObj1
};

export const updateRolesAPIResponse = true;

//
// deleteRoles
//
export const RolesToDeleteId = '1';
export const RolesToDeleteAnotherId = '4';
export const RolesToDeleteIdWithCharacter = '1abc';
export const deleteRolesAPIResponse = true;