update
    dbo.Document
set
    Title = @title,
    DocumentCategory = @category,
    IsPublishedToEmployee = @isPublishedToEmployee,
    IsPrivateDocument = @isPrivateDocument
where
    ID = @id