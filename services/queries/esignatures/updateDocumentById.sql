declare @_id int = @id
declare @_file varchar(max) = '@file';
declare @_filename varchar(max) = '@fileName'
declare @_extension varchar(max) = '@extension'
declare @_contentType varchar(max) = '@contentType'
declare @_title varchar(max) = '@title';
declare @_category varchar(max) = @category;
declare @_fsDocument varbinary(max) = cast(N'' as xml).value('xs:base64Binary(sql:variable("@_file"))', 'varbinary(max)');
declare @_pointer nvarchar(max) = @pointer

if @_title = '@title'
    begin
        update
            dbo.Document
        set
            FSDocument = @_fsDocument,
            Filename = @_filename,
            Extension = @_extension,
            ContentType = @_contentType,
            DocumentCategory = @_category,
            Pointer = @_pointer
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
            Title = @_title,
            DocumentCategory = @_category,
            Pointer = @_pointer
        where
            ID = @_id 
    end