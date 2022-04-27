export const listTenantsMockData = {
	dynamoResult: {
		Items: [
			{
				TenantID: '123',
				Domain: 'tenant-1.evolution-software.com',
				IsDirectClient: true,
			},
			{
				TenantID: '456',
				Domain: 'tenant-2.evolution-software.com',
				IsDirectClient: false,
			},
			{
				TenantID: '789',
				Domain: 'tenant-3.evolution-software.com',
			},
		]
	},
	allResponse: [
		{
			id: '123',
			name: 'tenant-1',
			isDirect: true,
		},
		{
			id: '456',
			name: 'tenant-2',
			isDirect: false,
		},
		{
			id: '789',
			name: 'tenant-3',
			isDirect: false,
		},
	],
	directResponse: [
		{
			id: '123',
			name: 'tenant-1',
			isDirect: true,
		},
	],
	indirectResponse: [
		{
			id: '456',
			name: 'tenant-2',
			isDirect: false,
		},
		{
			id: '789',
			name: 'tenant-3',
			isDirect: false,
		},
	],
};
