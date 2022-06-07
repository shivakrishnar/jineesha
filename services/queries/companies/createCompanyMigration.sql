
declare @_donorPath nvarchar(max) = '[@donorTenantId].[dbo].'; -- [db-name].[dbo].
declare @_hrServicesConnection nvarchar(max) = '[LinkedtoRDS].[@recipTenantId].[dbo].';
declare @_donorCompanyId nvarchar(max) = '@donorCompanyId';
declare @_recipCompanyId nvarchar(max) = '@recipCompanyId';

execute usp_EIN_Cons_CompanyWrapper_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert'

execute usp_EIN_Cons_CompanyUpdates @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'A'

execute usp_EIN_Cons_CompanyUpdates @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'B'

execute usp_EIN_Cons_CompensationDataSet_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'ZZZ'

exec usp_EIN_Cons_Benefits_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'ZZZ'

execute usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'ZZZ'

execute usp_EIN_Cons_HRNext_Sec_DataSet_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'ZZZ'

execute usp_EIN_Cons_CompanyUpdates @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'C'

execute usp_EIN_Cons_Documents_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'ZZZ'

exec usp_EIN_Cons_ApplTrack_V1 @_donorPath, @_hrServicesConnection, 1, 0, @_recipCompanyId, @_donorCompanyId, 'Insert', 'ZZZ'
