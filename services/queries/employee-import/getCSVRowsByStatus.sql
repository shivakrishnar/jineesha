select DataImportEventDetail.CSVRowData, DataImportEventDetail.CSVRowNotes
from DataImportEventDetail
where DataImportEventDetail.DataImportEventID = @DataImportEventId and DataImportEventDetail.CSVRowStatus = @Status
order by CSVRowNumber desc