export const listEmployeeAbsenceByEmployeeIdResult = {
  recordsets: [[[Object], [Object], [Object], [Object], [Object], [Object], [Object]]],
  recordset: [
      {
          SubmitDate: '2021-09-27T00:00:00.000Z',
          StartDate: '2021-10-01T00:00:00.000Z',
          ReturnDate: '2021-10-06T00:00:00.000Z',
          HoursTaken: 16,
          EvoFK_TimeOffCategoryId: '1',
          Description: 'Approved',
      },
      {
          SubmitDate: '2021-09-27T00:00:00.000Z',
          StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
          ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
          HoursTaken: 16,
          EvoFK_TimeOffCategoryId: '1',
          Description: 'Approved',
      },
      {
        SubmitDate: '2021-09-27T00:00:00.000Z',
        StartDate: '2021-10-22T00:00:00.000Z',
        ReturnDate: '2021-10-30T00:00:00.000Z',
        HoursTaken: 8,
        EvoFK_TimeOffCategoryId: '2',
        Description: 'Pending',
      },
      {
          SubmitDate: '2021-09-27T00:00:00.000Z',
          StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
          ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
          HoursTaken: 8,
          EvoFK_TimeOffCategoryId: '2',
          Description: 'Pending',
      },
  ],
  output: {},
  rowsAffected: [1, 7],
};

// Do NOT change any of these test values for the time off categories/summary/expected categories.
// These mock data are set to test if the function is properly calculating the hours as a result.
export const getEvolutionTimeOffCategoriesByEmployeeIdResult = {
  results: [
      {
          employeeId: 123,
          categoryDescription: 'Vacation',
          standardHours: null,
          id: 1,
      },
      {
          employeeId: 123,
          categoryDescription: 'Sick',
          standardHours: null,
          id: 2,
      },
  ],
};

export const getEvolutionTimeOffSummariesByEmployeeId = {
  results: [
      {
          employeeId: 123,
          timeOffCategoryId: 1,
          accruedHours: 40,
          usedHours: 18,
          approvedHours: 16,
          id: 1,
      },
      {
          employeeId: 123,
          timeOffCategoryId: 2,
          accruedHours: 48,
          usedHours: 0,
          approvedHours: 0,
          id: 2,
      },
  ],
};

export const getEvolutionCompanyTimeOffCategoriesByCompanyId = [
  {
      "CompanyId": 93,
      "Description": "Vacation",
      "EdsId": 5,
      "EDGroupsId": null,
      "ShowEss": "Y",
      "ShowEDsInEss": false,
      "AutoCreateForStatuses": {
          "NonApplicable": true,
          "FullTime": true,
          "FullTimeTemp": true,
          "PartTime": true,
          "PartTimeTemp": true,
          "HalfTime": true,
          "Seasonal": true,
          "Student": true,
          "I1099": true,
          "Other": true,
          "SeasonalLessThan120Days": true,
          "Variable": true,
          "PerDiem": true
      },
      "AutoCreateOnNewHire": false,
      "Id": 1
  },
  {
      "CompanyId": 93,
      "Description": "Sick",
      "EdsId": 9,
      "EDGroupsId": null,
      "ShowEss": "Y",
      "ShowEDsInEss": false,
      "AutoCreateForStatuses": {
          "NonApplicable": false,
          "FullTime": true,
          "FullTimeTemp": false,
          "PartTime": false,
          "PartTimeTemp": false,
          "HalfTime": false,
          "Seasonal": false,
          "Student": false,
          "I1099": false,
          "Other": false,
          "SeasonalLessThan120Days": false,
          "Variable": false,
          "PerDiem": false
      },
      "AutoCreateOnNewHire": true,
      "Id": 2
  }
]

