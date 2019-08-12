select
    Title,
    DocumentCategory,
    IsPublishedToEmployee,
    IsPrivateDocument,
    UploadDate,
    Extension,
    Filename,
    UploadByUsername
from
    dbo.Document
where
    ID = @id