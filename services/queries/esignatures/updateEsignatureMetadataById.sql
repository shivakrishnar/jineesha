update
    dbo.EsignatureMetadata
set
    SignatureStatusID = @signatureStatusId,
    Filename = '@fileName',
    FileMetadataID = @fileMetadataId
where
    ID = '@id'
