update DataImportEventDetail 
set CSVRowStatus = 'Failed', 
    CSVRowNotes = @CSVRowNotes
where DataImportEventID = @DataImportEventId and
      CSVRowNumber = @CSVRowNumber