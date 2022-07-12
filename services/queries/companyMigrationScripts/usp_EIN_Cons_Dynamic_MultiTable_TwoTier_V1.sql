/*-----------------------------------------------------------------
 usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1
		Ex.	: 	
			execute usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 1, '600373', '600351', 'ShowData', 'v'
			execute usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'u'
			execute usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ZZZ'
			execute usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ZZZ'
		
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
/*	First Drop Proc dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 */
	if object_id('dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 '
	end
GO

	create procedure usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1
	
		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(75),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(8),
		@cDonorCompany_ID		char(8),
		@cValidateType_Cd		char(20),
		@cTableToRun			char(27)

	with encryption
	as

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
	declare @cRecipientTablePath char(75)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)

	declare @DonorT1EmpCd bigint
	declare @DonorT1ID bigint
	declare @RecipientT1EmpCd bigint
	declare @RecipientT1ID bigint

	select @cDonorTablePath = trim(@cDonorDatabasePath) --'[adhr-1].[dbo].'
	select @cRecipientTablePath = trim(@cRecipientDatabasePath) --'[adhr-2].[dbo].'

	--select @cDonorCountPath = trim(@cDonorTablePath)+trim(@cTableName)
	--select @cRecipientCountPath = trim(@cRecipientTablePath)+trim(@cTableName)
