declare @_file varchar(max) = '@file';
declare @_fsDocument varbinary(max) = cast(N'' as xml).value('xs:base64Binary(sql:variable("@_file"))', 'varbinary(max)');

update
    dbo.Document
set
    FSDocument = @_fsDocument,
    Filename = '@fileName',
    Extension = '@extension',
    ContentType = '@contentType'
where
    ID = @id