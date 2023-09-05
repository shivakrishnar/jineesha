update DataImportEvent 
set Status = 'Error', Active = 0, Details = '@ErrorMessage'
where id = @DataImportEventId