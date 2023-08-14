update DataImportEvent 
set Status = 'Failed', Details = '@ErrorMessage'
where id = @DataImportEventId