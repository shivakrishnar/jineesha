//
// getJobPostingByTenant
//
export const getJobPostingByTenantDBResponse = {
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
          id: 33,
          companyId: 3,
          companyName: 'Artsy Tartsy Bakery',
          aTApplicationVersionId: 1,
          positionTypeId: null,
          organizationType1Id: null,
	      organizationType2Id: null,
	      organizationType3Id: null,
	      organizationType4Id: null,
	      workerCompTypeId: null,
	      title: 'test',
	      description: 'desc test',
	      linkKey: 'DA8C5B82-B895-4D5F-9CC4-8195A083311D',
	      isOpen: 1,
	      jazzHrPositionOpeningId: null
        },
        {
          id: 17,
          companyId: 3,
          companyName: 'Artsy Tartsy Bakery',
          aTApplicationVersionId: 2,
          positionTypeId: null,
          organizationType1Id: null,
	      organizationType2Id: null,
	      organizationType3Id: null,
	      organizationType4Id: null,
	      workerCompTypeId: null,
	      title: 'test 2',
	      description: 'desc test 2',
	      linkKey: 'FA8B5B39-2501-44D8-A8B1-62C2F7BD3414',
	      isOpen: 1,
	      jazzHrPositionOpeningId: null
        }
      ]
    ],
    recordset: [
      {
        totalCount: 2
      }
    ],
    output: {},
    rowsAffected: [ 1, 1, 1, 2 ],
};

export const getJobPostingByTenantDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getJobPostingByTenantAPIResponse = [
    {
        id: 33,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        aTApplicationVersionId: 1,
        positionTypeId: null,
        organizationType1Id: null,
        organizationType2Id: null,
        organizationType3Id: null,
        organizationType4Id: null,
        workerCompTypeId: null,
        title: 'test',
        description: 'desc test',
        linkKey: 'DA8C5B82-B895-4D5F-9CC4-8195A083311D',
        isOpen: 1,
        jazzHrPositionOpeningId: null
      },
      {
        id: 17,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        aTApplicationVersionId: 2,
        positionTypeId: null,
        organizationType1Id: null,
        organizationType2Id: null,
        organizationType3Id: null,
        organizationType4Id: null,
        workerCompTypeId: null,
        title: 'test 2',
        description: 'desc test 2',
        linkKey: 'FA8B5B39-2501-44D8-A8B1-62C2F7BD3414',
        isOpen: 1,
        jazzHrPositionOpeningId: null
      }
];

//
// getJobPostingByCompany
//
export const getJobPostingByCompanyDBResponse = {
  limit: 30,
  count: 1,
  recordsets: [ 
    [
      {
          totalCount: 1
      }
    ],
    [
        {
            id: 33,
            companyId: 3,
            companyName: 'Artsy Tartsy Bakery',
            aTApplicationVersionId: 1,
            positionTypeId: null,
            organizationType1Id: null,
            organizationType2Id: null,
            organizationType3Id: null,
            organizationType4Id: null,
            workerCompTypeId: null,
            title: 'test',
            description: 'desc test',
            linkKey: 'DA8C5B82-B895-4D5F-9CC4-8195A083311D',
            isOpen: 1,
            jazzHrPositionOpeningId: null
          }
    ]
  ],
  recordset: [
    {
      totalCount: 1
    }
  ],
  output: {},
  rowsAffected: [ 1, 1, 1, 1 ],
};

export const getJobPostingByCompanyDBResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const getJobPostingByCompanyAPIResponse = [
    {
        id: 33,
        companyId: 3,
        companyName: 'Artsy Tartsy Bakery',
        aTApplicationVersionId: 1,
        positionTypeId: null,
        organizationType1Id: null,
        organizationType2Id: null,
        organizationType3Id: null,
        organizationType4Id: null,
        workerCompTypeId: null,
        title: 'test',
        description: 'desc test',
        linkKey: 'DA8C5B82-B895-4D5F-9CC4-8195A083311D',
        isOpen: 1,
        jazzHrPositionOpeningId: null
      }
];

//
// getQuestionBankById
//
export const jobPostingToGetById = '33';
export const jobPostingToGetByIdWithCharacter = '33abc';

export const getJobPostingByIdDBResponse = {
  recordset: [{
    id: 33,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    aTApplicationVersionId: 1,
    positionTypeId: null,
    organizationType1Id: null,
    organizationType2Id: null,
    organizationType3Id: null,
    organizationType4Id: null,
    workerCompTypeId: null,
    title: 'test',
    description: 'desc test',
    linkKey: 'DA8C5B82-B895-4D5F-9CC4-8195A083311D',
    isOpen: 1,
    jazzHrPositionOpeningId: null
  }]
};

export const getJobPostingByIdDBResponseEmpty = {
  recordset: {}
};

export const getJobPostingByIdAPIResponse = {
    id: 33,
    companyId: 3,
    companyName: 'Artsy Tartsy Bakery',
    aTApplicationVersionId: 1,
    positionTypeId: null,
    organizationType1Id: null,
    organizationType2Id: null,
    organizationType3Id: null,
    organizationType4Id: null,
    workerCompTypeId: null,
    title: 'test',
    description: 'desc test',
    linkKey: 'DA8C5B82-B895-4D5F-9CC4-8195A083311D',
    isOpen: 1,
    jazzHrPositionOpeningId: null
  };