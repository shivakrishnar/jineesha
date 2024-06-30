declare @_DataImportEventId as int = @DataImportEventId

select count(*) as totalCount
from DataImportEventDetail
    join DataImportEvent on DataImportEventDetail.DataImportEventID = DataImportEvent.ID
where DataImportEventDetail.DataImportEventID = @_DataImportEventId 

select DataImportEventDetail.*
from DataImportEventDetail
    join DataImportEvent on DataImportEventDetail.DataImportEventID = DataImportEvent.ID
where DataImportEventDetail.DataImportEventID = @_DataImportEventId 
order by CSVRowNumber desc