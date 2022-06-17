/*-----------------------------------------------------------------
 usp_EIN_Cons_PreCheck_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_PreCheck_V1
		Ex.	: 	
			execute usp_EIN_Cons_PreCheck_V1 '[EC2AMAZ-5C1CRI1].[adhr-1].[dbo].', '[EC2AMAZ-5C1CRI1].[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData'
			execute usp_EIN_Cons_PreCheck_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert'
			execute usp_EIN_Cons_PreCheck_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate'
			execute usp_EIN_Cons_PreCheck_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 06/01/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_PreCheck_V1 */
	if object_id('dbo.usp_EIN_Cons_PreCheck_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_PreCheck_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_PreCheck_V1 '
	end
go

	create procedure usp_EIN_Cons_PreCheck_V1

		@cDonorDatabasePath		char(150),
		@cRecipientDatabasePath	char(150),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(10),
		@cDonorCompany_ID		char(10),
		@cValidateType_Cd		char(20)

	with encryption
	as

	-- HRN IT Services Test company 600373

	--setup Exist vars
	declare @nFailureExistCount char(15)
	select @nFailureExistCount = 0
	declare @cFailureExistType char(15)
	select @cFailureExistType = ''
	--declare @nRecipientExistCount tinyint
	--select @nRecipientExistCount = 0
	--declare @cDonorCountPath nvarchar(100)
	--declare @cRecipientCountPath char(100)

	--setup Fail vars
	declare @cFailCodes char(256)
	select  @cFailCodes = 'Fails'

	declare @cTableName varchar(50)
	declare @cmdCountDataDonor nvarchar(max)
	declare @cmdCountDataRecipient nvarchar(max)
	declare @cmdShowDataDonor nvarchar(max)
	declare @cmdShowDataRecipient nvarchar(max)
	declare @cDonorTablePath char(150)
	declare @cRecipientTablePath char(150)

	select @cDonorTablePath = @cDonorDatabasePath			--'[adhr-1].[dbo].'
	select @cRecipientTablePath = @cRecipientDatabasePath	--'[adhr-2].[dbo].'

	--select @cDonorCountPath = trim(@cDonorTablePath)+trim(@cTableName)
	--select @cRecipientCountPath = trim(@cRecipientTablePath)+trim(@cTableName)
--	select @cDonorCountPath

	set nocount on
	
	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	
	begin

		if @cVerbose_Ind = 1
		begin
		-- Check for existence of both CompanyID
			select @cTableName = 'Company'
			select @cmdShowDataDonor = 'select * from '+trim(@cDonorTablePath)+trim(@cTableName)+' where ID = '+@cDonorCompany_ID
			exec (@cmdShowDataDonor)
			select @cmdShowDataRecipient = 'select * from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where ID = '+@cRecipientCompany_ID
			exec (@cmdShowDataRecipient)

			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
				print @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'ShowData Company - A'
			end
			--------------------------------
			set @cmdCountDataDonor = 'select case when count(*) = 1 then 0 else 1 end from '+trim(@cDonorTablePath)+trim(@cTableName)+' where ID = '+@cDonorCompany_ID
			exec sp_executesql @cmdCountDataDonor, N'@count int output', @nFailureExistCount output
			if @nFailureExistCount = 1
				select @cFailureExistType = @cFailureExistType + 'A'

			set @cmdCountDataRecipient = 'select case when count(*) > 0 then 1 else 0 end from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where ID = '+@cRecipientCompany_ID
			exec sp_executesql @cmdCountDataRecipient, N'@count int output', @nFailureExistCount output
			if @nFailureExistCount = 1
			begin
				select @cFailureExistType = @cFailureExistType + 'B'
			end
				print 'yyy'+@nFailureExistcount
				print 'xxx'+@cFailureExistType

			if @cShowStatement = 1
			begin
				print @cmdCountDataDonor
				print @cmdCountDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'CountData Company - B'
			end
			-------------------------------------------
			select @cTableName = 'Employee'
			set @cmdCountDataDonor = 'select case when count(SSN) > 0 then 1 else 0 end from '+trim(@cDonorTablePath)+trim(@cTableName)+' where ID = '+@cDonorCompany_ID +'group by SSN having count(SSN) >1'
			exec sp_executesql @cmdCountDataDonor, N'@count int output', @nFailureExistCount output
			if @nFailureExistCount = 1
				select @cFailureExistType = @cFailureExistType + 'C'

			if @cShowStatement = 1
			begin
				print @cmdCountDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'CountData Duplicate SSNs - C'
			end
			-------------------------------------------
			set @cmdCountDataDonor = 'select case when count(r2.id) > 0 then 1 else 0 end from '+trim(@cRecipientTablePath)+'Employee R1 join '+trim(@cRecipientTablePath)+'EmployeeCompensation R2 on R2.EmployeeID = R1.Id where R1.ID = '+@cRecipientCompany_ID 

			exec sp_executesql @cmdCountDataDonor, N'@count int output', @nFailureExistCount output
			if @nFailureExistCount = 1
				select @cFailureExistType = @cFailureExistType + 'D'

			if @cShowStatement = 1
			begin
				print @cmdCountDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'ShowData Recipient EmployeeCompensation has Existing Records - D'
			end

		end
	
	end
	print @cFailureExistType
	-- ------------------------------------------------------------
	-- These Queries determine wether an insert should continue
	if @cFailureExistType like '%A%' 
		select @cFailCodes = @cFailCodes + ' - No Donor Exists', @cValidateType_Cd = 'ExitPGM'
	if @cFailureExistType like '%B%'
		select @cFailCodes = @cFailCodes + ' - Recipient Exists', @cValidateType_Cd = 'ExitPGM'   -- this needs to be transferred to another table.  Company SHOULD exist
	if @cFailureExistType like '%C%'
		select @cFailCodes = @cFailCodes + ' - Duplicate SSNs', @cValidateType_Cd = 'ExitPGM'
	if @cFailureExistType like '%D%'
		select @cFailCodes = @cFailCodes + ' - Recipient EmployeeCompensation has Existing Records', @cValidateType_Cd = 'ExitPGM'

	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
go

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_PreCheck_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_PreCheck_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_PreCheck_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_PreCheck_V1 FAILED'
go

/*	now Grant Permissions on dbo.usp_EIN_Cons_PreCheck_V1 to public */
	grant execute on dbo.usp_EIN_Cons_PreCheck_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_PreCheck_V1'
go
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_PreCheck_V1.sql 
-----------------------------------------------------------------*/