export const expectedEmployeeAbsenceSummary = {
  totalAvailableBalance: 46,
  categories: [
      {
          category: 'Vacation',
          currentBalance: 22,
          scheduledHours: 16,
          pendingApprovalHours: 0,
          availableBalance: 6,
          timeOffDates: [
            {
                SubmitDate: '2021-09-27T00:00:00.000Z',
                StartDate: '2021-10-01T00:00:00.000Z',
                ReturnDate: '2021-10-06T00:00:00.000Z',
                HoursTaken: 16,
                EvoFK_TimeOffCategoryId: '1',
                Description: 'Approved',
            },
            {
                SubmitDate: '2021-09-27T00:00:00.000Z',
                StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
                ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
                HoursTaken: 16,
                EvoFK_TimeOffCategoryId: '1',
                Description: 'Approved',
            },
          ]
      },
      {
          category: 'Sick',
          currentBalance: 48,
          scheduledHours: 0,
          pendingApprovalHours: 8,
          availableBalance: 40,
          timeOffDates: [
            {
              SubmitDate: '2021-09-27T00:00:00.000Z',
              StartDate: '2021-10-22T00:00:00.000Z',
              ReturnDate: '2021-10-30T00:00:00.000Z',
              HoursTaken: 8,
              EvoFK_TimeOffCategoryId: '2',
              Description: 'Pending',
            },
            {
                SubmitDate: '2021-09-27T00:00:00.000Z',
                StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
                ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
                HoursTaken: 8,
                EvoFK_TimeOffCategoryId: '2',
                Description: 'Pending',
            },
          ]
      },
  ],
};
export const expectedApprovedEmployeeAbsenceSummary = {
  totalAvailableBalance: 46,
  categories: [
      {
          category: 'Vacation',
          currentBalance: 22,
          scheduledHours: 16,
          pendingApprovalHours: 0,
          availableBalance: 6,
          timeOffDates: [
            {
              SubmitDate: '2021-09-27T00:00:00.000Z',
              StartDate: '2021-10-01T00:00:00.000Z',
              ReturnDate: '2021-10-06T00:00:00.000Z',
              HoursTaken: 16,
              EvoFK_TimeOffCategoryId: '1',
              Description: 'Approved',
          },
          {
              SubmitDate: '2021-09-27T00:00:00.000Z',
              StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
              ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
              HoursTaken: 16,
              EvoFK_TimeOffCategoryId: '1',
              Description: 'Approved',
          },
          ]
      },
      {
          category: 'Sick',
          currentBalance: 48,
          scheduledHours: 0,
          pendingApprovalHours: 8,
          availableBalance: 40,
          timeOffDates: []
      },
  ],
};
export const expectedUpcomingEmployeeAbsenceSummary = {
  totalAvailableBalance: 46,
  categories: [
      {
          category: 'Vacation',
          currentBalance: 22,
          scheduledHours: 16,
          pendingApprovalHours: 0,
          availableBalance: 6,
          timeOffDates: [
            {
              SubmitDate: '2021-09-27T00:00:00.000Z',
              StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
              ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
              HoursTaken: 16,
              EvoFK_TimeOffCategoryId: '1',
              Description: 'Approved',
          },
          ]
      },
      {
          category: 'Sick',
          currentBalance: 48,
          scheduledHours: 0,
          pendingApprovalHours: 8,
          availableBalance: 40,
          timeOffDates: [
            {
              SubmitDate: '2021-09-27T00:00:00.000Z',
              StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
              ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
              HoursTaken: 8,
              EvoFK_TimeOffCategoryId: '2',
              Description: 'Pending',
          },
          ]
      },
  ],
};
export const expectedApprovedUpcomingEmployeeAbsenceSummary = {
  totalAvailableBalance: 46,
  categories: [
      {
          category: 'Vacation',
          currentBalance: 22,
          scheduledHours: 16,
          pendingApprovalHours: 0,
          availableBalance: 6,
          timeOffDates: [
            {
              SubmitDate: '2021-09-27T00:00:00.000Z',
              StartDate: new Date(Date.now() + (3600 * 1000 * 24)),
              ReturnDate: new Date(Date.now() + (3600 * 1000 * 48)),
              HoursTaken: 16,
              EvoFK_TimeOffCategoryId: '1',
              Description: 'Approved',
          },
          ]
      },
      {
          category: 'Sick',
          currentBalance: 48,
          scheduledHours: 0,
          pendingApprovalHours: 8,
          availableBalance: 40,
          timeOffDates: []
      },
  ],
};
export const expectedEmptyDBEmployeeAbsenceSummary = {
  totalAvailableBalance: 70,
  categories: [
      {
          category: 'Vacation',
          currentBalance: 22,
          scheduledHours: 0,
          pendingApprovalHours: 0,
          availableBalance: 22,
          timeOffDates: []
      },
      {
          category: 'Sick',
          currentBalance: 48,
          scheduledHours: 0,
          pendingApprovalHours: 0,
          availableBalance: 48,
          timeOffDates: []
      },
  ],
};

