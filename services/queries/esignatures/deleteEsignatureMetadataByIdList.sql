delete from
    dbo.FileMetadata
where
	EsignatureMetadataID in (@idList)
delete from
    dbo.EsignatureMetadata
where
    ID in (@idList)