export const hardStatusTypeResponse = {
    recordsets: [ [ [Object], [Object], [Object], [Object] ] ],
    recordset: [
      {
        id: '1',
        code: '1',
        description: 'Application Started',
        priority: 10,
        active: true
      },
      {
        id: '2',
        code: '2',
        description: 'Application Completed',
        priority: 20,
        active: true
      },
      {
        id: '3',
        code: '3',
        description: 'Schedule Interview',
        priority: 30,
        active: true
      },
      {
        id: '4',
        code: '4',
        description: 'Make Offer',
        priority: 40,
        active: true
      }
    ],
    output: {},
    rowsAffected: [ 4 ],
};

export const hardStatusTypeResponseEmpty = {
  recordsets: [ [ ] ],
  recordset: [ ],
  output: {},
  rowsAffected: [ ],
};
