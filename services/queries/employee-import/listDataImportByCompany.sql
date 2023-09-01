declare @_companyId as int = @companyId
declare @_status as varchar = @status
declare @_active as varchar = @active

select count(*) as totalCount
from DataImportEvent e, DataImportType t, HRnextUser u
where e.CompanyID = @_companyId and	
	  e.DataImportTypeID = t.id and
	  e.LastUserID = u.id and
	  e.Status like @_status and
	  e.Active like @_active

select t.Name as DataImportTypeName, u.Username, e.*
from DataImportEvent e, DataImportType t, HRnextUser u
where e.CompanyID = @_companyId and
	  e.DataImportTypeID = t.id and
	  e.LastUserID = u.id and
	  e.Status like @_status and
	  e.Active like @_active
order by e.CreationDate desc