declare @_status as varchar = @status
declare @_active as varchar = @active
declare @_searchFilter1 as varchar(200) = @searchFilter1
declare @_searchFilter2 as varchar(200) = @searchFilter2
declare @_importProcess as varchar(200) = @importProcess

select count(*) as totalCount 
from DataImportEvent e, DataImportType t, HRnextUser u 
where e.DataImportTypeID = t.id and 
	  e.LastUserID = u.id and 
	  e.Status like @_status and
	  e.Active like @_active and
	  (t.Name like @_searchFilter1 or u.Username like @_searchFilter2) and 
	  t.ImportProcess like @_importProcess

select t.Name as DataImportTypeName, u.Username, e.* 
from DataImportEvent e, DataImportType t, HRnextUser u 
where e.DataImportTypeID = t.id and 
	  e.LastUserID = u.id and 
	  e.Status like @_status and
	  e.Active like @_active and 
	  (t.Name like @_searchFilter1 or u.Username like @_searchFilter2) and
	  t.ImportProcess like @_importProcess
order by e.CreationDate desc