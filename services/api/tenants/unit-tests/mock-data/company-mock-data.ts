export const listCompaniesMockData = {
	dbResponse(filtered = false) {
		let companies = [
			{
				ID: 1,
				CompanyName: 'Company 1',
				PRIntegrationCompanyCode: 'A1',
				CreateDate: '2022-04-20T20:40:34.880Z',
			},
			{
				ID: 2,
				CompanyName: 'Company 2',
				PRIntegrationCompanyCode: 'A2',
				CreateDate: '2022-04-20T20:40:34.880Z',
			},
			{
				ID: 3,
				CompanyName: 'Company 3',
				PRIntegrationCompanyCode: 'A3',
				CreateDate: '2022-04-20T20:40:34.880Z',
			},
		];
		companies = filtered ? [companies[1]] : companies;
		return {
			recordsets: [
				[
					{
						totalCount: companies.length,
					},
				],
				[...companies],
			],
			recordset: [
				{
					totalCount: companies.length,
				},
			],
			output: {},
			rowsAffected: [1, 1, 1, companies.length],
		}
	},
	endpointResponse(filtered = false) {
		let companies = [
			{
				id: 1,
				name: 'Company 1',
				code: 'A1',
				createDate: '2022-04-20T20:40:34.880Z',
			},
			{
				id: 2,
				name: 'Company 2',
				code: 'A2',
				createDate: '2022-04-20T20:40:34.880Z',
			},
			{
				id: 3,
				name: 'Company 3',
				code: 'A3',
				createDate: '2022-04-20T20:40:34.880Z',
			},
		];
		companies = filtered ? [companies[1]] : companies;
		return {
			limit: 30,
			count: companies.length,
			totalCount: companies.length,
			results: companies,
		};
	},
}

export const getUserCompaniesDBResponse = {
	recordset: [
		{
			ID: 1,
		},
	],
	output: {},
	rowsAffected: [1],
}