update
    dbo.EsignatureMetadata
set
    Title = '@title'
where
    ID = '@id'