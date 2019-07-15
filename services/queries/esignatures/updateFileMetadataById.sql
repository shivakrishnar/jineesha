update
    dbo.FileMetadata
set
    Title = '@title',
    Category = @category,
    Pointer = '@pointer',
    IsPublishedToEmployee = @isPublishedToEmployee
where
    ID = @id