select
    f.*,
    e.SignatureStatusID
from
    dbo.FileMetadata f
    join dbo.EsignatureMetadata e on e.FileMetadataID = f.ID
where
    e.ID = '@id'
