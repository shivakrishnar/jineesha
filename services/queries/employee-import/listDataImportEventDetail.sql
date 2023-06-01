declare @_DataImportEventId as int = @DataImportEventId
declare @_CompanyId as int = @CompanyId

select count(*) as totalCount
from DataImportEventDetail
join DataImportEvent on DataImportEventDetail.DataImportEventID = DataImportEvent.ID
where DataImportEventDetail.DataImportEventID = @_DataImportEventId and DataImportEvent.CompanyID = @_CompanyId

select DataImportEventDetail.*
from DataImportEventDetail
join DataImportEvent on DataImportEventDetail.DataImportEventID = DataImportEvent.ID
where DataImportEventDetail.DataImportEventID = @_DataImportEventId and DataImportEvent.CompanyID = @_CompanyId
order by CSVRowNumber desc