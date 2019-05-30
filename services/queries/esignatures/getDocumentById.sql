select FSDocument, Extension from openjson(
    (
        select FSDocument, Extension from dbo.Document where ID = @id for json auto
    )
) with (FSDocument nvarchar(max), Extension nvarchar(max))