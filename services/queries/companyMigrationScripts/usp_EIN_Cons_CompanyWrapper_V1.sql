/*-----------------------------------------------------------------
 usp_EIN_Cons_CompanyWrapper_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_CompanyWrapper_V1
		Ex.	: 	
			execute usp_EIN_Cons_CompanyWrapper_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData'
			execute usp_EIN_Cons_CompanyWrapper_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert'
			execute usp_EIN_Cons_CompanyWrapper_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate'
			execute usp_EIN_Cons_CompanyWrapper_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 03/16/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_CompanyWrapper_V1 */
	if object_id('dbo.usp_EIN_Cons_CompanyWrapper_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_CompanyWrapper_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_CompanyWrapper_V1'
	end
GO

	create procedure usp_EIN_Cons_CompanyWrapper_V1

		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(100),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(10),
		@cDonorCompany_ID		char(10),
		@cValidateType_Cd		char(20)

	with encryption
	as

	-- HRN IT Services Test company 600373

	--setup Exist vars
	declare @cDonorExistCount tinyint
	select @cDonorExistCount = 0
	declare @cRecipientExistCount tinyint
	select @cRecipientExistCount = 0

	--setup Fail vars
	declare @cFailCodes char(256)
	select  @cFailCodes = ''

	set nocount on
	
	-- ------------------------------------------------------------
	
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'ATApplicationVersion'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'ATQuestionBank'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'ATSoftStatusType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'Announcement'

	-- execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'PositionType'
	--execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'ATJobPosting'  --in ApplTrak

	--execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'OrganizationStructure'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'PayGradeType'
	--execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'WorkerCompType'  --This has existing recs in test

	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'PayGroupType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'PositionOrganizationChangeReason'

	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'OBQuestionBank'  --This has existing recs in test
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'OnboardingTaskList'

	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'BenefitCarrier'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'BenefitClass'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'BenefitGeneralAgent'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'BenefitCoverageStartType'
	--execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'BenefitPlan'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'OpenEnrollment'		--columns do not line up
	-- execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'LifeEventReason'

	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'EmailRecord'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'ShiftType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'JobType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'SkillType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'ReviewType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'LicenseType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'AchievementType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'CertificateType'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'CompensationChangeReason'
	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'HRnextClass'

	--The Alert table may need to be cleaned of data brought over by the PR process.  Therefore we force a delete of the recipient data before inserting donor data.
	if @cValidateType_Cd = 'Insert'
		begin
			execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, 'Delete', 'Alert'
		end

	execute usp_EIN_Cons_Dynamic_V1 @cDonorDatabasePath, @cRecipientDatabasePath, @cVerbose_Ind, @cShowStatement, @cRecipientCompany_ID, @cDonorCompany_ID, @cValidateType_Cd, 'Alert'

	-- ------------------------------------------------------------

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_CompanyWrapper_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_CompanyWrapper_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_CompanyWrapper_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_CompanyWrapper_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_CompanyWrapper_V1 to public */
	grant execute on dbo.usp_EIN_Cons_CompanyWrapper_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_CompanyWrapper_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_CompanyWrapper_V1.sql 
-----------------------------------------------------------------*/