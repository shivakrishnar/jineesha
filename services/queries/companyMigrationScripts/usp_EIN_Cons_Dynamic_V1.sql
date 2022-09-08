/*-----------------------------------------------------------------
 usp_EIN_Cons_Dynamic_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_Dynamic_V1
		Ex.	: 	
			execute usp_EIN_Cons_Dynamic_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData', 'ATApplicationVersion'
			execute usp_EIN_Cons_Dynamic_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'ATApplicationVersion'
			execute usp_EIN_Cons_Dynamic_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ATApplicationVersion'
			execute usp_EIN_Cons_Dynamic_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ATApplicationVersion'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 03/04/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_Dynamic_V1 */
	if object_id('dbo.usp_EIN_Cons_Dynamic_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_Dynamic_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_Dynamic_V1 '
	end
	GO

	create procedure usp_EIN_Cons_Dynamic_V1

		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(100),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(10),
		@cDonorCompany_ID		char(10),
		@cValidateType_Cd		char(20),
		@cTableName				char(100)

	with encryption
	as

	-- HRN IT Services Test company 600373

	--setup Exist vars
	declare @nDonorExistCount tinyint
	select @nDonorExistCount = 1
	declare @nRecipientExistCount tinyint
	select @nRecipientExistCount = 0
	declare @cDonorCountPath nvarchar(100)
	declare @cRecipientCountPath char(100)

	--setup Fail vars
	declare @cFailCodes char(256)
	select  @cFailCodes = ''

	declare @cmdColumns nvarchar(max)
	declare @cmdSelect nvarchar(max)
	declare @cmdInsert nvarchar(max)
	declare @cmdCombine nvarchar(max)
	declare @cmdCountDataDonor nvarchar(max)
	declare @cmdCountDataRecipient nvarchar(max)
	declare @cmdShowDataDonor nvarchar(max)
	declare @cmdShowDataRecipient nvarchar(max)
	declare @cDonorTablePath char(100)
	declare @cRecipientTablePath char(100)
	declare @cDonorCompanyID char(10)
	declare @cRecipientCompanyID char(10)

	select @cDonorTablePath = @cDonorDatabasePath			--'[adhr-1].[dbo].'
	select @cRecipientTablePath = @cRecipientDatabasePath	--'[adhr-2].[dbo].'

	select @cDonorCountPath = trim(@cDonorTablePath)+trim(@cTableName)
	select @cRecipientCountPath = trim(@cRecipientTablePath)+trim(@cTableName)
--	select @cDonorCountPath

	set nocount on
	
	-- Check for existence of both CompanyID
--	set @cmdCountDataDonor = 'select @cDonorExistCount = case when count(*) > 0 then 1 else 0 end from @cDonorCountPath where CompanyID = @cDonorCompany_ID'
	--set @cmdCountDataDonor	 = 'select @cDonorExistCount = case when count(*) > 0 then 1 else 0 end from [adhr-1].[dbo].ATApplicationVersion where CompanyID = @cDonorCompany_ID'
--	execute sp_executesql @cmdCountDataDonor, N'@cDonorCountPath nvarchar(100), @cDonorCompany_ID char(8), @cDonorExistCount tinyint OUTPUT', @cDonorCountPath = @cDonorCountPath, @cDonorCompany_ID = @cDonorCompany_ID, @cDonorExistCount = @cDonorExistCount OUTPUT
	--execute sp_executesql @cmdCountDataDonor, N'@cDonorCompany_ID char(8), @cDonorExistCount tinyint OUTPUT', @cDonorCompany_ID, @cDonorExistCount OUTPUT
--	select @nDonorExistCount as Counts
	--select @cmdCountDataDonor	 = 'select @cDonorExistCount = case when count(*) > 0 then 1 else 0 end from '+trim(@DonorTablePath)+trim(@TableName)+' where CompanyID = '+@cDonorCompany_ID
	--select @cmdCountDataRecipient = 'select @cRecipientExistCount = case when count(*) > 0 then 1 else 0 end from '+trim(@RecipientTablePath)+trim(@TableName)+' where CompanyID = '+@cRecipientCompany_ID

	--select @nDonorExistCount = case when count(*) > 0 then @nDonorExistCount + 1 else @nDonorExistCount end from [adhr-1].[dbo].[ATApplicationVersion] where CompanyID = @cDonorCompany_ID
	--select @nRecipientExistCount = case when count(*) > 0 then @nRecipientExistCount + 1 else @nRecipientExistCount end from [adhr-1].[dbo].[ATApplicationVersion] where CompanyID = @cRecipientCompany_ID

	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	
	begin
		if @cVerbose_Ind = 1
		begin
			select @cmdShowDataDonor = 'select * from '+trim(@cDonorTablePath)+trim(@cTableName)+' where CompanyID = '+@cDonorCompany_ID
			exec (@cmdShowDataDonor)
			select @cmdShowDataRecipient = 'select * from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
			exec (@cmdShowDataRecipient)
			select @cFailCodes = 'ShowData '+trim(@cTableName)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
				print @cmdShowDataRecipient
			end
		end
	
	end

	-- ------------------------------------------------------------
	-- These Queries determine wether an insert should continue
	if @nDonorExistCount = 0 
		select @cFailCodes = 'Fails NoDonorExists', @cValidateType_Cd = 'ExitPGM'
	if @nRecipientExistCount > 0 
		select @cFailCodes = 'Fails RecipientExists', @cValidateType_Cd = 'ExitPGM'

	-- This Query loads the data from Donor
	if @cValidateType_Cd = 'Insert'
	begin
		if @nDonorExistCount > 0 or @nRecipientExistCount = 0
		begin
			if @cVerbose_Ind = 1
			begin
				SET @cmdColumns = STUFF((
				SELECT ','+QUOTENAME(COLUMN_NAME)
				FROM INFORMATION_SCHEMA.COLUMNS 
				WHERE TABLE_NAME = @cTableName and COLUMN_NAME <> 'ID'
				--ORDER BY TABLE_NAME
				FOR XML PATH(''),TYPE
				).value('.','NVARCHAR(MAX)'),1,1,'')

				select @cmdSelect = 'select '+replace(@cmdColumns,'[CompanyID]',trim(@cRecipientCompany_ID))+' from '+trim(@cDonorTablePath)+trim(@cTableName)+' where CompanyID = '+@cDonorCompany_ID
				--select @cmdSelect

				select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+trim(@cTableName)+' ('+@cmdColumns+')'
				--select @cmdInsert

				select @cmdCombine = @cmdInsert + @cmdSelect

				EXEC( @cmdCombine);
				if @cShowStatement = 1
				begin
					print @cmdCombine
				end
				select  @cFailCodes = 'Insert '+@cFailCodes
			end
		end

	end

	-- This Query verifies and loads the data from Donor

	if @cValidateType_Cd = 'InsertFullValidate'
	
	begin

		select  @cFailCodes = 'InsertFullValidate Not Available At This Time'
				
	end

	-- This Query deletes the data from Receiver system
	if @cValidateType_Cd = 'Delete'
	
	begin

		--This is the Recipient table
		select @cmdShowDataDonor = 'delete from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		if @cShowStatement = 1
		begin
			select @cmdShowDataDonor
		end
		exec (@cmdShowDataDonor)
		select  @cFailCodes = 'Delete'
	
	end
	
	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_Dynamic_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_Dynamic_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_Dynamic_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_Dynamic_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_Dynamic_V1 to public */
	grant execute on dbo.usp_EIN_Cons_Dynamic_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_Dynamic_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_Dynamic_V1.sql 
-----------------------------------------------------------------*/