export const getPayrollsByCompanyId = [
  {
      "CompanyId": 6,
      "CheckDate": "2018-08-02T00:00:00",
      "RunNumber": 1,
      "PayrollType": "Regular",
      "Status": "Processed",
      "StatusDate": new Date(Date.now()),
      "LiabilitiesDeposits": "None",
      "TimeOffAccruals": "No",
      "AgencyPayments": false,
      "ChecksReports": "None",
      "Ach": false,
      "Billing": false,
      "CheckDateStatus": "Normal",
      "IsScheduled": true,
      "IsMarkLiabsPaid": false,
      "InvoicePrinted": "InvoicePrinted",
      "ApprovedByFinance": "Ignore",
      "ApprovedByTax": "Ignore",
      "ApprovedByMng": "Ignore",
      "IsSameDayPullAndReplace": false,
      "IsCombineRuns": false,
      "IsPrintAll": true,
      "TaxImpound": "ACH",
      "TrustImpound": "ACH",
      "WcImpound": "ACH",
      "DdImpound": "ACH",
      "BillingImpound": "ACH",
      "Unlocked": false,
      "Id": 23
  },
  {
      "CompanyId": 6,
      "CheckDate": "2018-09-01T00:00:00",
      "RunNumber": 1,
      "PayrollType": "Regular",
      "Status": "Pending",
      "StatusDate": "2018-08-02T09:46:33",
      "LiabilitiesDeposits": "None",
      "TimeOffAccruals": "No",
      "AgencyPayments": false,
      "ChecksReports": "Both",
      "Ach": false,
      "Billing": false,
      "CheckDateStatus": "Normal",
      "IsScheduled": true,
      "IsMarkLiabsPaid": false,
      "InvoicePrinted": "Pending",
      "ApprovedByFinance": "Ignore",
      "ApprovedByTax": "Ignore",
      "ApprovedByMng": "Ignore",
      "IsSameDayPullAndReplace": false,
      "IsCombineRuns": false,
      "IsPrintAll": true,
      "TaxImpound": "ACH",
      "TrustImpound": "ACH",
      "WcImpound": "ACH",
      "DdImpound": "ACH",
      "BillingImpound": "ACH",
      "Unlocked": true,
      "Id": 27
  },
  {
      "CompanyId": 6,
      "CheckDate": "2019-01-01T00:00:00",
      "RunNumber": 1,
      "PayrollType": "Regular",
      "Status": "Processed",
      "StatusDate": "2018-08-08T11:36:56",
      "LiabilitiesDeposits": "None",
      "TimeOffAccruals": "No",
      "AgencyPayments": false,
      "ChecksReports": "Both",
      "Ach": false,
      "Billing": false,
      "CheckDateStatus": "Normal",
      "IsScheduled": true,
      "IsMarkLiabsPaid": false,
      "InvoicePrinted": "BillingCalculated",
      "ApprovedByFinance": "Ignore",
      "ApprovedByTax": "Ignore",
      "ApprovedByMng": "Ignore",
      "IsSameDayPullAndReplace": false,
      "IsCombineRuns": false,
      "IsPrintAll": true,
      "TaxImpound": "ACH",
      "TrustImpound": "ACH",
      "WcImpound": "ACH",
      "DdImpound": "ACH",
      "BillingImpound": "ACH",
      "Unlocked": false,
      "Id": 31
  },
];

export const getPayrollBatchesByPayrollId = [
    {
        "PayrollId": 16,
        "CheckTemplateId": null,
        "PeriodBegin": "2018-04-01T00:00:00",
        "PeriodEnd": new Date(Date.now()),
        "Frequency": "Monthly",
        "PayrollFilterId": null,
        "PaySalary": true,
        "PayHours": true,
        "PayrollDefaults": true,
        "ExcludeTimeOff": "No",
        "PeriodBeginDateStatus": "N",
        "PeriodEndDateStatus": "N",
        "CheckCount": 9,
        "Id": 19
    }
]