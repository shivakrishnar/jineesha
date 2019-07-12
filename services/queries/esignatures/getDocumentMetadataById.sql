select
    Title,
    DocumentCategory,
    IsPublishedToEmployee,
    UploadDate,
    Extension,
    Filename
from
    dbo.Document
where
    ID = @id