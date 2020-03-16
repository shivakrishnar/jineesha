select
    Title,
    DocumentCategory,
    IsPublishedToEmployee,
    IsPrivateDocument,
    UploadDate,
    Extension,
    Filename,
    UploadByUsername,
    Pointer
from
    dbo.Document
where
    ID = @id