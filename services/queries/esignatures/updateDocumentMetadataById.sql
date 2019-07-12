update
    dbo.Document
set
    Title = @title,
    DocumentCategory = @category,
    IsPublishedToEmployee = @isPublishedToEmployee
where
    ID = @id