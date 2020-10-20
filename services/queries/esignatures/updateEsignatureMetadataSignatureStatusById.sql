update
    dbo.EsignatureMetadata
set
    SignatureStatusID = @signatureStatusId
where
    ID = '@id'
