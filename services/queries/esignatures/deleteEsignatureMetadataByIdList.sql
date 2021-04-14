declare @_idList table (ID varchar(max))
declare @_fileMetadataIdList table (ID int)
insert into @_idList
    select * from string_split(@idList, ',')
insert into @_fileMetadataIdList
	select ID from dbo.FileMetadata where EsignatureMetadataID in (select * from @_idList)

update
	dbo.FileMetadata
set EsignatureMetadataID = null
where
	EsignatureMetadataID in (select * from @_idList)

update
	dbo.EsignatureMetadata
set FileMetadataID = null
where
	ID in (select * from @_idList)

delete from
    dbo.FileMetadata
where
	ID in (select * from @_fileMetadataIdList)

delete from
    dbo.EsignatureMetadata
where
    ID in (select * from @_idList)