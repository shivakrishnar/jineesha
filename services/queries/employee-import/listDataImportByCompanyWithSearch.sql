declare @_companyId as int = @companyId
declare @_status as varchar = @status
declare @_active as varchar = @active
declare @_searchFilter1 as varchar(200) = @searchFilter1
declare @_searchFilter2 as varchar(200) = @searchFilter2

select count(*) as totalCount 
from DataImportEvent e, DataImportType t, HRnextUser u 
where e.CompanyID = @_companyId and	
	  e.DataImportTypeID = t.id and 
	  e.LastUserID = u.id and 
	  e.Status like @_status and
	  e.Active like @_active and
	  (t.Name like @_searchFilter1 or u.Username like @_searchFilter2) 

select t.Name as DataImportTypeName, u.Username, e.* 
from DataImportEvent e, DataImportType t, HRnextUser u 
where e.CompanyID = @_companyId and 
	  e.DataImportTypeID = t.id and 
	  e.LastUserID = u.id and 
	  e.Status like @_status and
	  e.Active like @_active and 
	  (t.Name like @_searchFilter1 or u.Username like @_searchFilter2) 
order by e.CreationDate desc