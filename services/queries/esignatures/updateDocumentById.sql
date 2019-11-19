declare @_id int = @id
declare @_file varchar(max) = '@file';
declare @_filename varchar(max) = '@fileName'
declare @_extension varchar(max) = '@extension'
declare @_contentType varchar(max) = '@contentType'
declare @_title varchar(max) = '@title';
declare @_fsDocument varbinary(max) = cast(N'' as xml).value('xs:base64Binary(sql:variable("@_file"))', 'varbinary(max)');


if @_title = '@title'
    begin
        update
            dbo.Document
        set
            FSDocument = @_fsDocument,
            Filename = @_filename,
            Extension = @_extension,
            ContentType = @_contentType
        where
            ID = @_id
    end
else 
    begin
        update
            dbo.Document
        set
            FSDocument = @_fsDocument,
            Filename = @_filename,
            Extension = @_extension,
            ContentType = @_contentType,
            Title = @_title
        where
            ID = @_id 
    end