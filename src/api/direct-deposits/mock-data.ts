export const tenantId: string = 'c807d7f9-b391-4525-ac0e-31dbc0cf202b';
export const employeeId: string = '113';

export const listResponseObject = {
  recordsets: [
    [
      [
        {
          id: '37',
          amount: '9000',
          routingNumber: '211274450',
          accountNumber: '49309909',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Checking'
        }
      ],
      [
        {
          id: '38',
          amount: '100',
          routingNumber: '211274450',
          accountNumber: '490909909',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Savings'
        }
      ]
    ]
  ],
  recordset: [
    {
      id: '37',
      amount: '9000',
      routingNumber: '211274450',
      accountNumber: '49309909',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Checking'
    },
    {
      id: '38',
      amount: '100',
      routingNumber: '211274450',
      accountNumber: '490909909',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Savings'
    }
  ],
  output: {},
  rowsAffected: [
    2
  ]
};
export const expectedObjects = [
  {
    id: 37,
    amount: 9000,
    bankAccount: {
      routingNumber: '211274450',
      accountNumber: '49309909',
      designation: 'Checking',
    },
    amountType: 'Flat',
    status: 'No Status'
  },
  {
    id: 38,
    amount: 100,
    bankAccount: {
      routingNumber: '211274450',
      accountNumber: '490909909',
      designation: 'Savings',
    },
    amountType: 'Flat',
    status: 'No Status'
  }
];

export const postObject = {
  id: 37,
  amount: 9000,
  bankAccount: {
    routingNumber: '211274450',
    accountNumber: '49309909',
    designation: 'Checking',
  },
  amountType: 'Flat',
  status: 'No Status'
};
export const balanceRemainderPostObject = {
  id: 37,
  amount: 9000,
  bankAccount: {
    routingNumber: '211274450',
    accountNumber: '49309909',
    designation: 'Checking',
  },
  amountType: 'Balance Remainder',
  status: 'No Status'
};
export const postResponseObject = {
  recordsets: [
    [
      [
        {
          id: '37',
          amount: '9000',
          routingNumber: '211274450',
          accountNumber: '49309909',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Checking'
        }
      ],
    ]
  ],
  recordset: [
    {
      id: '37',
      amount: '9000',
      routingNumber: '211274450',
      accountNumber: '49309909',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Checking'
    },
  ],
  output: {},
  rowsAffected: [
    1
  ]
};
export const duplicateBankAccountResponseObject = {
  recordsets: [
    [
      [
        {
          DuplicateType: 'accounts',
          id: '37',
          amount: '9000',
          routingNumber: '211274450',
          accountNumber: '49309909',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Checking'
        }
      ],
    ]
  ],
  recordset: [
    {
      DuplicateType: 'accounts',
      id: '37',
      amount: '9000',
      routingNumber: '211274450',
      accountNumber: '49309909',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Checking'
    },
  ],
  output: {},
  rowsAffected: [
    1
  ]
};
export const duplicateRemainderResponseObject = {
  recordsets: [
    [
      [
        {
          DuplicateType: 'remainder',
          id: '37',
          amount: '9000',
          routingNumber: '211274450',
          accountNumber: '49309909',
          amountType: 'Flat',
          status: 'No Status',
          designation: 'Checking'
        }
      ],
    ]
  ],
  recordset: [
    {
      DuplicateType: 'remainder',
      id: '37',
      amount: '9000',
      routingNumber: '211274450',
      accountNumber: '49309909',
      amountType: 'Flat',
      status: 'No Status',
      designation: 'Checking'
    },
  ],
  output: {},
  rowsAffected: [
    1
  ]
};
export const scopeIdentityResponseObject = {
  recordset: [
    {
      ID: 37
    }
  ],
  output: {},
  rowsAffected: [
    1
  ]
};
export const emptyResponseObject = {
  recordsets: [ [] ],
  recordset: [],
  output: {},
  rowsAffected: [ 0 ]
};