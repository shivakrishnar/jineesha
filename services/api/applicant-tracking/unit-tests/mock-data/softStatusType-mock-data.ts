export const atSoftStatusTypeId = '1';
export const atHardStatusTypeId = '1';

export const softStatusTypeByTenantResponse = {
    limit: 30,
		count: 2,
    recordsets: [
      [
        {
            totalCount: 2
        }
      ],
      [{
          id: 1,
          companyId: 3,
          companyName: 'Artsy',
          atHardStatusTypeId: 1,
          title: 'Application Started',
          description: 'Application Started',
          sequence: 10
        },
        {
          id: 2,
          companyId: 3,
          companyName: 'Artsy',
          atHardStatusTypeId: 2,
          title: 'Application Completed',
          description: 'Application Completed',
          sequence: 12
        }]
    ],
    recordset: [
      {
        totalCount: 2
      }
    ],
    output: {},
    rowsAffected: [ 4 ],
};

export const softStatusTypeByTenantResponseEmpty = {
  recordsets: [[{ totalCount: 0 }], []],
  recordset: [{ totalCount: 0 }],
  output: {},
  rowsAffected: [1, 1, 1, 0],
};

export const softStatusTypeResponse = {
  recordsets: [ [ [Object], [Object] ] ],
  recordset: [
    {
      id: 1,
      companyId: 3,
      companyName: 'Artsy',
      atHardStatusTypeId: 1,
      title: 'Application Started',
      description: 'Application Started',
      sequence: 10
    },
    {
      id: 2,
      companyId: 3,
      companyName: 'Artsy',
      atHardStatusTypeId: 2,
      title: 'Application Completed',
      description: 'Application Completed',
      sequence: 12
    }
  ],
  output: {},
  rowsAffected: [ 2 ],
};

export const softStatusTypeResponseEmpty = {
  recordsets: [ [ ] ],
  recordset: [ ],
  output: {},
  rowsAffected: [ ],
};

export const singleSoftStatusTypeResponse = {
  recordsets: [ [ [Object] ] ],
  recordset: [{
    id: 1,
    companyId: 3,
    companyName: 'Artsy',
    atHardStatusTypeId: 1,
    title: 'Application Started',
    description: 'Application Started',
    sequence: 10
  }],
  output: {},
  rowsAffected: [ 1 ],
};

export const singleSoftStatusTypeResponseWrongCompany = {
  recordsets: [ [ [Object] ] ],
  recordset: [{
    id: 1,
    companyId: 1,
    companyName: 'Artsy',
    atHardStatusTypeId: 1,
    title: 'Application Started',
    description: 'Application Started',
    sequence: 10
  }],
  output: {},
  rowsAffected: [ 1 ],
};
