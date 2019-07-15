select
    ID,
    UploadDate,
    UploadedBy,
    Title,
    Filename,
    Category
from
    dbo.EsignatureMetadata
where
    ID = '@id'