--	select @cDonorCountPath

	set nocount on
	
	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	
	begin

		--select @cmdShowDataDonor = 'select * from '+trim(@cDonorTablePath)+trim(@cTableName)+' where CompanyID = '+@cDonorCompany_ID
		--exec (@cmdShowDataDonor)
		--select @cmdShowDataRecipient = 'select * from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		--exec (@cmdShowDataRecipient)

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			-----------------EmployeeEmergencyContact
			select @cmdShowDataDonor = 'select R1.Id, T1.Priority, T1.ContactType, T1.FirstName, T1.MiddleName, T1.LastName, T1.Address1, T1.Address2, T1.City, T1.CountryStateTypeID, T1.Zip, T1.EmailAddress, T1.PhoneHome, T1.PhoneWork, T1.PhoneCell, T1.Notes, T1.LastUpdateDate
			from '+@cDonorTablePath+'EmployeeEmergencyContact T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+@cRecipientTablePath+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEmergencyContact - A' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			---------------EmployeeNote
			select @cmdShowDataDonor = 'select R1.Id, T1.NoteDate, T1.Title, T1.Description
			from '+@cDonorTablePath+'EmployeeNote T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+@cRecipientTablePath+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeNote - B' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			----------- OpenEnrollmentEmployeeElection
			select @cmdShowDataDonor = 'select T1.PlanTypeID, R1.ID, R2.ID, R3.ID, LastModified, R4.ID, ReasonDeclined, ReasonDeclinedDetails, IsUpdated, EmployeeFSAContributionPerPay, IsLimitedFSA, T1.IncludeADD, ElectedLifeAmount
			from '+@cDonorTablePath+'OpenEnrollmentEmployeeElection T1
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode

			left outer join '+@cDonorTablePath+'BenefitPlan D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R2 on R2.CompanyID = R1.CompanyID and R2.Code = D2.Code and R2.Description = D2.Description and isnull(R2.StartDate, '''') = isnull(D2.StartDate, '''') and isnull(R2.EndDate, '''') = isnull(D2.EndDate, '''')

			left outer join '+@cDonorTablePath+'BenefitCoverageType D3 on D3.ID = T1.CoverageTypeID
			left outer join '+trim(@cRecipientTablePath)+'BenefitCoverageType R3 on R3.Code = D3.Code and R3.Description = D3.Description

			left outer join '+@cDonorTablePath+'OpenEnrollment D4 on D4.CompanyID = D1.CompanyID and D4.ID = T1.OpenEnrollmentID
			left outer join '+trim(@cRecipientTablePath)+'OpenEnrollment R4 on R4.CompanyID = R1.CompanyID and R4.Name = D4.Name

			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'OpenEnrollmentEmployeeElection - C' as ShowData
			end
		end
		----------- EmployeeCompensation
		/*select @cmdShowDataDonor = 'select R1.ID, T1.PayTypeID, T1.CompensationChangeReasonID, T1.EffectiveDate, T1.Rate, T1.Comment , T1.FrequencyTypeID, T1.AutoPayTypeID, T1.DefaultHours, T1.PR_Integration_PK, T1.EvoFK_JobNumber, T1.PositionTypeID, T1.PayGradeTypeID
		from '+@cDonorTablePath+'EmployeeCompensation T1 
		join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
		left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
		where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

		exec (@cmdShowDataDonor)*/

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			----------- EmployeeEducationLevel
			select @cmdShowDataDonor = 'select R1.ID, T1.EducationLevelTypeID, T1.GPA, T1.Institution, T1.CompletedDate, T1.Major, T1.Minor, T1.Notes
			from '+@cDonorTablePath+'EmployeeEducationLevel T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEducationLevel - D' as ShowData
			end
		end

		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		-- begin
		-- 	----------- EmployeeLaborAllocation
		-- 	select @cmdShowDataDonor = 'select R1.ID, JobTypeID, Org1TypeID, Org2TypeID, Org3TypeID, Org4TypeID, Org5TypeID, StartDate, EndDate, Percentage
		-- 	from '+@cDonorTablePath+'EmployeeLaborAllocation T1 
		-- 	join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
		-- 	left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
		-- 	where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

		-- 	exec (@cmdShowDataDonor)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		print @cmdShowDataDonor
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'EmployeeLaborAllocation - E' as ShowData
		-- 	end
		-- end

		/*Moved to Cons_Document -- Includes DocumentID there
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-----------EmployeeW4 and W4Document
			select @cmdShowDataDonor = 'select R1.ID, T1.ApprovalStatus, T1.W4_BOX1_FirstName, T1.W4_BOX1_LastName, T1.W4_BOX1_MiddleInitial, T1.W4_BOX1_Address1, T1.W4_BOX1_City, T1.W4_BOX1_CountryStateTypeID, T1.W4_BOX1_Zip, T1.W4_BOX2_SSN, T1.W4_BOX3_IsSingle, T1.W4_BOX3_IsMarried, T1.W4_BOX3_IsMarriedButWHAtHigherSingleRate, T1.W4_BOX4_IsNameDifferentFromSSCard, T1.W4_BOX5_TotalAllowances, T1.W4_BOX6_AdditionalAmountWH, T1.W4_BOX7_IsExempt, T1.W4_BOX7_ExemptText, T1.W4_EsignName, T1.W4_EsignFormDate, T1.W4_EsignStamptedDateTime, T1.ApprovedDate, T1.ApprovedRejectedByHRNextUserID, T1.DocumentID, T1.W4_FirstName, T1.W4_LastName, T1.W4_MiddleInitial, T1.W4_Address1, T1.W4_City, T1.W4_CountryStateTypeID, T1.W4_Zip, T1.W4_SSN, T1.W4_MaritalStatus, T1.W4_HigherRate, T1.W4_DependentsUnderSeventeen, T1.W4_OtherDependents, T1.W4_OtherIncome, T1.W4_AdditionalDeductions, T1.W4_ExtraWithholding, T1.W4_Exempt, T1.W4_OtherTaxCredits
			from '+@cDonorTablePath+'EmployeeW4 T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeW4 - F' as ShowData
			end
		end*/

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			----------------------Employee Review
			select @cmdShowDataDonor = 'select R1.ID, R2.ID, ReviewStatusTypeID, ScheduledDate, R3.ID, CompletedDate, R4.ID, Completed2Date, Scheduled2Date, Notes, PrivateNotes, T1.ReviewTemplate, Rating, Rating2, EmailAcknowledged
			from '+@cDonorTablePath+'EmployeeReview T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left join '+@cDonorTablePath+'Employee D3 on D3.ID = T1.ReviewByEmployeeID
			left join '+trim(@cRecipientTablePath)+'Employee R3 on R3.EmployeeCode = D3.EmployeeCode and R3.CompanyID = R1.CompanyID

			left outer join '+@cDonorTablePath+'Employee D4 on D4.ID = T1.Review2ByEmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R4 on R4.EmployeeCode = D4.EmployeeCode and R4.CompanyID = R1.CompanyID

			join '+@cDonorTablePath+'ReviewType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.ReviewTypeID
			join '+trim(@cRecipientTablePath)+'Reviewtype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeReview - G' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			-------------------Employee Skill
			select @cmdShowDataDonor = 'select R1.ID, R2.ID, ProficiencyPercentage, ExperienceInYears, Notes
			from '+@cDonorTablePath+'EmployeeSkill T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'Skilltype D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.SkillTypeID
			join '+trim(@cRecipientTablePath)+'Skilltype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeSkill - H' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
		begin
			----------------EmployeeLicense
			select @cmdShowDataDonor = 'select R1.ID, R2.ID, LicenseNumber, IssuedBy, IssuedDate, ExpirationDate, Notes, EmailAcknowledged
			from '+@cDonorTablePath+'EmployeeLicense T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'Licensetype D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.LicenseTypeID
			join '+trim(@cRecipientTablePath)+'Licensetype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeLicense - I' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%J%'
		begin
			----------------EmployeeAchievment
			select @cmdShowDataDonor = 'select R1.ID, R2.ID, AwardedDate, ExpirationDate, Notes
			from '+@cDonorTablePath+'EmployeeAchievement T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'AchievementType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.AchievementTypeID
			join '+trim(@cRecipientTablePath)+'Achievementtype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAchievement - J' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%K%'
		begin
			----------------Employee Certificate
			select @cmdShowDataDonor = 'select R1.ID, R2.ID, CertificateNumber, IssuedBy, IssuedDate, ExpirationDate, Notes, EmailAcknowledged
			from '+@cDonorTablePath+'EmployeeCertificate T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'CertificateType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.CertificateTypeID
			join '+trim(@cRecipientTablePath)+'Certificatetype R2 on R2.CompanyID = R1.CompanyID and R2.Code = D2.Code
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCertificate - K' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%L%'
		begin
			----------------Employee Enrolled Class
			select @cmdShowDataDonor = 'select R2.ID, R1.ID, T1.GradeOrResult, T1.Notes, T1.EmailAcknowledged, T1.CompletionDate, T1.ExpirationDate
			from '+@cDonorTablePath+'EmployeeEnrolledClass T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'HRnextClass D2 on D2.ID = T1.ClassID
			left join '+trim(@cRecipientTablePath)+'HRnextClass R2 on R2.CompanyID = R1.CompanyID and isnull(R2.Title, '''') = isnull(D2.Title, '''') and isnull(R2.Description, '''') = isnull(D2.Description, '''')
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEnrolledClass - L' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%M%'
		begin
			----------------EmployeeBenefit
			select @cmdShowDataDonor = 'select R1.ID, R3.ID, R4.ID, T1.Premium, T1.EmployerAmount, T1.EmployerPercent, T1.EmployeeAmount, T1.EmployeePercent, T1.MemberNumber, T1.StartDate, T1.EndDate, T1.Notes, T1.DeductionFrequencyCode, T1.PR_Integration_PK, R2.ID, T1.EmployeeSavingsAccountContributionPerPay, T1.EmployerCatchUpAmount, T1.ADDIncluded, T1.CoverageAmount
			from '+@cDonorTablePath+'EmployeeBenefit T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left outer join '+@cDonorTablePath+'LifeEventReason D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.LifeEventReasonID
			left outer join '+trim(@cRecipientTablePath)+'LifeEventReason R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description

			left outer join '+@cDonorTablePath+'BenefitPlan D3 on D3.CompanyID = D1.CompanyID and D3.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code and R3.Description = D3.Description and isnull(R3.StartDate, '''') = isnull(D3.StartDate, '''') and isnull(R3.EndDate, '''') = isnull(D3.EndDate, '''')

			left outer join '+@cDonorTablePath+'BenefitCoverageType D4 on D4.ID = T1.CoverageTypeID
			left outer join '+trim(@cRecipientTablePath)+'BenefitCoverageType R4 on R4.Code = D4.Code and R4.Description = D4.Description
			where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeBenefit - M' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%N%'
		begin
			----------------OnBoardingTaskStep
			select @cmdShowDataDonor = 'select distinct R1.ID, OnboardingTaskStepTypeID, IsOn, CompanyDoc_CompanyDocKeys
			from '+@cDonorTablePath+'OnBoardingTaskStep T1 
			join '+@cDonorTablePath+'OnBoardingTaskList D1 on D1.ID = T1.OnBoardingTaskListID
			join '+trim(@cRecipientTablePath)+'OnBoardingTaskList R1 on R1.Title = D1.Title
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'OnBoardingTaskStep - N' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%O%'
		begin
			----------------OnBoardingTaskListCustomQuestion
			select @cmdShowDataDonor = 'select R1.ID, R2.ID
			from '+@cDonorTablePath+'OnboardingTaskListCustomQuestion T1 
			join '+@cDonorTablePath+'OnBoardingTaskList D1 on D1.ID = T1.OnBoardingTaskListID
			left outer join '+trim(@cRecipientTablePath)+'OnBoardingTaskList R1 on R1.Title = D1.Title
			join '+@cDonorTablePath+'OBQuestionBank D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.OBQuestionBankID
			join '+trim(@cRecipientTablePath)+'OBQuestionBank R2 on R2.CompanyID = R1.CompanyID and R2.QuestionTitle = D2.QuestionTitle
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'OnBoardingTaskStep - O' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%P%'
		begin
			----------------OBQuestionBankMultipleChoiceAnswers
			select @cmdShowDataDonor = 'select R1.ID, T1.Answer
			from '+@cDonorTablePath+'OBQuestionBankMultipleChoiceAnswers T1 
			join '+@cDonorTablePath+'OBQuestionBank D1 on D1.ID = T1.OBQuestionBankID
			left outer join '+trim(@cRecipientTablePath)+'OBQuestionBank R1 on R1.QuestionTitle = D1.QuestionTitle
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'OBQuestionBankMultipleChoiceAnswers - P' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%R%'
		begin
			----------------EsignatureMetaData
			select @cmdShowDataDonor = 'select T1.*
			from '+@cDonorTablePath+'EsignatureMetaData T1 
			where T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EsignatureMetaData - R' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%Q%'
		begin
			----------------FileMetaData
			select @cmdShowDataDonor = 'select T1.*
			from '+@cDonorTablePath+'FileMetaData T1 
			where T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'FileMetaData - Q' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%T%'
		begin
			--This section now runs two parts.  1st is to delete any existing EmployeePositionOrganization records inserted by the Payroll move, second is to Insert data from Donor to Recipient
			select @cmdShowDataDonor = 'select count(EmployeeID) as RowsToBeDeleted from '+trim(@cRecipientTablePath)+'EmployeePositionOrganization where EmployeeID in (select R1.ID from '+trim(@cRecipientTablePath)+'Employee R1 where R1.CompanyID = '+@cRecipientCompany_ID+')'

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				select @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePositionOrganization Delete - T' as Insertdata
			end

			----------------------EmployeePositionOrganization
			--left outer join [adhr-2].[dbo].WorkerCompType R3 on R3.CompanyID = R2.CompanyID and R3.Code = D3.Code   --This seems to drop 20 recrods due to NULL PositionTypeID
			select @cmdShowDataDonor = 'select R1.ID as EmployeeCd, R2.ID as PositionTypeID, R3.ID as WorkerCompTypeID, 
			recipDiv1.ID as Org1ID, recipBranch2.ID as Org2ID, recipDep3.ID as Org3ID, recipTeam4.ID as Org4ID, null as Org5ID, R9.ID as PositionOrganizationChangeReasonID, R10.ID as EmploymentTypeID, R11.ID as TerminationReasonID, R12.ID as StatusTypeID,
			R13.ID as PayGroupTypeID, R14.ID as EEOTypeID, R15.ID as BenefitClassID,
			R16.ID as Supervisor1ID, R17.ID as Supervisor2ID, R18.ID as Supervisor3ID,
			T1.*
			from '+trim(@cDonorTablePath)+'EmployeePositionOrganization T1

			join '+trim(@cDonorTablePath)+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode

			left outer join '+trim(@cDonorTablePath)+'PositionType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.PositionTypeID
			left outer join '+trim(@cRecipientTablePath)+'PositionType R2 on R2.CompanyID = R1.CompanyID and D2.Code = R2.Code

			left outer join '+trim(@cDonorTablePath)+'WorkerCompType D3 on D3.CompanyID = D1.CompanyID and D3.ID = T1.WorkerCompTypeID
			left outer join '+trim(@cRecipientTablePath)+'WorkerCompType R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code and R3.Description = D3.Description

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD4 on SD4.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR4 on SR4.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv1 on ISNULL(T1.Org1ID, 0) = ISNULL(donorDiv1.ID, 0)
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv1 on
			recipDiv1.OrganizationStructureID = SR4.ID and
			recipDiv1.Code = donorDiv1.Code and
			recipDiv1.Org1ParentID is null

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD5 on SD5.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR5 on SR5.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch2 on ISNULL(donorBranch2.ID, 0) = ISNULL(T1.Org2ID, 0)
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv2 on donorDiv2.ID = donorBranch2.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv2 on
				recipDiv2.OrganizationStructureID = SR5.ID and
				recipDiv2.Code = donorDiv2.Code and
				recipDiv2.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch2 on
				recipBranch2.OrganizationStructureID = SR5.ID and
				recipBranch2.Code = donorBranch2.Code and
				recipBranch2.Org1ParentID = recipDiv2.ID and
				recipBranch2.Org2ParentID is null

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD6 on SD6.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR6 on SR6.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep3 on donorDep3.ID = T1.Org3ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch3 on donorBranch3.ID = donorDep3.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv3 on donorDiv3.ID = donorDep3.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv3 on
				recipDiv3.OrganizationStructureID = SR6.ID and
				recipDiv3.Code = donorDiv3.Code and
				recipDiv3.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch3 on
				recipBranch3.OrganizationStructureID = SR6.ID and
				recipBranch3.Code = donorBranch3.Code and
				recipBranch3.Org1ParentID = recipDiv3.ID and
				recipBranch3.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep3 on
				recipDep3.OrganizationStructureID = SR6.ID and
				recipDep3.Code = donorDep3.Code and
				recipDep3.Org2ParentID = recipBranch3.ID and
				recipDep3.Org1ParentID = recipDiv3.ID and
				recipDep3.Org3ParentID is null

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD7 on SD7.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR7 on SR7.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorTeam4 on donorTeam4.ID = T1.Org4ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep4 on donorDep4.ID = donorTeam4.Org3ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch4 on donorBranch4.ID = donorTeam4.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv4 on donorDiv4.ID = donorTeam4.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv4 on
				recipDiv4.OrganizationStructureID = SR7.ID and
				recipDiv4.Code = donorDiv4.Code and
				recipDiv4.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch4 on
				recipBranch4.OrganizationStructureID = SR7.ID and
				recipBranch4.Code = donorBranch4.Code and
				recipBranch4.Org1ParentID = recipDiv4.ID and
				recipBranch4.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep4 on
				recipDep4.OrganizationStructureID = SR7.ID and
				recipDep4.Code = donorDep4.Code and
				recipDep4.Org2ParentID = recipBranch4.ID and
				recipDep4.Org1ParentID = recipDiv4.ID and
				recipDep4.Org3ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipTeam4 on
				recipTeam4.OrganizationStructureID = SR7.ID and
				recipTeam4.Code = donorTeam4.Code and
				recipTeam4.Org3ParentID = recipDep4.ID and
				recipTeam4.Org2ParentID = recipBranch4.ID and
				recipTeam4.Org1ParentID = recipDiv4.ID and
				recipTeam4.Org4ParentID is null'
			select @cmdShowDataDonor = @cmdShowDataDonor + '
			left outer join '+trim(@cDonorTablePath)+'PositionOrganizationChangeReason D9 on D9.CompanyID = D1.CompanyID and D9.ID = T1.PositionOrganizationChangeReasonID
			left outer join '+trim(@cRecipientTablePath)+'PositionOrganizationChangeReason R9 on R9.CompanyID = R1.CompanyID and R9.Code = D9.Code

			left outer join '+trim(@cDonorTablePath)+'EmploymentType D10 on D10.CompanyID = D1.CompanyID and D10.ID = T1.EmploymentTypeID
			left outer join '+trim(@cRecipientTablePath)+'EmploymentType R10 on R10.CompanyID = R1.CompanyID and R10.Code = D10.Code

			left outer join '+trim(@cDonorTablePath)+'TerminationReason D11 on D11.CompanyID = D1.CompanyID and D11.ID = T1.TerminationReasonID
			left outer join '+trim(@cRecipientTablePath)+'TerminationReason R11 on R11.CompanyID = R1.CompanyID and R11.Code = D11.Code

			left outer join '+trim(@cDonorTablePath)+'StatusType D12 on D12.CompanyID = D1.CompanyID and D12.ID = T1.StatusTypeID
			left outer join '+trim(@cRecipientTablePath)+'StatusType R12 on R12.CompanyID = R1.CompanyID and R12.Code = D12.Code

			left outer join '+trim(@cDonorTablePath)+'PayGroupType D13 on D13.CompanyID = D1.CompanyID and D13.ID = T1.PayGroupTypeID
			left outer join '+trim(@cRecipientTablePath)+'PayGroupType R13 on R13.CompanyID = R1.CompanyID and R13.Code = D13.Code

			left outer join '+trim(@cDonorTablePath)+'EEOType D14 on D14.CompanyID = D1.CompanyID and D14.ID = T1.EEOTypeID
			left outer join '+trim(@cRecipientTablePath)+'EEOType R14 on R14.CompanyID = R1.CompanyID and R14.Code = D14.Code

			left outer join '+trim(@cDonorTablePath)+'BenefitClass D15 on D15.CompanyID = D1.CompanyID and D15.ID = T1.BenefitClassID
			left outer join '+trim(@cRecipientTablePath)+'BenefitClass R15 on R15.CompanyID = R1.CompanyID and R15.Code = D15.Code

			left outer join '+trim(@cDonorTablePath)+'Employee D16 on D16.CompanyID = D1.CompanyID and D16.ID = T1.Supervisor1ID
			left outer join '+trim(@cRecipientTablePath)+'Employee R16 on R16.CompanyID = R1.CompanyID and R16.EmployeeCode = D16.EmployeeCode

			left outer join '+trim(@cDonorTablePath)+'Employee D17 on D17.CompanyID = D1.CompanyID and D17.ID = T1.Supervisor2ID
			left outer join '+trim(@cRecipientTablePath)+'Employee R17 on R17.CompanyID = R1.CompanyID and R17.EmployeeCode = D17.EmployeeCode

			left outer join '+trim(@cDonorTablePath)+'Employee D18 on D18.CompanyID = D1.CompanyID and D18.ID = T1.Supervisor3ID
			left outer join '+trim(@cRecipientTablePath)+'Employee R18 on R18.CompanyID = R1.CompanyID and R18.EmployeeCode = D18.EmployeeCode

			where D1.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				select @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePositionOrganization - T' as ShowData
			end
		end

		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%U%'
		-- begin
		-- 	----------------Direct Deposit
		-- 	select @cmdShowDataDonor = 'select R1.ID, T1.Priority, T1.RoutingNumber, T1.Account, T1.Checking, T1.AmountCode, T1.Amount, T1.ExcludeSpecial, T1.PreNoteDate, T1.NameOnAccount, T1.StartDate, T1.EndDate, T1.IsPrenote_EVO,
		-- 	T1.EvoFK_DeductionFrequency, T1.EvoFK_DeductionCode, T1.PR_Integration_PK, T1.EvoFK_EmployeeEarningsDeduction, T1.ApprovalStatus, T1.IsSavings, T1.IsMoneyMarket
		-- 	from '+@cDonorTablePath+'EmployeeDirectDeposit T1 
		-- 	join '+trim(@cDonorTablePath)+'Employee D1 on D1.ID = T1.EmployeeID
		-- 	join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
		-- 	where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID+'
		-- 	and (T1.ApprovalStatus = 0 or T1.ApprovalStatus is null)
		-- 	and T1.PR_Integration_PK is null'

		-- 	exec (@cmdShowDataDonor)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		print @cmdShowDataDonor
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'Direct Deposit - U' as ShowData
		-- 	end
		-- end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%V%'
		begin
			----------------Misc EE Updates
			select @cmdShowDataDonor = 'select R1.ID, R1.FirstName, R1.LastName, R1.UD_Memo1, R1.UD_Memo2, R1.UD_Memo3, D1.ID, D1.FirstName, D1.LastName, D1.UD_Memo1, D1.UD_Memo2, D1.UD_Memo3,
			D1.CurrentPositionTypeID, R2.ID, D1.CurrentSupervisor1ID, R3.ID, D1.CurrentSupervisor2ID, R4.ID, D1.CurrentSupervisor3ID, R5.ID
			from '+trim(@cRecipientTablePath)+'Employee R1 
			join '+trim(@cDonorTablePath)+'Employee D1 on D1.EmployeeCode = R1.EmployeeCode

			left join '+trim(@cDonorTablePath)+'PositionType D2 on D1.CurrentPositionTypeID = D2.ID
			left join '+trim(@cRecipientTablePath)+'PositionType R2 on R2.CompanyID = R1.CompanyID and ISNULL(D2.Code, '''') = ISNULL(R2.Code, '''') and ISNULL(D2.Description, '''') = ISNULL(R2.Description, '''') and ISNULL(D2.Title, '''') = ISNULL(R2.Title, '''')

			-- supervisor 1
			left join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D1.CurrentSupervisor1ID
			left join '+trim(@cRecipientTablePath)+'Employee R3 on R3.EmployeeCode = D3.EmployeeCode and R3.CompanyID = R1.CompanyID

			-- supervisor 2
			left join '+trim(@cDonorTablePath)+'Employee D4 on D4.ID = D1.CurrentSupervisor2ID
			left join '+trim(@cRecipientTablePath)+'Employee R4 on R4.EmployeeCode = D4.EmployeeCode and R4.CompanyID = R1.CompanyID

			-- supervisor 3
			left join '+trim(@cDonorTablePath)+'Employee D5 on D5.ID = D1.CurrentSupervisor3ID
			left join '+trim(@cRecipientTablePath)+'Employee R5 on R5.EmployeeCode = D5.EmployeeCode and R5.CompanyID = R1.CompanyID

			where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'Misc EE Updates - V' as ShowData
			end
		end

		select @cFailCodes = 'ShowData'-- Not Available At This Time'
	
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
			-----------------EmployeeEmergencyContact
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeEmergencyContact (EmployeeID, Priority, ContactType, FirstName, MiddleName, LastName, Address1, Address2, City, CountryStateTypeID, Zip, EmailAddress, PhoneHome, PhoneWork, PhoneCell, Notes, LastUpdateDate)
			select R1.Id, T1.Priority, T1.ContactType, T1.FirstName, T1.MiddleName, T1.LastName, T1.Address1, T1.Address2, T1.City, T1.CountryStateTypeID, T1.Zip, T1.EmailAddress, T1.PhoneHome, T1.PhoneWork, T1.PhoneCell, T1.Notes, T1.LastUpdateDate
			from '+@cDonorTablePath+'EmployeeEmergencyContact T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+@cRecipientTablePath+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEmergencyContact - A' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			-------EmployeeNote
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeNote (EmployeeID, NoteDate, Title, Description)
			select R1.Id, T1.NoteDate, T1.Title, T1.Description
			from '+@cDonorTablePath+'EmployeeNote T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+@cRecipientTablePath+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeNote - B' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			----------- OpenEnrollmentEmployeeElection
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'OpenEnrollmentEmployeeElection (PlanTypeID, EmployeeID, PlanID, CoverageTypeID, LastModified, OpenEnrollmentID, ReasonDeclined, ReasonDeclinedDetails, IsUpdated, EmployeeFSAContributionPerPay, IsLimitedFSA, IncludeADD, ElectedLifeAmount)
			select T1.PlanTypeID, R1.ID, R2.ID, R3.ID, LastModified, R4.ID, ReasonDeclined, ReasonDeclinedDetails, IsUpdated, EmployeeFSAContributionPerPay, IsLimitedFSA, T1.IncludeADD, ElectedLifeAmount
			from '+@cDonorTablePath+'OpenEnrollmentEmployeeElection T1
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode

			left outer join '+@cDonorTablePath+'BenefitPlan D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R2 on R2.CompanyID = R1.CompanyID and R2.Code = D2.Code and R2.Description = D2.Description and isnull(R2.StartDate, '''') = isnull(D2.StartDate, '''') and isnull(R2.EndDate, '''') = isnull(D2.EndDate, '''')

			left outer join '+@cDonorTablePath+'BenefitCoverageType D3 on D3.ID = T1.CoverageTypeID
			left outer join '+trim(@cRecipientTablePath)+'BenefitCoverageType R3 on R3.Code = D3.Code and R3.Description = D3.Description

			left outer join '+@cDonorTablePath+'OpenEnrollment D4 on D4.CompanyID = D1.CompanyID and D4.ID = T1.OpenEnrollmentID
			left outer join '+trim(@cRecipientTablePath)+'OpenEnrollment R4 on R4.CompanyID = R1.CompanyID and R4.Name = D4.Name

			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'OpenEnrollmentEmployeeElection - C' as InsertData
			end
		end
		----------- EmployeeCompensation
		/*select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeCompensation (EmployeeID, PayTypeID, CompensationChangeReasonID, EffectiveDate, Rate, Comment, FrequencyTypeID, AutoPayTypeID, DefaultHours, PR_Integration_PK, EvoFK_JobNumber, PositionTypeID, PayGradeTypeID)
		select R1.ID, T1.PayTypeID, T1.CompensationChangeReasonID, T1.EffectiveDate, T1.Rate, T1.Comment , T1.FrequencyTypeID, T1.AutoPayTypeID, T1.DefaultHours, T1.PR_Integration_PK, T1.EvoFK_JobNumber, T1.PositionTypeID, T1.PayGradeTypeID
		from '+@cDonorTablePath+'EmployeeCompensation T1 
		join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
		left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
		where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

		exec (@cmdInsert)*/

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			----------- EmployeeEducationLevel
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeEducationLevel (EmployeeID, EducationLevelTypeID, GPA, Institution, CompletedDate, Major, Minor, Notes)
			select R1.ID, T1.EducationLevelTypeID, T1.GPA, T1.Institution, T1.CompletedDate, T1.Major, T1.Minor, T1.Notes
			from '+@cDonorTablePath+'EmployeeEducationLevel T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEducationLevel - D' as InsertData
			end
		end

		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		-- begin
		-- 	----------- EmployeeLaborAllocation
		-- 	select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeLaborAllocation (EmployeeID, JobTypeID, Org1TypeID, Org2TypeID, Org3TypeID, Org4TypeID, Org5TypeID, StartDate, EndDate, Percentage)
		-- 	select R1.ID, JobTypeID, Org1TypeID, Org2TypeID, Org3TypeID, Org4TypeID, Org5TypeID, StartDate, EndDate, Percentage
		-- 	from '+@cDonorTablePath+'EmployeeLaborAllocation T1 
		-- 	join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
		-- 	left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
		-- 	where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

		-- 	exec (@cmdInsert)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		print @cmdInsert
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'EmployeeLaborAllocation - E' as InsertData
		-- 	end
		-- end

		/*Moved to Cons_Document -- Includes DocumentID there
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-----------EmployeeW4 and W4Document
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeW4 (EmployeeID, ApprovalStatus, W4_BOX1_FirstName, W4_BOX1_LastName, W4_BOX1_MiddleInitial, W4_BOX1_Address1, W4_BOX1_City, W4_BOX1_CountryStateTypeID, W4_BOX1_Zip, W4_BOX2_SSN, W4_BOX3_IsSingle, W4_BOX3_IsMarried, W4_BOX3_IsMarriedButWHAtHigherSingleRate, W4_BOX4_IsNameDifferentFromSSCard, W4_BOX5_TotalAllowances, W4_BOX6_AdditionalAmountWH, W4_BOX7_IsExempt, W4_BOX7_ExemptText, W4_EsignName, W4_EsignFormDate, W4_EsignStamptedDateTime, ApprovedDate, ApprovedRejectedByHRNextUserID, DocumentID, W4_FirstName, W4_LastName, W4_MiddleInitial, W4_Address1, W4_City, W4_CountryStateTypeID, W4_Zip, W4_SSN, W4_MaritalStatus, W4_HigherRate, W4_DependentsUnderSeventeen, W4_OtherDependents, W4_OtherIncome, W4_AdditionalDeductions, W4_ExtraWithholding, W4_Exempt, W4_OtherTaxCredits)
			select R1.ID, T1.ApprovalStatus, T1.W4_BOX1_FirstName, T1.W4_BOX1_LastName, T1.W4_BOX1_MiddleInitial, T1.W4_BOX1_Address1, T1.W4_BOX1_City, T1.W4_BOX1_CountryStateTypeID, T1.W4_BOX1_Zip, T1.W4_BOX2_SSN, T1.W4_BOX3_IsSingle, T1.W4_BOX3_IsMarried, T1.W4_BOX3_IsMarriedButWHAtHigherSingleRate, T1.W4_BOX4_IsNameDifferentFromSSCard, T1.W4_BOX5_TotalAllowances, T1.W4_BOX6_AdditionalAmountWH, T1.W4_BOX7_IsExempt, T1.W4_BOX7_ExemptText, T1.W4_EsignName, T1.W4_EsignFormDate, T1.W4_EsignStamptedDateTime, T1.ApprovedDate, T1.ApprovedRejectedByHRNextUserID, T1.DocumentID, T1.W4_FirstName, T1.W4_LastName, T1.W4_MiddleInitial, T1.W4_Address1, T1.W4_City, T1.W4_CountryStateTypeID, T1.W4_Zip, T1.W4_SSN, T1.W4_MaritalStatus, T1.W4_HigherRate, T1.W4_DependentsUnderSeventeen, T1.W4_OtherDependents, T1.W4_OtherIncome, T1.W4_AdditionalDeductions, T1.W4_ExtraWithholding, T1.W4_Exempt, T1.W4_OtherTaxCredits
			from '+@cDonorTablePath+'EmployeeW4 T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeW4 - F' as InsertData
			end
		end*/

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			----------------------Employee Review
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeReview (EmployeeID, ReviewTypeID, ReviewStatusTypeID, ScheduledDate, ReviewByEmployeeID, CompletedDate, Review2ByEmployeeID, Completed2Date, Scheduled2Date, Notes, PrivateNotes, ReviewTemplate, Rating, Rating2, EmailAcknowledged)
			select R1.ID, R2.ID, ReviewStatusTypeID, ScheduledDate, R3.ID, CompletedDate, R4.ID, Completed2Date, Scheduled2Date, Notes, PrivateNotes, T1.ReviewTemplate, Rating, Rating2, EmailAcknowledged
			from '+@cDonorTablePath+'EmployeeReview T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left join '+@cDonorTablePath+'Employee D3 on D3.ID = T1.ReviewByEmployeeID
			left join '+trim(@cRecipientTablePath)+'Employee R3 on R3.EmployeeCode = D3.EmployeeCode and R3.CompanyID = R1.CompanyID

			left outer join '+@cDonorTablePath+'Employee D4 on D4.ID = T1.Review2ByEmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R4 on R4.EmployeeCode = D4.EmployeeCode and R4.CompanyID = R1.CompanyID

			join '+@cDonorTablePath+'ReviewType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.ReviewTypeID
			join '+trim(@cRecipientTablePath)+'Reviewtype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeReview - G' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			-------------------Employee Skill
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeSkill (EmployeeID, SkillTypeID, ProficiencyPercentage, ExperienceInYears, Notes)
			select R1.ID, R2.ID, ProficiencyPercentage, ExperienceInYears, Notes
			from '+@cDonorTablePath+'EmployeeSkill T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'Skilltype D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.SkillTypeID
			join '+trim(@cRecipientTablePath)+'Skilltype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeSkill - H' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
		begin
			----------------EmployeeLicense
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeLicense (EmployeeID, LicenseTypeID, LicenseNumber, IssuedBy, IssuedDate, ExpirationDate, Notes, EmailAcknowledged)
			select R1.ID, R2.ID, LicenseNumber, IssuedBy, IssuedDate, ExpirationDate, Notes, EmailAcknowledged
			from '+@cDonorTablePath+'EmployeeLicense T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'Licensetype D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.LicenseTypeID
			join '+trim(@cRecipientTablePath)+'Licensetype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeLicense - I' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%J%'
		begin
			----------------EmployeeAchievment
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeAchievement (EmployeeID, AchievementTypeID, AwardedDate, ExpirationDate, Notes)
			select R1.ID, R2.ID, AwardedDate, ExpirationDate, Notes
			from '+@cDonorTablePath+'EmployeeAchievement T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'AchievementType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.AchievementTypeID
			join '+trim(@cRecipientTablePath)+'Achievementtype R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAchievement - J' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%K%'
		begin
			----------------Employee Certificate
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeCertificate (EmployeeID, CertificateTypeID, CertificateNumber, IssuedBy, IssuedDate, ExpirationDate, Notes, EmailAcknowledged)
			select R1.ID, R2.ID, CertificateNumber, IssuedBy, IssuedDate, ExpirationDate, Notes, EmailAcknowledged
			from '+@cDonorTablePath+'EmployeeCertificate T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'CertificateType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.CertificateTypeID
			join '+trim(@cRecipientTablePath)+'Certificatetype R2 on R2.CompanyID = R1.CompanyID and R2.Code = D2.Code
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCertificate - K' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%L%'
		begin
			----------------Employee Enrolled Class
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeEnrolledClass (ClassID, EmployeeID, GradeOrResult, Notes, EmailAcknowledged, CompletionDate, ExpirationDate)
			select R2.ID, R1.ID, T1.GradeOrResult, T1.Notes, T1.EmailAcknowledged, T1.CompletionDate, T1.ExpirationDate
			from '+@cDonorTablePath+'EmployeeEnrolledClass T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			join '+@cDonorTablePath+'HRnextClass D2 on D2.ID = T1.ClassID
			left join '+trim(@cRecipientTablePath)+'HRnextClass R2 on R2.CompanyID = R1.CompanyID and isnull(R2.Title, '''') = isnull(D2.Title, '''') and isnull(R2.Description, '''') = isnull(D2.Description, '''')
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEnrolledClass - L' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%M%'
		begin
			----------------EmployeeBenefit
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeBenefit (EmployeeID, PlanID, CoverageTypeID, Premium, EmployerAmount, EmployerPercent, EmployeeAmount, EmployeePercent, MemberNumber, StartDate, EndDate, Notes, DeductionFrequencyCode, PR_Integration_PK, LifeEventReasonID, EmployeeSavingsAccountContributionPerPay, EmployerCatchUpAmount, ADDIncluded, CoverageAmount)
			select R1.ID, R3.ID, R4.ID, T1.Premium, T1.EmployerAmount, T1.EmployerPercent, T1.EmployeeAmount, T1.EmployeePercent, T1.MemberNumber, T1.StartDate, T1.EndDate, T1.Notes, T1.DeductionFrequencyCode, T1.PR_Integration_PK, R2.ID, T1.EmployeeSavingsAccountContributionPerPay, T1.EmployerCatchUpAmount, T1.ADDIncluded, T1.CoverageAmount
			from '+@cDonorTablePath+'EmployeeBenefit T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left outer join '+@cDonorTablePath+'LifeEventReason D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.LifeEventReasonID
			left outer join '+trim(@cRecipientTablePath)+'LifeEventReason R2 on R2.CompanyID = R1.CompanyID and R2.Description = D2.Description
			left outer join '+@cDonorTablePath+'BenefitPlan D3 on D3.CompanyID = D1.CompanyID and D3.ID = T1.PlanID
			left outer join '+trim(@cRecipientTablePath)+'BenefitPlan R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code and R3.Description = D3.Description and isnull(R3.StartDate, '''') = isnull(D3.StartDate, '''') and isnull(R3.EndDate, '''') = isnull(D3.EndDate, '''')

			left outer join '+@cDonorTablePath+'BenefitCoverageType D4 on D4.ID = T1.CoverageTypeID
			left outer join '+trim(@cRecipientTablePath)+'BenefitCoverageType R4 on R4.Code = D4.Code and R4.Description = D4.Description
			where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeBenefit - M' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%N%'
		begin
			----------------OnBoardingTaskStep
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'OnBoardingTaskStep (OnboardingTaskListID, OnboardingTaskStepTypeID, IsOn, CompanyDoc_CompanyDocKeys)
			select distinct R1.ID, OnboardingTaskStepTypeID, IsOn, substring(CompanyDoc_CompanyDocKeys,1,100)
			from '+@cDonorTablePath+'OnBoardingTaskStep T1 
			join '+@cDonorTablePath+'OnBoardingTaskList D1 on D1.ID = T1.OnBoardingTaskListID
			join '+trim(@cRecipientTablePath)+'OnBoardingTaskList R1 on R1.Title = D1.Title
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'OnBoardingTaskStep - N' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%O%'
		begin
			----------------OnBoardingTaskListCustomQuestion
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'OnboardingTaskListCustomQuestion (OnboardingTaskListID, OBQuestionBankID)
			select R1.ID, R2.ID
			from '+@cDonorTablePath+'OnboardingTaskListCustomQuestion T1 
			join '+@cDonorTablePath+'OnBoardingTaskList D1 on D1.ID = T1.OnBoardingTaskListID
			left outer join '+trim(@cRecipientTablePath)+'OnBoardingTaskList R1 on R1.Title = D1.Title
			join '+@cDonorTablePath+'OBQuestionBank D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.OBQuestionBankID
			join '+trim(@cRecipientTablePath)+'OBQuestionBank R2 on R2.CompanyID = R1.CompanyID and R2.QuestionTitle = D2.QuestionTitle
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'OnBoardingTaskStep - O' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%P%'
		begin
			----------------OBQuestionBankMultipleChoiceAnswers
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'OBQuestionBankMultipleChoiceAnswers (OBQuestionBankID, Answer)
			select R1.ID, T1.Answer
			from '+@cDonorTablePath+'OBQuestionBankMultipleChoiceAnswers T1 
			join '+@cDonorTablePath+'OBQuestionBank D1 on D1.ID = T1.OBQuestionBankID
			left outer join '+trim(@cRecipientTablePath)+'OBQuestionBank R1 on R1.QuestionTitle = D1.QuestionTitle
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'OBQuestionBankMultipleChoiceAnswers - P' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%R%'
		begin
			----------------EsignatureMetaData
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EsignatureMetaData (ID, CompanyID, EmployeeCode, Type, UploadDate, UploadedBy, Title, Filename, Category, SignatureStatusID, IsOnboardingDocument, FileMetadataID)
			select T1.ID, '+@cRecipientCompany_ID+', EmployeeCode, Type, UploadDate, UploadedBy, Title, Filename, Category, SignatureStatusID, IsOnboardingDocument, NULL
			from '+@cDonorTablePath+'EsignatureMetaData T1 
			where T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EsignatureMetaData - R' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%Q%'
		begin
			----------------FileMetaData
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'FileMetaData (CompanyID, EmployeeCode, Title, Category, UploadDate, Pointer, UploadedBy, IsPublishedToEmployee, EsignatureMetadataID)
			select '+@cRecipientCompany_ID+', EmployeeCode, Title, Category, UploadDate, Pointer, UploadedBy, IsPublishedToEmployee, EsignatureMetadataID
			from '+@cDonorTablePath+'FileMetaData T1 
			where T1.CompanyID ='+ @cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'FileMetaData - Q' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%S%'
		begin
			----------------Esign to FileMetaData Update
			select @cmdInsert = 'update '+trim(@cRecipientTablePath)+'EsignatureMetadata
			set FileMetadataID = FM2.ID
			from '+trim(@cRecipientTablePath)+'EsignatureMetadata ES2
			join '+trim(@cRecipientTablePath)+'FileMetaData FM2 on FM2.CompanyID = ES2.CompanyID and FM2.EsignatureMetadataID = ES2.ID
			where FM2.CompanyID = '+@cRecipientCompany_ID+' and FM2.EsignatureMetadataID is not null'



			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Esign to FileMetaData Update - S' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%T%'
		begin

			--This section now runs in 4 parts.  1st is to remove reference to EmployeePositionOrganization table in Employee. 
			--2nd is to delete any existing EmployeePositionOrganization records inserted by the Payroll move, 3rd is to Insert data from Donor to Recipient
			--4th backfill the CurrentEmployeePositionOrganization field in Employee
			select @cmdInsert = 'update '+trim(@cRecipientTablePath)+'Employee set CurrentEmployeePositionOrganizationID = NULL where CompanyID = '+@cRecipientCompany_ID 

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePositionOrganization Update Employee column CurrentEmployeePositionOrganization - T' as Insertdata
			end

			--Delete Step
			select @cmdInsert = 'delete from '+trim(@cRecipientTablePath)+'EmployeePositionOrganization where EmployeeID in (select R1.ID from '+trim(@cRecipientTablePath)+'Employee R1 
			where R1.CompanyID = '+@cRecipientCompany_ID+')'

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePositionOrganization Delete - T' as Insertdata
			end

			----------------------EmployeePositionOrganization
			--left outer join [adhr-2].[dbo].WorkerCompType R3 on R3.CompanyID = R2.CompanyID and R3.Code = D3.Code   --This seems to drop 20 recrods due to NULL PositionTypeID
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeePositionOrganization (EmployeeID, Org1ID, Org2ID, Org3ID, Org4ID, Org5ID, PositionTypeID, PositionOrganizationChangeReasonID, Supervisor1ID, WorkerCompTypeID, 
			EmploymentTypeID, EffectiveDate, Comment, TerminationReasonID, StatusTypeID, PayGroupTypeID, EEOTypeID, FLSATypeID, Supervisor2ID, Supervisor3ID, IsHire, IsTerm, AlternateSupervisor, BenefitClassID)
			select R1.ID, recipDiv1.ID as Org1ID, recipBranch2.ID as Org2ID, recipDep3.ID as Org3ID, recipTeam4.ID as Org4ID, null as Org5ID, R2.ID, R9.ID, R16.ID, R3.ID, 
			R10.ID, T1.EffectiveDate, T1.Comment, R11.ID, R12.ID, R13.ID, R14.ID, T1.FLSATypeID, R17.ID, R18.ID, T1.IsHire, T1.IsTerm, T1.AlternateSupervisor, R15.ID
			
			from '+trim(@cDonorTablePath)+'EmployeePositionOrganization T1

			join '+trim(@cDonorTablePath)+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode

			left outer join '+trim(@cDonorTablePath)+'PositionType D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.PositionTypeID
			left outer join '+trim(@cRecipientTablePath)+'PositionType R2 on R2.CompanyID = R1.CompanyID and D2.Code = R2.Code

			left outer join '+trim(@cDonorTablePath)+'WorkerCompType D3 on D3.CompanyID = D1.CompanyID and D3.ID = T1.WorkerCompTypeID
			left outer join '+trim(@cRecipientTablePath)+'WorkerCompType R3 on R3.CompanyID = R1.CompanyID and R3.Code = D3.Code and R3.Description = D3.Description

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD4 on SD4.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR4 on SR4.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv1 on ISNULL(T1.Org1ID, 0) = ISNULL(donorDiv1.ID, 0)
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv1 on
			recipDiv1.OrganizationStructureID = SR4.ID and
			recipDiv1.Code = donorDiv1.Code and
			recipDiv1.Org1ParentID is null

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD5 on SD5.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR5 on SR5.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch2 on ISNULL(donorBranch2.ID, 0) = ISNULL(T1.Org2ID, 0)
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv2 on donorDiv2.ID = donorBranch2.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv2 on
				recipDiv2.OrganizationStructureID = SR5.ID and
				recipDiv2.Code = donorDiv2.Code and
				recipDiv2.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch2 on
				recipBranch2.OrganizationStructureID = SR5.ID and
				recipBranch2.Code = donorBranch2.Code and
				recipBranch2.Org1ParentID = recipDiv2.ID and
				recipBranch2.Org2ParentID is null

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD6 on SD6.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR6 on SR6.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep3 on donorDep3.ID = T1.Org3ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch3 on donorBranch3.ID = donorDep3.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv3 on donorDiv3.ID = donorDep3.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv3 on
				recipDiv3.OrganizationStructureID = SR6.ID and
				recipDiv3.Code = donorDiv3.Code and
				recipDiv3.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch3 on
				recipBranch3.OrganizationStructureID = SR6.ID and
				recipBranch3.Code = donorBranch3.Code and
				recipBranch3.Org1ParentID = recipDiv3.ID and
				recipBranch3.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep3 on
				recipDep3.OrganizationStructureID = SR6.ID and
				recipDep3.Code = donorDep3.Code and
				recipDep3.Org2ParentID = recipBranch3.ID and
				recipDep3.Org1ParentID = recipDiv3.ID and
				recipDep3.Org3ParentID is null

			join '+trim(@cDonorTablePath)+'OrganizationStructure SD7 on SD7.CompanyID = D1.CompanyID
			join '+trim(@cRecipientTablePath)+'OrganizationStructure SR7 on SR7.CompanyID = R1.CompanyID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorTeam4 on donorTeam4.ID = T1.Org4ID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDep4 on donorDep4.ID = donorTeam4.Org3ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorBranch4 on donorBranch4.ID = donorTeam4.Org2ParentID
			left join '+trim(@cDonorTablePath)+'OrganizationType donorDiv4 on donorDiv4.ID = donorTeam4.Org1ParentID
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDiv4 on
				recipDiv4.OrganizationStructureID = SR7.ID and
				recipDiv4.Code = donorDiv4.Code and
				recipDiv4.Org1ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipBranch4 on
				recipBranch4.OrganizationStructureID = SR7.ID and
				recipBranch4.Code = donorBranch4.Code and
				recipBranch4.Org1ParentID = recipDiv4.ID and
				recipBranch4.Org2ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipDep4 on
				recipDep4.OrganizationStructureID = SR7.ID and
				recipDep4.Code = donorDep4.Code and
				recipDep4.Org2ParentID = recipBranch4.ID and
				recipDep4.Org1ParentID = recipDiv4.ID and
				recipDep4.Org3ParentID is null
			left join '+trim(@cRecipientTablePath)+'OrganizationType recipTeam4 on
				recipTeam4.OrganizationStructureID = SR7.ID and
				recipTeam4.Code = donorTeam4.Code and
				recipTeam4.Org3ParentID = recipDep4.ID and
				recipTeam4.Org2ParentID = recipBranch4.ID and
				recipTeam4.Org1ParentID = recipDiv4.ID and
				recipTeam4.Org4ParentID is null'
			select @cmdInsert = @cmdInsert + '
			left outer join '+trim(@cDonorTablePath)+'PositionOrganizationChangeReason D9 on D9.CompanyID = D1.CompanyID and D9.ID = T1.PositionOrganizationChangeReasonID
			left outer join '+trim(@cRecipientTablePath)+'PositionOrganizationChangeReason R9 on R9.CompanyID = R1.CompanyID and R9.Code = D9.Code

			left outer join '+trim(@cDonorTablePath)+'EmploymentType D10 on D10.CompanyID = D1.CompanyID and D10.ID = T1.EmploymentTypeID
			left outer join '+trim(@cRecipientTablePath)+'EmploymentType R10 on R10.CompanyID = R1.CompanyID and R10.Code = D10.Code

			left outer join '+trim(@cDonorTablePath)+'TerminationReason D11 on D11.CompanyID = D1.CompanyID and D11.ID = T1.TerminationReasonID
			left outer join '+trim(@cRecipientTablePath)+'TerminationReason R11 on R11.CompanyID = R1.CompanyID and R11.Code = D11.Code

			left outer join '+trim(@cDonorTablePath)+'StatusType D12 on D12.CompanyID = D1.CompanyID and D12.ID = T1.StatusTypeID
			left outer join '+trim(@cRecipientTablePath)+'StatusType R12 on R12.CompanyID = R1.CompanyID and R12.Code = D12.Code

			left outer join '+trim(@cDonorTablePath)+'PayGroupType D13 on D13.CompanyID = D1.CompanyID and D13.ID = T1.PayGroupTypeID
			left outer join '+trim(@cRecipientTablePath)+'PayGroupType R13 on R13.CompanyID = R1.CompanyID and R13.Code = D13.Code

			left outer join '+trim(@cDonorTablePath)+'EEOType D14 on D14.CompanyID = D1.CompanyID and D14.ID = T1.EEOTypeID
			left outer join '+trim(@cRecipientTablePath)+'EEOType R14 on R14.CompanyID = R1.CompanyID and R14.Code = D14.Code

			left outer join '+trim(@cDonorTablePath)+'BenefitClass D15 on D15.CompanyID = D1.CompanyID and D15.ID = T1.BenefitClassID
			left outer join '+trim(@cRecipientTablePath)+'BenefitClass R15 on R15.CompanyID = R1.CompanyID and R15.Code = D15.Code

			left outer join '+trim(@cDonorTablePath)+'Employee D16 on D16.CompanyID = D1.CompanyID and D16.ID = T1.Supervisor1ID
			left outer join '+trim(@cRecipientTablePath)+'Employee R16 on R16.CompanyID = R1.CompanyID and R16.EmployeeCode = D16.EmployeeCode

			left outer join '+trim(@cDonorTablePath)+'Employee D17 on D17.CompanyID = D1.CompanyID and D17.ID = T1.Supervisor2ID
			left outer join '+trim(@cRecipientTablePath)+'Employee R17 on R17.CompanyID = R1.CompanyID and R17.EmployeeCode = D17.EmployeeCode

			left outer join '+trim(@cDonorTablePath)+'Employee D18 on D18.CompanyID = D1.CompanyID and D18.ID = T1.Supervisor3ID
			left outer join '+trim(@cRecipientTablePath)+'Employee R18 on R18.CompanyID = R1.CompanyID and R18.EmployeeCode = D18.EmployeeCode

			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePositionOrganization - T' as ShowData
			end

			--Update Employee with CurrentEmployeePositionOrganization Step
			select @cmdInsert = 'update '+trim(@cRecipientTablePath)+'Employee
			set CurrentEmployeePositionOrganizationID = R2.MaxID
			from (select EmployeeID, max(ID) as MaxID, max(EffectiveDate) as MaxEffectiveDate from '+trim(@cRecipientTablePath)+'EmployeePositionOrganization where EmployeeID in (select R1.ID from '+trim(@cRecipientTablePath)+'Employee R1 where R1.CompanyID = '+@cRecipientCompany_ID+'  )
			group by EmployeeID) as R2
			where Employee.ID = R2.EmployeeID and Employee.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePositionOrganization Update Employee with CurrentEmployeePositionOrganization - T' as Insertdata
			end
		end

		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%U%'
		-- begin
		-- 	----------------Direct Deposit
		-- 	select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeDirectDeposit (EmployeeID, Priority, RoutingNumber, Account, Checking, AmountCode, Amount, ExcludeSpecial, PreNoteDate, NameOnAccount, StartDate, EndDate,
		-- 	IsPrenote_EVO, EvoFK_DeductionFrequency, EvoFK_DeductionCode, PR_Integration_PK, EvoFK_EmployeeEarningsDeduction, ApprovalStatus, IsSavings, IsMoneyMarket)
		-- 	select R1.ID, T1.Priority, T1.RoutingNumber, T1.Account, T1.Checking, T1.AmountCode, T1.Amount, T1.ExcludeSpecial, T1.PreNoteDate, T1.NameOnAccount, T1.StartDate, T1.EndDate, T1.IsPrenote_EVO,
		-- 	T1.EvoFK_DeductionFrequency, T1.EvoFK_DeductionCode, T1.PR_Integration_PK, T1.EvoFK_EmployeeEarningsDeduction, T1.ApprovalStatus, T1.IsSavings, T1.IsMoneyMarket
		-- 	from '+@cDonorTablePath+'EmployeeDirectDeposit T1 
		-- 	join '+trim(@cDonorTablePath)+'Employee D1 on D1.ID = T1.EmployeeID
		-- 	join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
		-- 	where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID+'
		-- 	and (T1.ApprovalStatus = 0 or T1.ApprovalStatus is null)
		-- 	and T1.PR_Integration_PK is null'

		-- 	exec (@cmdInsert)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		print @cmdInsert
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'Direct Deposit - U' as InsertData
		-- 	end
		-- end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%V%'
		begin
			----------------Misc EE updates
			select @cmdInsert = 'update R1 set R1.UD_Memo1 = D1.UD_Memo1, R1.UD_Memo2 = D1.UD_Memo2, R1.UD_Memo3 = D1.UD_Memo3,
			R1.CurrentPositionTypeID = R2.ID, R1.CurrentSupervisor1ID = R3.ID, R1.CurrentSupervisor2ID = R4.ID, R1.CurrentSupervisor3ID = R5.ID
			from '+trim(@cRecipientTablePath)+'Employee R1 
			join '+trim(@cDonorTablePath)+'Employee D1 on D1.EmployeeCode = R1.EmployeeCode

			left join '+trim(@cDonorTablePath)+'PositionType D2 on D1.CurrentPositionTypeID = D2.ID
			left join '+trim(@cRecipientTablePath)+'PositionType R2 on R2.CompanyID = R1.CompanyID and ISNULL(D2.Code, '''') = ISNULL(R2.Code, '''') and ISNULL(D2.Description, '''') = ISNULL(R2.Description, '''') and ISNULL(D2.Title, '''') = ISNULL(R2.Title, '''')

			-- supervisor 1
			left join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D1.CurrentSupervisor1ID
			left join '+trim(@cRecipientTablePath)+'Employee R3 on R3.EmployeeCode = D3.EmployeeCode and R3.CompanyID = R1.CompanyID

			-- supervisor 2
			left join '+trim(@cDonorTablePath)+'Employee D4 on D4.ID = D1.CurrentSupervisor2ID
			left join '+trim(@cRecipientTablePath)+'Employee R4 on R4.EmployeeCode = D4.EmployeeCode and R4.CompanyID = R1.CompanyID

			-- supervisor 3
			left join '+trim(@cDonorTablePath)+'Employee D5 on D5.ID = D1.CurrentSupervisor3ID
			left join '+trim(@cRecipientTablePath)+'Employee R5 on R5.EmployeeCode = D5.EmployeeCode and R5.CompanyID = R1.CompanyID

			where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Misc EE Updates - V' as ShowData
			end
		end

	end

	-- This Query verifies and loads the data from DonoC

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

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 to public */
	grant execute on dbo.usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_Dynamic_MultiTable_TwoTier_V1.sql 
-----------------------------------------------------------------*/