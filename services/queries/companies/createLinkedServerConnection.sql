EXEC master.dbo.sp_addlinkedserver @server = N'LinkedtoRDS', @srvproduct=N'', @provider=N'SQLNCLI', @datasrc=N'@rdsEndpoint';

EXEC master.dbo.sp_addlinkedsrvlogin @rmtsrvname=N'LinkedtoRDS',@useself=N'False',@locallogin=NULL,@rmtuser=N'@username',@rmtpassword='@password';