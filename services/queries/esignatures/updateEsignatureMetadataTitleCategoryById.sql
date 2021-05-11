update
    dbo.EsignatureMetadata
set
    Category = @category,
    Title = '@title'
where
    ID = '@id'
