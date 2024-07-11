declare @_dataImportTypeId as int = @dataImportTypeId
declare @_status as varchar = @status
declare @_active as varchar = @active

select count(*) as totalCount
from DataImportEvent e, DataImportType t, HRnextUser u
where e.DataImportTypeId = @_dataImportTypeId
	  e.DataImportTypeID = t.id and
	  e.LastUserID = u.id and
	  e.Status like @_status and
	  e.Active like @_active

select t.Name as DataImportTypeName, u.Username, e.*
from DataImportEvent e, DataImportType t, HRnextUser u
where e.DataImportTypeId = @_dataImportTypeId and 
	  e.DataImportTypeID = t.id and
	  e.LastUserID = u.id and
	  e.Status like @_status and
	  e.Active like @_active
order by e.CreationDate desc