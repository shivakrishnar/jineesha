/*-----------------------------------------------------------------
 createAuditOutboxTriggerScheduledTask
-----------------------------------------------------------------*/
/*
	Syntax	: exec  createAuditOutboxTriggerScheduledTask
		Ex.	: 	
			execute createAuditOutboxTriggerScheduledTask 'e5a19feb-0fca-4b61-9b7a-43a2a6dd7414'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 09/13/22
	Notice	: Copyright (c) 2022 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.createAuditOutboxTriggerScheduledTask */
	if object_id('dbo.createAuditOutboxTriggerScheduledTask') is not null
	begin
		drop procedure dbo.createAuditOutboxTriggerScheduledTask
		print 'Dropped Proc dbo.createAuditOutboxTriggerScheduledTask '
	end
GO

	create procedure createAuditOutboxTriggerScheduledTask

	@recipientTenantId nvarchar(max)

	with encryption
	as

	declare @_RecipientPath nvarchar(max) 
	select @_RecipientPath = '['+@recipientTenantId+']';

	--I think this will run without any params so long as it is compiled directly in the receiving DB or not

	--The disable can be fired numerous times without impact even if the Trigger is already disabled
	disable trigger AddAuditDetailToOutbox on dbo.HRnextAuditDetail

	-------------schedule trigger task 
	--Trigger/Schedule task work
	declare @Trigger_Disabled char(1)
	declare @todaysdate char(8)
	declare @activetilltime char(8)
	declare @JobCommand varchar(200)
	declare @job_name nvarchar(max) = 'Schedule_Enable_Audit_Trigger_' +@recipientTenantId
	declare @name nvarchar(max) ='SEAT_Schedule_1_' +@recipientTenantId


	select @Trigger_Disabled = is_disabled from sys.triggers where name = 'AddAuditDetailToOutbox'
	select @todaysdate = replace(convert(char(10),getdate(),111),'/','')
	select @activetilltime = replace(convert(varchar(8),getdate()+.01035,108),':','')
	select @JobCommand = 'use '+@_RecipientPath+'; Enable Trigger AddAuditDetailToOutbox on dbo.HRnextAuditDetail;'

	if not exists (select * from msdb.dbo.sysjobs where name = @job_name)
	begin
		--create a job to reanable audit table trigger.
		--Add a job
		exec msdb.dbo.sp_add_job 
			@job_name = @job_name,
			@delete_level = 3
		--Add a job step named 'Enable Trigger'. This step runs the stored procedure
		exec msdb.dbo.sp_add_jobstep
			@job_name = @job_name,
			@step_name = N'Enable Trigger',
			@subsystem = N'TSQL',
			@command = @JobCommand--'use '+@_RecipientPath+'; Enable Trigger AddAuditDetailToOutbox on dbo.HRnextAuditDetail;'
		--Schedule the job at a specified date and time
		exec msdb.dbo.sp_add_jobschedule @job_name = @job_name,
			@name = @name,
			@freq_type=1,
			@active_start_date = @todaysdate,
			@active_start_time = @activetilltime -- this would set the job to run once 15 minutes from now
		-- Add the job to the SQL Server 
		exec msdb.dbo.sp_add_jobserver
			@job_name = @job_name
			--@server_name = @_hrServicesConnection  -- this I am not sure off 100% yet, but it is the server of the job to run on, I believe it will default to LOCAL server
	end

	if exists (select * from msdb.dbo.sysjobs where name = @job_name) --then add time
	begin
		--update the job to reset/restart with 15 minutes of time
		exec msdb.dbo.sp_update_schedule
			@name = @name,
			@enabled = 1,
			@freq_type = 1,
			@active_start_date = @todaysdate,
			@active_start_time = @activetilltime -- this would set the job to run once 15 minutes (.01035 is % of 24 hours for 15 minutes) from now
	end

-----------------------------------------end schedule trigger task

GO

/*	Now check to make sure it has been created (dbo.createAuditOutboxTriggerScheduledTask ) */ 
	if object_id('dbo.createAuditOutboxTriggerScheduledTask') is not null
		print 'Proc dbo.createAuditOutboxTriggerScheduledTask has been CREATED Successfully. '
	else
		print 'Create Proc dbo.createAuditOutboxTriggerScheduledTask FAILED'
GO

/*	now Grant Permissions on dbo.createAuditOutboxTriggerScheduledTask to public */
	grant execute on dbo.createAuditOutboxTriggerScheduledTask to public
	print 'Execute rights have been GRANTED to group public on createAuditOutboxTriggerScheduledTask'
GO


/*-----------------------------------------------------------------
	eof -  createAuditOutboxTriggerScheduledTask.sql 
-----------------------------------------------------------------*/