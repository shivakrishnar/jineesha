select
    f.*,
    e.SignatureStatusID
from
    dbo.FileMetadata f
    join dbo.EsignatureMetadata e on e.FileMetadataID = f.ID or e.ID = f.EsignatureMetadataID
where
    e.ID = '@id'
