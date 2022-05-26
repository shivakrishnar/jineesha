declare @_date nvarchar(max) = format(getdate(), 'MM-dd-yyyyThhmmss')
declare @source_db_name nvarchar(max) = '@tenantId';
declare @s3_arn_to_backup_to nvarchar(max) = FORMATMESSAGE('arn:aws:s3:::@bucketName/@tenantName-%s.bak', @_date);
exec msdb.dbo.rds_backup_database
	@source_db_name,
	@s3_arn_to_backup_to