const defaultObj1 = {
    id: 1,
    systemId: 1,
    systemName: 'ATS',
	value: 'TestPage',
	description: 'The main page where you can list, add, edit or delete records'
};
  
const defaultObj2 = {
    id: 2,
    systemId: 1,
    systemName: 'ATS',
	value: 'TestModal',
	description: 'The modal window page where you can add or edit'
};
  
//
// getClaimsByTenant
//
export const getClaimsByTenantDBResponse = {
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

export const getClaimsByTenantDBResponseEmpty = {
recordsets: [[{ totalCount: 0 }], []],
recordset: [{ totalCount: 0 }],
output: {},
rowsAffected: [1, 1, 1, 0],
};

export const getClaimsByTenantAPIResponse = [
    {
        ...defaultObj1
    },
    {
        ...defaultObj2
    }
];

//
// getClaimsById
//
export const ClaimsToGetById = '1';
export const ClaimsToGetByIdWithCharacter = '1abc';

export const getClaimsByIdDBResponse = {
    recordset: [
        {
            ...defaultObj1
        }
    ]
};

export const getClaimsByIdDBResponseEmpty = {
    recordset: {}
};

export const getClaimsByIdAPIResponse = {
    ...defaultObj1
};
