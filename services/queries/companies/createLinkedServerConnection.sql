DECLARE @_migrationId nvarchar(max) = '@migrationId'
EXEC master.dbo.sp_addlinkedserver @server=@_migrationId, @srvproduct=N'', @provider=N'SQLNCLI', @datasrc=N'@rdsEndpoint';

EXEC master.dbo.sp_addlinkedsrvlogin @rmtsrvname=@_migrationId, @useself=N'False',@locallogin=NULL,@rmtuser=N'@username',@rmtpassword='@password';

