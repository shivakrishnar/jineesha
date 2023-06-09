declare @_companyId as int = @companyId

select count(*) as totalCount
from DataImportEvent
where CompanyID = @_companyId

select *
from DataImportEvent
where CompanyID = @_companyId
order by CreationDate desc