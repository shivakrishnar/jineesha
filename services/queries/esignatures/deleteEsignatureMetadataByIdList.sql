declare @_idList table (ID varchar(max))
insert into @_idList
    select * from string_split(@idList, ',')

delete from
    dbo.FileMetadata
where
	EsignatureMetadataID in (select * from @_idList)
    
delete from
    dbo.EsignatureMetadata
where
    ID in (select * from @_idList)