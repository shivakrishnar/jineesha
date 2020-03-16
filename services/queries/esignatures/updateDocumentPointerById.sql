update
    dbo.Document
set
    Pointer = '@key'
where
    ID = @id