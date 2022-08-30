DECLARE @_migrationId nvarchar(max) = '@migrationId'
EXEC master.dbo.sp_dropserver @server=@_migrationId,  @droplogins='droplogins';
