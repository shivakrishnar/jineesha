delete from
    dbo.Document
output
    deleted.*
where
    ID = @documentId