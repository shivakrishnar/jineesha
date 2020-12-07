select
    f.*, e.Type
from
    dbo.FileMetadata f
join
    dbo.EsignatureMetadata e
on
    e.ID = f.EsignatureMetadataID
where
    f.ID = @id