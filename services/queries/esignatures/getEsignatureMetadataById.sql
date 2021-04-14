select
    ID,
    UploadDate,
    UploadedBy,
    Title,
    Filename,
    Category,
    Type
from
    dbo.EsignatureMetadata
where
    ID = '@id'
