update DataImportEventDetail 
set CSVRowStatus = 'Processed'
where DataImportEventID = @DataImportEventId and
      CSVRowNumber = @CSVRowNumber