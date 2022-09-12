/*-----------------------------------------------------------------
 usp_EIN_Cons_CompensationDataSet_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_CompensationDataSet_V1
		Ex.	: 	
			execute usp_EIN_Cons_CompensationDataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 1, '600373', '600351', 'ShowData','F'
			execute usp_EIN_Cons_CompensationDataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert','ZZZ'
			execute usp_EIN_Cons_CompensationDataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate','ZZZ'
			execute usp_EIN_Cons_CompensationDataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete','ZZZ'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 04/22/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_CompensationDataSet_V1 */
	if object_id('dbo.usp_EIN_Cons_CompensationDataSet_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_CompensationDataSet_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_CompensationDataSet_V1 '
	end
GO

	create procedure usp_EIN_Cons_CompensationDataSet_V1
	
		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(100),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(8),
		@cDonorCompany_ID		char(8),
		@cValidateType_Cd		char(20),
		@cTableToRun			char(50)

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
	declare @cDonorTablePath char(75)
	declare @cRecipientTablePath char(100)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)

	--declare @DonorT1EmpCd bigint
	--declare @DonorT1ID bigint
	--declare @RecipientT1EmpCd bigint
	--declare @RecipientT1ID bigint

	select @cDonorTablePath = trim(@cDonorDatabasePath) --'[adhr-1].[dbo].'
	select @cRecipientTablePath = trim(@cRecipientDatabasePath) --'[adhr-2].[dbo].'

	--select @cDonorCountPath = trim(@cDonorTablePath)+trim(@cTableName)
	--select @cRecipientCountPath = trim(@cRecipientTablePath)+trim(@cTableName)
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

	--select @nDonorExistCount = case when count(*) > 0 then @cDonorExistCount + 1 else @cDonorExistCount end from [adhr-1].[dbo].[ATApplicationVersion] where CompanyID = @cDonorCompany_ID
	--select @nRecipientExistCount = case when count(*) > 0 then @cRecipientExistCount + 1 else @cRecipientExistCount end from [adhr-1].[dbo].[ATApplicationVersion] where CompanyID = @cRecipientCompany_ID

	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	begin
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdShowDataRecipient = 'select R1.I9_SEC1_FirstName, R1.I9_SEC1_LastName, R1.I9_SEC1_MiddleInitial, R1.I9_SEC1_OtherNamesUsed,
			R1.I9_SEC1_Address1, R1.I9_SEC1_City, R1.I9_SEC1_Zip, R1.I9_SEC1_SSN, R1.I9_SEC1_DOB,
			R1.I9_SEC1_EmailAddress, R1.I9_SEC1_PhoneHome, R1.I9_SEC1_IsUSCitizen, R1.I9_SEC1_IsUSNonCitizenNational,
			R1.I9_SEC1_IsUSPR, R1.I9_SEC1_IsAlien, R1.I9_SEC1_PRUSCISNumber, R1.I9_SEC1_AlienWorkExpirationDate,
			R1.I9_SEC1_AlienUSCISNumber, R1.I9_SEC1_AlienI94Number,	R1.I9_SEC1_AlienForeignPassportNumber,
			R1.I9_SEC1_AlienCountryOfIssuance, R1.I9_SEC1_EsignName, R1.I9_SEC1_EsignFormDate, R1.I9_SEC1_EsignStamptedDateTime,
			R1.I9_SEC1_Apartment, R1.I9_SEC1_Prep_FirstName, R1.I9_SEC1_Prep_LastName, R1.I9_SEC1_Prep_Address1,
			R1.I9_SEC1_Prep_City, R1.I9_SEC1_Prep_Zip, R1.I9_SEC1_Prep_IsPreparer, R1.I9_SEC1_Prep_EsignName,
			R1.I9_SEC1_Prep_EsignFormDate, R1.I9_SEC1_Prep_EsignStamptedDateTime, R1.I9_SEC1_PRAlienRegNumber,
			R1.I9_SEC1_AlienAlienRegNumber, R1.I9_SEC1_Prep_CountryStateTypeCode, R1.I9_SEC1_CountryStateTypeCode,
			R1.I9_SEC1_IsComplete, R1.I9_SEC2_IsComplete, R1.I9_SEC3_IsComplete, R1.I9_SEC1_IsAssigned,
			R1.I9_SEC2_ListA_DocumentTitle_1, R1.I9_SEC2_ListA_IssuingAuthority_1, R1.I9_SEC2_ListA_DocumentNumber_1,
			R1.I9_SEC2_ListA_ExpirationDate_1,
			R1.I9_SEC2_ListA_DocumentTitle_2, R1.I9_SEC2_ListA_IssuingAuthority_2, R1.I9_SEC2_ListA_DocumentNumber_2,
			R1.I9_SEC2_ListA_ExpirationDate_2,
			R1.I9_SEC2_ListA_DocumentTitle_3, R1.I9_SEC2_ListA_IssuingAuthority_3, R1.I9_SEC2_ListA_DocumentNumber_3,
			R1.I9_SEC2_ListA_ExpirationDate_3,
			R1.I9_SEC2_ListB_DocumentTitle_1, R1.I9_SEC2_ListB_IssuingAuthority_1, R1.I9_SEC2_ListB_DocumentNumber_1,
			R1.I9_SEC2_ListB_ExpirationDate_1, R1.I9_SEC2_ListC_DocumentTitle_1, R1.I9_SEC2_ListC_IssuingAuthority_1,
			R1.I9_SEC2_ListC_DocumentNumber_1, R1.I9_SEC2_ListC_ExpirationDate_1, R1.I9_SEC2_AdditionalInformation,
			R1.I9_SEC2_EmployeeFirstDayOfEmployment, R1.I9_SEC2_EsignName, R1.I9_SEC2_EsignFormDate,
			R1.I9_SEC2_EsignStamptedDateTime, R1.I9_SEC2_Esign_TitleOfRep, R1.I9_SEC2_Esign_FirstName,
			R1.I9_SEC2_Esign_LastName, R1.I9_SEC2_Esign_CompanyName, R1.I9_SEC2_Esign_Address1,
			R1.I9_SEC2_Esign_City, R1.I9_SEC2_Esign_CountryStateTypeID, R1.I9_SEC2_Esign_Zip
			from '+trim(@cDonorTablePath)+'Employee D1
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'I9 Update - A' as Showdata
			end
		end
		---------------------------------------
		/*if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdShowDataRecipient = 'select '+@cRecipientCompany_ID+', T1.Code, Title, T1.Priority, T1.Active, ApprovedDate, EffectiveDate, ClosedDate, IsBudgeted, R1.ID, R2.ID, R3.ID, R4.ID, FTE, T1.Description, Requirements, IsOTExempt, FLSATypeID, T1.PR_Integration_PK
			from '+trim(@cDonorTablePath)+'PositionType T1

			left outer join '+trim(@cDonorTablePath)+'PayGradeType D1 on D1.CompanyID = T1.CompanyID and D1.ID = T1.PayGradeTypeID
			left outer join '+trim(@cRecipientTablePath)+'PayGradeType R1 on R1.Code = D1.Code and R1.Description = D1.Description

			left outer join '+trim(@cDonorTablePath)+'EEOType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.EEOTypeID
			left outer join '+trim(@cRecipientTablePath)+'EEOType R2 on R2.CompanyID = R1.CompanyID and R2.Code = D2.Code and R2.Description = D2.Description

			left outer join '+trim(@cDonorTablePath)+'WorkerCompType D3 on D3.CompanyID = T1.CompanyID and D3.ID = T1.WorkerCompTypeID
			left outer join '+trim(@cRecipientTablePath)+'WorkerCompType R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code and R3.Description = D3.Description

			left outer join '+trim(@cDonorTablePath)+'Employee D4 on D4.CompanyID = T1.CompanyID and D4.ID = T1.SupervisorID
			left outer join '+trim(@cRecipientTablePath)+'Employee R4 on R4.CompanyID = R1.CompanyID and R4.EmployeeCode = D4.EmployeeCode

			where T1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'PositionType - B' as Showdata
			end
		end*/
		
		------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdShowDataRecipient = 'select  R1.ID, R4.ID as RecipientPayTypeID, R5.ID as RecipientCompensationChangeReason, D2.EffectiveDate, D2.Rate, D2.Comment, R3.ID as RecipientFrequencyTypeID, D2.AutoPayTypeID, D2.DefaultHours,
			D2.PR_Integration_PK, null as EvoFK_JobNumber, null as PositionTypeID, null as PayGradeTypeID
			from '+trim(@cDonorTablePath)+'Employee D1
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+trim(@cDonorTablePath)+'EmployeeCompensation D2 on D2.EmployeeID = D1.ID

			left outer join '+trim(@cDonorTablePath)+'FrequencyType D3 on D3.CompanyID = D1.CompanyID and D3.ID = D2.FrequencyTypeID
			left outer join '+trim(@cRecipientTablePath)+'FrequencyType R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code

			left outer join '+trim(@cDonorTablePath)+'PayType D4 on D4.CompanyID = D1.CompanyID and D4.ID = D2.PayTypeID
			left outer join '+trim(@cRecipientTablePath)+'PayType R4 on R4.CompanyID = R1.CompanyID and R4.Code = D4.Code

			left outer join '+trim(@cDonorTablePath)+'CompensationChangeReason D5 on D5.CompanyID = D1.CompanyID and D5.ID = D2.CompensationChangeReasonID
			left outer join '+trim(@cRecipientTablePath)+'CompensationChangeReason R5 on R5.CompanyID = R1.CompanyID and R5.Code = D5.Code and R5.Description = D5.Description

			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCompensation - C' as Showdata
			end
		end

		------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			select @cmdShowDataRecipient = 'select r2.* from '+trim(@cRecipientTablePath)+'Employee R1 join '+trim(@cRecipientTablePath)+'EmployeeCompensation R2 on R2.EmployeeID = R1.Id where R1.CompanyID = '+@cRecipientCompany_ID 

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCompensation Existing Records - D' as Showdata
			end
		end

		----------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			select @cmdShowDataRecipient = 'select D1.*
			from '+trim(@cDonorTablePath)+'Company D1 where D1.ID = '+@cDonorCompany_ID+'
			union select R1.* from'+trim(@cRecipientTablePath)+'Company R1 where R1.ID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company SwipeClock Fields Update - E' as Showdata
			end
		end

		------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			select @cmdShowDataRecipient = 'select R1.ID, D1.EmployeeID, NULL, D1.AbsenceStatusTypeID, D1.FMLALeaveTypeID, D1.FMLAEntitlementTypeID, D1.StartDate, R2.ID, 
			D1.ReturnDate, D1.Notes, D1.PrivateNotes, D1.HoursTaken, D1.HoursPerDayTaken, D1.IsWeekendsIncluded, D1.PR_Integration_PK, D1.SubmitDate, D1.EvoFK_TimeOffCategoryId
			from '+trim(@cDonorTablePath)+'EmployeeAbsence D1
			join '+trim(@cDonorTablePath)+'Employee D2 on D1.EmployeeID = D2.ID
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D2.EmployeeCode 
			left outer join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D1.ApprovedByEmployeeID and D3.CompanyID = '+@cDonorCompany_ID+'
			left outer join '+trim(@cRecipientTablePath)+'Employee R2 on D3.EmployeeCode = R2.EmployeeCode and R2.CompanyID = '+@cRecipientCompany_ID+'
			where D1.AbsenceStatusTypeID = 1 and D2.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAbsence Existing Records - F' as Showdata
			end
		end

		------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			select @cmdShowDataRecipient = 'select D1.EmployeeAbsenceID, R2.ID, D1.AbsenceDate, D1.HoursTaken, D1.PR_Integration_PK
			from '+trim(@cDonorTablePath)+'EmployeeAbsenceDetail D1
			join '+trim(@cDonorTablePath)+'EmployeeAbsence D2 on D2.ID = D1.EmployeeAbsenceID
			join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D2.EmployeeID
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D3.EmployeeCode
			join '+trim(@cRecipientTablePath)+'EmployeeAbsence R2 on R2.EmployeeID = R1.ID and D1.AbsenceDate between R2.StartDate and R2.ReturnDate
			where D2.AbsenceStatusTypeID = 1 and D3.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAbsenceDetail Existing Records - G' as Showdata
			end
		end
	
	end

	-- ------------------------------------------------------------
	-- These Queries determine wether an insert should continue
	if @nDonorExistCount = 0 
		select @cFailCodes = 'NoDonorExists', @cValidateType_Cd = 'ExitPGM'
	if @nRecipientExistCount > 0 
		select @cFailCodes = 'RecipientExists', @cValidateType_Cd = 'ExitPGM'

	-- This Query loads the data from Donor
	if @cValidateType_Cd = 'Insert'
	
	begin
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdInsert = 'update R1
			set R1.I9_SEC1_FirstName = D1.I9_SEC1_FirstName, R1.I9_SEC1_LastName = D1.I9_SEC1_LastName,	R1.I9_SEC1_MiddleInitial = D1.I9_SEC1_MiddleInitial, R1.I9_SEC1_OtherNamesUsed = D1.I9_SEC1_OtherNamesUsed,
			R1.I9_SEC1_Address1 = D1.I9_SEC1_Address1, R1.I9_SEC1_City = D1.I9_SEC1_City, R1.I9_SEC1_Zip = D1.I9_SEC1_Zip, R1.I9_SEC1_SSN = D1.I9_SEC1_SSN,	R1.I9_SEC1_DOB = D1.I9_SEC1_DOB,
			R1.I9_SEC1_EmailAddress = D1.I9_SEC1_EmailAddress,	R1.I9_SEC1_PhoneHome = D1.I9_SEC1_PhoneHome, R1.I9_SEC1_IsUSCitizen = D1.I9_SEC1_IsUSCitizen, R1.I9_SEC1_IsUSNonCitizenNational = D1.I9_SEC1_IsUSNonCitizenNational,
			R1.I9_SEC1_IsUSPR = D1.I9_SEC1_IsUSPR, R1.I9_SEC1_IsAlien = D1.I9_SEC1_IsAlien,	R1.I9_SEC1_PRUSCISNumber = D1.I9_SEC1_PRUSCISNumber, R1.I9_SEC1_AlienWorkExpirationDate = D1.I9_SEC1_AlienWorkExpirationDate,
			R1.I9_SEC1_AlienUSCISNumber = D1.I9_SEC1_AlienUSCISNumber,	R1.I9_SEC1_AlienI94Number = D1.I9_SEC1_AlienI94Number,	R1.I9_SEC1_AlienForeignPassportNumber = D1.I9_SEC1_AlienForeignPassportNumber,
			R1.I9_SEC1_AlienCountryOfIssuance = D1.I9_SEC1_AlienCountryOfIssuance,	R1.I9_SEC1_EsignName = D1.I9_SEC1_EsignName, R1.I9_SEC1_EsignFormDate = D1.I9_SEC1_EsignFormDate, R1.I9_SEC1_EsignStamptedDateTime = D1.I9_SEC1_EsignStamptedDateTime,
			R1.I9_SEC1_Apartment = D1.I9_SEC1_Apartment, R1.I9_SEC1_Prep_FirstName = D1.I9_SEC1_Prep_FirstName,	R1.I9_SEC1_Prep_LastName = D1.I9_SEC1_Prep_LastName, R1.I9_SEC1_Prep_Address1 = D1.I9_SEC1_Prep_Address1,
			R1.I9_SEC1_Prep_City = D1.I9_SEC1_Prep_City, R1.I9_SEC1_Prep_Zip = D1.I9_SEC1_Prep_Zip, R1.I9_SEC1_Prep_IsPreparer = D1.I9_SEC1_Prep_IsPreparer, R1.I9_SEC1_Prep_EsignName = D1.I9_SEC1_Prep_EsignName,
			R1.I9_SEC1_Prep_EsignFormDate = D1.I9_SEC1_Prep_EsignFormDate, R1.I9_SEC1_Prep_EsignStamptedDateTime = D1.I9_SEC1_Prep_EsignStamptedDateTime, R1.I9_SEC1_PRAlienRegNumber = D1.I9_SEC1_PRAlienRegNumber,
			R1.I9_SEC1_AlienAlienRegNumber = D1.I9_SEC1_AlienAlienRegNumber, R1.I9_SEC1_Prep_CountryStateTypeCode = D1.I9_SEC1_Prep_CountryStateTypeCode, R1.I9_SEC1_CountryStateTypeCode = D1.I9_SEC1_CountryStateTypeCode,
			R1.I9_SEC1_IsComplete = D1.I9_SEC1_IsComplete, R1.I9_SEC2_IsComplete = D1.I9_SEC2_IsComplete, R1.I9_SEC3_IsComplete = D1.I9_SEC3_IsComplete, R1.I9_SEC1_IsAssigned = D1.I9_SEC1_IsAssigned,
			R1.I9_SEC2_ListA_DocumentTitle_1 = D1.I9_SEC2_ListA_DocumentTitle_1, R1.I9_SEC2_ListA_IssuingAuthority_1 = D1.I9_SEC2_ListA_IssuingAuthority_1, R1.I9_SEC2_ListA_DocumentNumber_1 = D1.I9_SEC2_ListA_DocumentNumber_1,
			R1.I9_SEC2_ListA_ExpirationDate_1 = D1.I9_SEC2_ListA_ExpirationDate_1,
			R1.I9_SEC2_ListA_DocumentTitle_2 = D1.I9_SEC2_ListA_DocumentTitle_2, R1.I9_SEC2_ListA_IssuingAuthority_2 = D1.I9_SEC2_ListA_IssuingAuthority_2, R1.I9_SEC2_ListA_DocumentNumber_2 = D1.I9_SEC2_ListA_DocumentNumber_2,
			R1.I9_SEC2_ListA_ExpirationDate_2 = D1.I9_SEC2_ListA_ExpirationDate_2,
			R1.I9_SEC2_ListA_DocumentTitle_3 = D1.I9_SEC2_ListA_DocumentTitle_3, R1.I9_SEC2_ListA_IssuingAuthority_3 = D1.I9_SEC2_ListA_IssuingAuthority_3, R1.I9_SEC2_ListA_DocumentNumber_3 = D1.I9_SEC2_ListA_DocumentNumber_3,
			R1.I9_SEC2_ListA_ExpirationDate_3 = D1.I9_SEC2_ListA_ExpirationDate_3,
			R1.I9_SEC2_ListB_DocumentTitle_1 = D1.I9_SEC2_ListB_DocumentTitle_1, R1.I9_SEC2_ListB_IssuingAuthority_1 = D1.I9_SEC2_ListB_IssuingAuthority_1, R1.I9_SEC2_ListB_DocumentNumber_1 = D1.I9_SEC2_ListB_DocumentNumber_1,
			R1.I9_SEC2_ListB_ExpirationDate_1 = D1.I9_SEC2_ListB_ExpirationDate_1, R1.I9_SEC2_ListC_DocumentTitle_1 = D1.I9_SEC2_ListC_DocumentTitle_1, R1.I9_SEC2_ListC_IssuingAuthority_1 = D1.I9_SEC2_ListC_IssuingAuthority_1,
			R1.I9_SEC2_ListC_DocumentNumber_1 = D1.I9_SEC2_ListC_DocumentNumber_1, R1.I9_SEC2_ListC_ExpirationDate_1 = D1.I9_SEC2_ListC_ExpirationDate_1, R1.I9_SEC2_AdditionalInformation = D1.I9_SEC2_AdditionalInformation,
			R1.I9_SEC2_EmployeeFirstDayOfEmployment = D1.I9_SEC2_EmployeeFirstDayOfEmployment, R1.I9_SEC2_EsignName = D1.I9_SEC2_EsignName, R1.I9_SEC2_EsignFormDate = D1.I9_SEC2_EsignFormDate,
			R1.I9_SEC2_EsignStamptedDateTime = D1.I9_SEC2_EsignStamptedDateTime, R1.I9_SEC2_Esign_TitleOfRep = D1.I9_SEC2_Esign_TitleOfRep, R1.I9_SEC2_Esign_FirstName = D1.I9_SEC2_Esign_FirstName,
			R1.I9_SEC2_Esign_LastName = D1.I9_SEC2_Esign_LastName, R1.I9_SEC2_Esign_CompanyName = D1.I9_SEC2_Esign_CompanyName, R1.I9_SEC2_Esign_Address1 = D1.I9_SEC2_Esign_Address1,
			R1.I9_SEC2_Esign_City = D1.I9_SEC2_Esign_City, R1.I9_SEC2_Esign_CountryStateTypeID = D1.I9_SEC2_Esign_CountryStateTypeID, R1.I9_SEC2_Esign_Zip = D1.I9_SEC2_Esign_Zip
			from '+trim(@cDonorTablePath)+'Employee D1
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'I9 Update - A' as Insertdata
			end
		end
		---------------------------------------
		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		-- begin
		-- 	select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'PositionType (CompanyID, Code, Title, Priority, Active, ApprovedDate, EffectiveDate, ClosedDate, IsBudgeted, PayGradeTypeID, EEOTypeID, WorkerCompTypeID, SupervisorID, FTE, Description, Requirements, IsOTExempt, FLSATypeID, PR_Integration_PK)
		-- 	select '+@cRecipientCompany_ID+', T1.Code, Title, T1.Priority, T1.Active, ApprovedDate, EffectiveDate, ClosedDate, IsBudgeted, R1.ID, R2.ID, R3.ID, R4.ID, FTE, T1.Description, Requirements, IsOTExempt, FLSATypeID, T1.PR_Integration_PK
		-- 	from '+trim(@cDonorTablePath)+'PositionType T1

		-- 	left outer join '+trim(@cDonorTablePath)+'PayGradeType D1 on D1.CompanyID = T1.CompanyID and D1.ID = T1.PayGradeTypeID
		-- 	left outer join '+trim(@cRecipientTablePath)+'PayGradeType R1 on R1.Code = D1.Code and R1.Description = D1.Description

		-- 	left outer join '+trim(@cDonorTablePath)+'EEOType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.EEOTypeID
		-- 	left outer join '+trim(@cRecipientTablePath)+'EEOType R2 on R2.CompanyID = R1.CompanyID and R2.Code = D2.Code and R2.Description = D2.Description

		-- 	left outer join '+trim(@cDonorTablePath)+'WorkerCompType D3 on D3.CompanyID = T1.CompanyID and D3.ID = T1.WorkerCompTypeID
		-- 	left outer join '+trim(@cRecipientTablePath)+'WorkerCompType R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code and R3.Description = D3.Description

		-- 	left outer join '+trim(@cDonorTablePath)+'Employee D4 on D4.CompanyID = T1.CompanyID and D4.ID = T1.SupervisorID
		-- 	left outer join '+trim(@cRecipientTablePath)+'Employee R4 on R4.CompanyID = R1.CompanyID and R4.EmployeeCode = D4.EmployeeCode

		-- 	where T1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

		-- 	exec (@cmdInsert)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		select @cmdInsert
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'PositionType - B' as Insertdata
		-- 	end
		-- end
		-------------------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			--This section now runs two parts.  1st is to delete any existing compensation records inserted by the Payroll move, second is to Insert data from Donor to Recipient
			select @cmdInsert = 'delete from '+trim(@cRecipientTablePath)+'EmployeeCompensation where ID in (select R2.ID from '+trim(@cRecipientTablePath)+'Employee R1 
			join '+trim(@cRecipientTablePath)+'EmployeeCompensation R2 on R2.EmployeeID = R1.Id
			where R1.CompanyID = '+@cRecipientCompany_ID+')'

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCompensation Delete - C' as Insertdata
			end
			
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeCompensation (EmployeeID, PayTypeID, CompensationChangeReasonID, EffectiveDate, Rate, Comment, FrequencyTypeID, AutoPayTypeID, DefaultHours, PR_Integration_PK, EvoFK_JobNumber, PositionTypeID, PayGradeTypeID)
			select  R1.ID, R4.ID as RecipientPayTypeID, R5.ID as RecipientCompensationChangeReason, D2.EffectiveDate, D2.Rate, D2.Comment, R3.ID as RecipientFrequencyTypeID, D2.AutoPayTypeID, D2.DefaultHours,
			D2.PR_Integration_PK, null as EvoFK_JobNumber, null as PositionTypeID, null as PayGradeTypeID
			from '+trim(@cDonorTablePath)+'Employee D1
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+trim(@cDonorTablePath)+'EmployeeCompensation D2 on D2.EmployeeID = D1.ID

			left outer join '+trim(@cDonorTablePath)+'FrequencyType D3 on D3.CompanyID = D1.CompanyID and D3.ID = D2.FrequencyTypeID
			left outer join '+trim(@cRecipientTablePath)+'FrequencyType R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code

			left outer join '+trim(@cDonorTablePath)+'PayType D4 on D4.CompanyID = D1.CompanyID and D4.ID = D2.PayTypeID
			left outer join '+trim(@cRecipientTablePath)+'PayType R4 on R4.CompanyID = R1.CompanyID and R4.Code = D4.Code

			left outer join '+trim(@cDonorTablePath)+'CompensationChangeReason D5 on D5.CompanyID = D1.CompanyID and D5.ID = D2.CompensationChangeReasonID
			left outer join '+trim(@cRecipientTablePath)+'CompensationChangeReason R5 on R5.CompanyID = R1.CompanyID and R5.Code = D5.Code and R5.Description = D5.Description

			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCompensation Insert - C' as Insertdata
			end
		end

		-------------------------------------------------------------		
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			select @cmdInsert = 'update R1
			set R1.TimeClockServiceType = D1.TimeClockServiceType, 
			R1.IntegrationSwipeClockUsername = D1.IntegrationSwipeClockUsername, 
			R1.IntegrationSwipeClockPassword = D1.IntegrationSwipeClockPassword, 
			R1.TimeClockServiceIsIntegrationTempDisable = D1.TimeClockServiceIsIntegrationTempDisable,  
			R1.IntegrationSwipeClockOptFieldSupervisor = D1.IntegrationSwipeClockOptFieldSupervisor, 
			R1.IntegrationSwipeClockOptFieldRate = D1.IntegrationSwipeClockOptFieldRate, 
			R1.IntegrationSwipeClockOptFieldSSN = D1.IntegrationSwipeClockOptFieldSSN, 
			R1.IntegrationSwipeClockOptFieldBlanks = D1.IntegrationSwipeClockOptFieldBlanks, 
			R1.IntegrationSwipeClockOrgLevelToMapToLocation = D1.IntegrationSwipeClockOrgLevelToMapToLocation, 
			R1.IntegrationSwipeClockOrgLevelToMapToDepartment = D1.IntegrationSwipeClockOrgLevelToMapToDepartment, 
			R1.IntegrationSwipeClockOptFieldUserCredentials = D1.IntegrationSwipeClockOptFieldUserCredentials, 
			R1.IntegrationSwipeClockOptFieldTitle = D1.IntegrationSwipeClockOptFieldTitle, 
			R1.IntegrationSwipeClockOptFieldAlternateSupervisor = D1.IntegrationSwipeClockOptFieldAlternateSupervisor, 
			R1.IntegrationSwipeClockMapToHome1 = D1.IntegrationSwipeClockMapToHome1, 
			R1.IntegrationSwipeClockMapToHome2 = D1.IntegrationSwipeClockMapToHome2, 
			R1.IntegrationSwipeClockMapToHome3 = D1.IntegrationSwipeClockMapToHome3, 
			R1.IsEnabledSwipeClockFor1099 = D1.IsEnabledSwipeClockFor1099,
			R1.CreateDate = D1.CreateDate
			from '+trim(@cDonorTablePath)+'Company D1
			join '+trim(@cRecipientTablePath)+'Company R1 on R1.CompanyName = D1.CompanyName 
			where D1.ID = '+@cDonorCompany_ID+' and R1.ID = '+@cRecipientCompany_ID
			--and R1.PrimaryContactBusinessPhone = D1.PrimaryContactBusinessPhone and R1.PrimaryContactEmail = D1.PrimaryContactEMail
			--This was peviously used in the Where clause*/

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company SwipeClock Fields Insert - E' as Insertdata
			end
		end

		------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeAbsence (EmployeeID, AbsenceTypeID, AbsenceStatusTypeID, FMLALeaveTypeID, FMLAEntitlementTypeID, StartDate, ApprovedByEmployeeID, ReturnDate, Notes, PrivateNotes, HoursTaken, HoursPerDayTaken, IsWeekendsIncluded, PR_Integration_PK, SubmitDate, EvoFK_TimeOffCategoryId)
			select R1.ID, NULL, D1.AbsenceStatusTypeID, D1.FMLALeaveTypeID, D1.FMLAEntitlementTypeID, D1.StartDate, R2.ID, 
			D1.ReturnDate, D1.Notes, D1.PrivateNotes, D1.HoursTaken, D1.HoursPerDayTaken, D1.IsWeekendsIncluded, D1.PR_Integration_PK, D1.SubmitDate, D1.EvoFK_TimeOffCategoryId
			from '+trim(@cDonorTablePath)+'EmployeeAbsence D1
			join '+trim(@cDonorTablePath)+'Employee D2 on D1.EmployeeID = D2.ID
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D2.EmployeeCode 
			left outer join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D1.ApprovedByEmployeeID and D3.CompanyID = '+@cDonorCompany_ID+'
			left outer join '+trim(@cRecipientTablePath)+'Employee R2 on D3.EmployeeCode = R2.EmployeeCode and R2.CompanyID = '+@cRecipientCompany_ID+'
			where D1.AbsenceStatusTypeID = 1 and D2.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAbsence Existing Records - F' as Insertdata
			end
		end

		------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeAbsenceDetail (EmployeeAbsenceID, AbsenceDate, HoursTaken, PR_Integration_PK)
			select R2.ID, D1.AbsenceDate, D1.HoursTaken, D1.PR_Integration_PK
			from '+trim(@cDonorTablePath)+'EmployeeAbsenceDetail D1
			join '+trim(@cDonorTablePath)+'EmployeeAbsence D2 on D2.ID = D1.EmployeeAbsenceID
			join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D2.EmployeeID
			join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D3.EmployeeCode
			join '+trim(@cRecipientTablePath)+'EmployeeAbsence R2 on R2.EmployeeID = R1.ID and D1.AbsenceDate between R2.StartDate and R2.ReturnDate
			where D2.AbsenceStatusTypeID = 1 and D3.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAbsenceDetail Existing Records - G' as Insertdata
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
		--select @cmdShowDataDonor = 'delete from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		--exec (@cmdShowDataDonor)
		select  @cFailCodes = 'Delete Not Available At This Time'
	
	end
	
	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_CompensationDataSet_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_CompensationDataSet_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_CompensationDataSet_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_CompensationDataSet_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_CompensationDataSet_V1 to public */
	grant execute on dbo.usp_EIN_Cons_CompensationDataSet_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_CompensationDataSet_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_CompensationDataSet_V1.sql 
-----------------------------------------------------------------*/