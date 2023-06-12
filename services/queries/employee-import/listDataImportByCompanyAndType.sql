declare @_companyId as int = @companyId
declare @_dataImportTypeId as int = @dataImportTypeId

select count(*) as totalCount
from DataImportEvent
where CompanyID = @_companyId and DataImportTypeId = @_dataImportTypeId

select *
from DataImportEvent
where CompanyID = @_companyId and DataImportTypeId = @_dataImportTypeId
order by CreationDate desc