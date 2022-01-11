delete from
    dbo.FileMetadata
output
    deleted.*
where
    ID = @documentId