/*-----------------------------------------------------------------
 usp_EIN_Cons_Documents_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_Documents_V1
		Ex.	: 	
			execute usp_EIN_Cons_Documents_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'ShowData', 'zzz'
			execute usp_EIN_Cons_Documents_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'N'
			execute usp_EIN_Cons_Documents_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ZZZ'
			execute usp_EIN_Cons_Documents_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ZZZ'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 05/11/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_Documents_V1 */
	if object_id('dbo.usp_EIN_Cons_Documents_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_Documents_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_Documents_V1 '
	end
GO

	create procedure usp_EIN_Cons_Documents_V1
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
	declare @cRecipientTablePath char(75)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)

	declare @DonorT1EmpCd bigint
	declare @DonorT1ID bigint
	declare @RecipientT1EmpCd bigint
	declare @RecipientT1ID bigint

	select @cDonorTablePath = @cDonorDatabasePath --'[adhr-1].[dbo].'
	select @cRecipientTablePath = @cRecipientDatabasePath --'[adhr-2].[dbo].'

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

		--The first section it to move the Documents Table

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			----------------------Document by Company
			select @cmdShowDataDonor = 'select T1.HRnextAccountID, '+@cRecipientCompany_ID+', EmployeeID, DocumentCategory, FSRowGuid, Title, Description, Extension, Size, UploadDate, IsPrivateDocument, IsPublishedToEmployee, Filename, ContentType, UploadByUsername, EmployeeOnboardID, ESignDate, ESignName, ATApplicationID, IsPublishedToManager, FSDocument, FSDocumentTN, Pointer, ExternalDocumentID
			from '+@cDonorTablePath+'Document T1
			where T1.CompanyID = '+ @cDonorCompany_ID+' and EmployeeID is null'

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'Document by Company - A' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			-----------------Document by Employee
			select @cmdShowDataDonor = 'select T1.HRnextAccountID, T1.CompanyID, R1.ID, DocumentCategory, FSRowGuid, Title, Description, Extension, Size, UploadDate, IsPrivateDocument, IsPublishedToEmployee, Filename, ContentType, UploadByUsername, R2.ID, ESignDate, T1.ESignName, R3.ID, IsPublishedToManager, FSDocument, FSDocumentTN, Pointer, ExternalDocumentID
			from '+@cDonorTablePath+'Document T1
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+@cRecipientTablePath+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left outer join '+@cDonorTablePath+'EmployeeOnboard D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.EmployeeOnboardID
			left outer join '+@cRecipientTablePath+'EmployeeOnboard R2 on R2.CompanyID = R1.CompanyID and R2.EmployeeCode = D2.EmployeeCode
			left outer join '+@cDonorTablePath+'ATApplication D3 on D3.ID = T1.ATApplicationID
			Left outer join '+@cRecipientTablePath+'ATApplication R3 on R3.ATApplicationKey = D3.ATApplicationKey
			where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'Document by Employee - B' as ShowData
			end
		end

		--The second section is to correlate the Primary table to the Document thru the intermediary table (if required)

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			----------------------AnnouncementDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Announcement T1
			left join '+@cDonorTablePath+'AnnouncementDocument D1 on D1.AnnouncementID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Announcement R3 on R3.PostDate = T1.PostDate and R3.PostTitle = T1.PostTitle
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'AnnouncementDocument - C' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			----------------------BenefitPlan
			select @cmdShowDataDonor = 'select R2.ID as PlanID, R1.ID as DocumentID from '+@cDonorTablePath+'BenefitPlanDocument T1
				join '+@cDonorTablePath+'BenefitPlan D1 on D1.ID = T1.PlanID
				join '+@cDonorTablePath+'Document D2 on D2.ID = T1.DocumentID
				join '+@cRecipientTablePath+'Document R1 on R1.FSRowGuid = D2.FSRowGuid and R1.Title = D2.Title and R1.DocumentCategory = D2.DocumentCategory and R1.UploadDate = D2.UploadDate
				join '+@cRecipientTablePath+'BenefitPlan R2 on R2.Code = D1.Code and R2.Description = D1.Description and R2.PolicyNumber = D1.PolicyNumber and isnull(R2.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R2.EndDate, '''') = isnull(D1.EndDate, '''')
				where D1.CompanyID = '+ @cDonorCompany_ID+' and R2.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlan - D' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			---------------EmployeeI9Document
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			left join '+@cDonorTablePath+'EmployeeI9Document D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeI9Document - E' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-- EmployeeBCDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			left join '+@cDonorTablePath+'EmployeeBCDocument D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeBCDocument - F' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			----------- EmployeeEsignCompanyDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			left join '+@cDonorTablePath+'EmployeeEsignCompanyDocument D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEsignCompanyDocument - G' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			----------- EmployeePhotoDocument
			select @cmdShowDataDonor = 'select distinct R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			left join '+@cDonorTablePath+'EmployeePhotoDocument D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePhotoDocument - H' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
		begin
			----------- EmployeeW4Document
			/*select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			left join '+@cDonorTablePath+'EmployeeW4Document D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID*/

			select @cmdShowDataDonor = 'select R1.ID, T1.ApprovalStatus, T1.W4_BOX1_FirstName, T1.W4_BOX1_LastName, T1.W4_BOX1_MiddleInitial, T1.W4_BOX1_Address1, T1.W4_BOX1_City, T1.W4_BOX1_CountryStateTypeID, T1.W4_BOX1_Zip, T1.W4_BOX2_SSN, T1.W4_BOX3_IsSingle, T1.W4_BOX3_IsMarried, T1.W4_BOX3_IsMarriedButWHAtHigherSingleRate, T1.W4_BOX4_IsNameDifferentFromSSCard, T1.W4_BOX5_TotalAllowances, T1.W4_BOX6_AdditionalAmountWH, T1.W4_BOX7_IsExempt, T1.W4_BOX7_ExemptText, T1.W4_EsignName, T1.W4_EsignFormDate, T1.W4_EsignStamptedDateTime, T1.ApprovedDate, R3.ID as ApprovedRejectedByHRNextUserID, R2.ID as DocumentID, T1.W4_FirstName, T1.W4_LastName, T1.W4_MiddleInitial, T1.W4_Address1, T1.W4_City, T1.W4_CountryStateTypeID, T1.W4_Zip, T1.W4_SSN, T1.W4_MaritalStatus, T1.W4_HigherRate, T1.W4_DependentsUnderSeventeen, T1.W4_OtherDependents, T1.W4_OtherIncome, T1.W4_AdditionalDeductions, T1.W4_ExtraWithholding, T1.W4_Exempt, T1.W4_OtherTaxCredits
			from '+@cDonorTablePath+'EmployeeW4 T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left join '+@cDonorTablePath+'Document D2 on D2.ID = T1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			left outer join '+@cDonorTablePath+'HRnextUser D3 on D3.ID = T1.ApprovedRejectedByHRNextUserID
			left outer join '+trim(@cRecipientTablePath)+'HRnextUser R3 on R3.Username = D3.Username
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeW4 - I' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%J%'
		begin
			-- EmployeeAbsenceDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			left join '+@cDonorTablePath+'EmployeeAbsence D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeAbsenceDocument D2 on D2.EmployeeAbsenceID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and R2.Title = D3.Title and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAbsenceDocument - J' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%K%'
		begin
			-- EmployeeAchievementDocument
			select @cmdShowDataDonor = 'select recip_ea.ID as EmployeeAchievementID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeAchievementDocument donor_ead
			join '+@cDonorTablePath+'EmployeeAchievement donor_ea on donor_ea.ID = donor_ead.EmployeeAchievementID
			join '+@cDonorTablePath+'AchievementType donor_at on donor_at.ID = donor_ea.AchievementTypeID
			join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_ea.EmployeeID
			join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_ead.DocumentID
			join '+@cRecipientTablePath+'Document recip_d
				on recip_d.FSRowGuid = donor_d.FSRowGuid
				and isnull(recip_d.Title, 0) = isnull(donor_d.Title,0)
				and recip_d.DocumentCategory = donor_d.DocumentCategory
				and recip_d.UploadDate = donor_d.UploadDate
			join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
			join '+@cRecipientTablePath+'AchievementType recip_at
					on isnull(recip_at.Code, '''') = isnull(donor_at.Code, '''')
					and isnull(recip_at.Description, '''') = isnull(donor_at.Description, '''')
				join '+@cRecipientTablePath+'EmployeeAchievement recip_ea
					on recip_ea.AchievementTypeID = recip_at.ID
					and recip_ea.EmployeeID = recip_ee.ID
					and isnull(recip_ea.Notes, '''') = isnull(donor_ea.Notes, '''')
					and coalesce(convert(nvarchar(255), donor_ea.AwardedDate), 'NA') = coalesce(convert(nvarchar(255), recip_ea.AwardedDate), 'NA')
					and coalesce(convert(nvarchar(255), donor_ea.ExpirationDate), 'NA') = coalesce(convert(nvarchar(255), recip_ea.ExpirationDate), 'NA')
			where donor_ee.CompanyID = '+ @cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID	

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAchievementDocument - K' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%L%'
		begin
			-- EmployeeBenefitDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeBenefit D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeBenefitDocument D2 on D2.EmployeeBenefitID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and R2.Title = D3.Title and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeBenefitDocument - L' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%M%'
		begin
			-- EmployeeCertificateDocument 
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeCertificate D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeCertificateDocument D2 on D2.EmployeeCertificateID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and R2.Title = D3.Title and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCertificateDocument - M' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%N%'
		begin
			-- EmployeeEnrolledClassDocument
			select @cmdShowDataDonor = 'select recip_eec.ID as EmployeeEnrolledClassID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeEnrolledClassDocument donor_eecd
			join '+@cDonorTablePath+'EmployeeEnrolledClass donor_eec on donor_eec.ID = donor_eecd.EmployeeEnrolledClassID
			join '+@cDonorTablePath+'HRnextClass donor_c on donor_c.ID = donor_eec.ClassID
			join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_eec.EmployeeID
			join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_eecd.DocumentID
			join '+@cRecipientTablePath+'Document recip_d
				on recip_d.FSRowGuid= donor_d.FSRowGuid
				and isnull(recip_d.Title, 0) = isnull(donor_d.Title,0)
				and recip_d.DocumentCategory = donor_d.DocumentCategory
				and recip_d.UploadDate = donor_d.UploadDate
			join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
			join '+@cRecipientTablePath+'HRnextClass recip_c
					on isnull(recip_c.Title, '''') = isnull(donor_c.Title, '''')
					and isnull(recip_c.Description, '''') = isnull(donor_c.Description, '''')
				join '+@cRecipientTablePath+'EmployeeEnrolledClass recip_eec
					on recip_eec.ClassID = recip_c.ID
					and recip_eec.EmployeeID = recip_ee.ID
					and isnull(recip_eec.GradeOrResult, '''') = isnull(donor_eec.GradeOrResult, '''')
					and isnull(recip_eec.Notes, '''') = isnull(donor_eec.Notes, '''')
					and isnull(recip_eec.EmailAcknowledged, 0) = isnull(donor_eec.EmailAcknowledged, 0)
					and coalesce(convert(nvarchar(255), recip_eec.CompletionDate), 'NA') = coalesce(convert(nvarchar(255), donor_eec.CompletionDate), 'NA')
					and coalesce(convert(nvarchar(255), recip_eec.ExpirationDate), 'NA') = coalesce(convert(nvarchar(255), donor_eec.ExpirationDate), 'NA')
			where donor_ee.CompanyID = '+ @cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEnrolledClassDocument - N' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%O%'
		begin
			-- EmployeeLicenseDocument
			select @cmdShowDataDonor = '
				select recip_el.ID as EmployeeLicenseID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeLicenseDocument donor_eld
				join '+@cDonorTablePath+'EmployeeLicense donor_el on donor_el.ID = donor_eld.EmployeeLicenseID
				join '+@cDonorTablePath+'LicenseType donor_lt on donor_lt.ID = donor_el.LicenseTypeID
				join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_el.EmployeeID
				join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_eld.DocumentID
				join '+@cRecipientTablePath+'Document recip_d
					on recip_d.FSRowGuid = donor_d.FSRowGuid
					and isnull(recip_d.Title,0) = isnull(donor_d.Title,0)
					and recip_d.DocumentCategory = donor_d.DocumentCategory
					and recip_d.UploadDate = donor_d.UploadDate
				join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
				join '+@cRecipientTablePath+'LicenseType recip_lt
					on isnull(recip_lt.Code, '''') = isnull(donor_lt.Code, '''')
					and isnull(recip_lt.Description, '''') = isnull(donor_lt.Description, '''')
				join '+@cRecipientTablePath+'EmployeeLicense recip_el
					on recip_el.LicenseTypeID = recip_lt.ID
					and isnull(recip_el.LicenseNumber, '''') = isnull(donor_el.LicenseNumber, '''')
					and recip_el.EmployeeID = recip_ee.ID
					and isnull(recip_el.Notes, '''') = isnull(donor_el.Notes, '''')
					and recip_el.EmailAcknowledged = donor_el.EmailAcknowledged
					and isnull(recip_el.IssuedBy, '''') = isnull(donor_el.IssuedBy, '''')
					and coalesce(convert(nvarchar(255), donor_el.IssuedDate), 'NA') = coalesce(convert(nvarchar(255), recip_el.IssuedDate), 'NA')
					and coalesce(convert(nvarchar(255), donor_el.ExpirationDate), 'NA') = coalesce(convert(nvarchar(255), recip_el.ExpirationDate), 'NA')
				where donor_ee.CompanyID = '+@cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeLicenseDocument - O' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%P%'
		begin
			-- EmployeeOnboardDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeOnboard D1 on D1.CompanyID = T1.CompanyID and D1.EmployeeCode = T1.EmployeeCode
			left join '+@cDonorTablePath+'EmployeeOnboardDocument D2 on D2.EmployeeOnboardID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and isnull(R2.Title,0) = isnull(D3.Title,0) and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeOnboardDocument - P' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%Q%'
		begin
			-- EmployeeReviewDocument
			select @cmdShowDataDonor = 'select recip_er.ID as EmployeeReviewID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeReviewDocument donor_erd
			join '+@cDonorTablePath+'EmployeeReview donor_er on donor_er.ID = donor_erd.EmployeeReviewID
			join '+@cDonorTablePath+'ReviewType donor_rt on donor_rt.ID = donor_er.ReviewTypeID
			join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_er.EmployeeID
			join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_erd.DocumentID
			join '+@cRecipientTablePath+'Document recip_d
				on recip_d.FSRowGuid = donor_d.FSRowGuid
				and isnull(recip_d.Title, 0) = isnull(donor_d.Title,0)
				and recip_d.DocumentCategory = donor_d.DocumentCategory
				and recip_d.UploadDate = donor_d.UploadDate
			join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
			join '+@cRecipientTablePath+'ReviewType recip_rt
					on isnull(recip_rt.Code, '''') = isnull(donor_rt.Code, '''')
					and isnull(recip_rt.Description, '''') = isnull(donor_rt.Description, '''')
				join '+@cRecipientTablePath+'EmployeeReview recip_er
					on recip_er.ReviewTypeID = recip_rt.ID
					and recip_er.EmployeeID = recip_ee.ID
					and recip_er.EmailAcknowledged = donor_er.EmailAcknowledged
					and coalesce(convert(nvarchar(255), donor_er.ScheduledDate), 'NA') = coalesce(convert(nvarchar(255), recip_er.ScheduledDate), 'NA')
					and coalesce(convert(nvarchar(255), donor_er.CompletedDate), 'NA') = coalesce(convert(nvarchar(255), recip_er.CompletedDate), 'NA')
			where donor_ee.CompanyID = '+ @cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID	

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeReviewDocument - Q' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%R%'
		begin
			-- EmployeeSkillDocument
			select @cmdShowDataDonor = 'select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeSkill D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeSkillDocument D2 on D2.EmployeeSkillID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and R2.Title = D3.Title and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeSkillDocument - R' as ShowData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%S%'
		begin
			-- CompanyLogoDocument
			select @cmdShowDataDonor = 'select '+@cRecipientCompany_ID+' as CompanyID, R2.ID as DocumentID
			from '+@cDonorTablePath+'CompanyLogoDocument T1
			left join '+@cDonorTablePath+'Document D2 on D2.ID = T1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.FSRowGuid = D2.FSRowGuid and R2.Title = D2.Title and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			where T1.CompanyID = '+ @cDonorCompany_ID

			exec (@cmdShowDataDonor)
			if @cShowStatement = 1
			begin
				print @cmdShowDataDonor
			end
			if @cVerbose_Ind = 1
			begin
				select 'CompanyLogoDocument - S' as ShowData
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
			----------------------Document by Company
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'Document (HRnextAccountID, CompanyID, EmployeeID, DocumentCategory, FSRowGuid, Title, Description, Extension, Size, UploadDate, IsPrivateDocument, IsPublishedToEmployee, Filename, ContentType, UploadByUsername, EmployeeOnboardID, ESignDate, ESignName, ATApplicationID, IsPublishedToManager, FSDocument, FSDocumentTN, Pointer, ExternalDocumentID)
			select T1.HRnextAccountID, case when T1.CompanyID is null then null else '+@cRecipientCompany_ID+' end, EmployeeID, DocumentCategory, FSRowGuid, Title, Description, Extension, Size, UploadDate, IsPrivateDocument, IsPublishedToEmployee, Filename, ContentType, UploadByUsername, EmployeeOnboardID, ESignDate, ESignName, ATApplicationID, IsPublishedToManager, FSDocument, FSDocumentTN, Pointer, ExternalDocumentID
			from '+@cDonorTablePath+'Document T1
			where T1.CompanyID = '+ @cDonorCompany_ID+' and EmployeeID is null'

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Document by Company - A' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			-----------------Document by Employee
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'Document (HRnextAccountID, CompanyID, EmployeeID, DocumentCategory, FSRowGuid, Title, Description, Extension, Size, UploadDate, IsPrivateDocument, IsPublishedToEmployee, Filename, ContentType, UploadByUsername, EmployeeOnboardID, ESignDate, ESignName, ATApplicationID, IsPublishedToManager, FSDocument, FSDocumentTN, Pointer, ExternalDocumentID)
			select T1.HRnextAccountID, case when T1.CompanyID is null then null else '+@cRecipientCompany_ID+' end, R1.ID, DocumentCategory, FSRowGuid, Title, Description, Extension, Size, UploadDate, IsPrivateDocument, IsPublishedToEmployee, Filename, ContentType, UploadByUsername, R2.ID, ESignDate, T1.ESignName, R3.ID, IsPublishedToManager, FSDocument, FSDocumentTN, Pointer, ExternalDocumentID
			from '+@cDonorTablePath+'Document T1
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+@cRecipientTablePath+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left outer join '+@cDonorTablePath+'EmployeeOnboard D2 on D2.CompanyID = D1.CompanyID and D2.ID = T1.EmployeeOnboardID
			left outer join '+@cRecipientTablePath+'EmployeeOnboard R2 on R2.CompanyID = R1.CompanyID and R2.EmployeeCode = D2.EmployeeCode
			left outer join '+@cDonorTablePath+'ATApplication D3 on D3.ID = T1.ATApplicationID
			Left outer join '+@cRecipientTablePath+'ATApplication R3 on R3.ATApplicationKey = D3.ATApplicationKey
			where D1.CompanyID = '+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Document by Employee - B' as InsertData
			end
		end

		--The second section is to correlate the Primary table to the Document thru the intermediary table (if required)

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			----------------------AnnouncementDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'AnnouncementDocument (AnnouncementID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Announcement T1
			left join '+@cDonorTablePath+'AnnouncementDocument D1 on D1.AnnouncementID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Announcement R3 on R3.PostDate = T1.PostDate and isnull(R3.PostTitle,0) = isnull(T1.PostTitle,0)
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'AnnouncementDocument - C' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			----------------------BenefitPlan
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'BenefitPlanDocument (PlanID, DocumentID)
			select R2.ID as PlanID, R1.ID as DocumentID from '+@cDonorTablePath+'BenefitPlanDocument T1
			join '+@cDonorTablePath+'BenefitPlan D1 on D1.ID = T1.PlanID
			join '+@cDonorTablePath+'Document D2 on D2.ID = T1.DocumentID
			join '+@cRecipientTablePath+'Document R1 on R1.FSRowGuid = D2.FSRowGuid and R1.Title = D2.Title and R1.DocumentCategory = D2.DocumentCategory and R1.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'BenefitPlan R2 on R2.Code = D1.Code and R2.Description = D1.Description and R2.PolicyNumber = D1.PolicyNumber and isnull(R2.StartDate, '''') = isnull(D1.StartDate, '''') and isnull(R2.EndDate, '''') = isnull(D1.EndDate, '''')
			where D1.CompanyID = '+ @cDonorCompany_ID+' and R2.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'BenefitPlan - D' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			---------------EmployeeI9Document
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeI9Document (EmployeeID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeI9Document D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeI9Document - E' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-- EmployeeBCDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeBCDocument (EmployeeID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeBCDocument D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeBCDocument - F' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			----------- EmployeeEsignCompanyDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeEsignCompanyDocument (EmployeeID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeEsignCompanyDocument D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEsignCompanyDocument - G' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			----------- EmployeePhotoDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeePhotoDocument (EmployeeID, DocumentID)
			select distinct R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeePhotoDocument D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'Document D2 on D2.ID = D1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeePhotoDocument - H' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
		begin
			-----------EmployeeW4 Direct Connect to Document
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'EmployeeW4 (EmployeeID, ApprovalStatus, W4_BOX1_FirstName, W4_BOX1_LastName, W4_BOX1_MiddleInitial, W4_BOX1_Address1, W4_BOX1_City, W4_BOX1_CountryStateTypeID, W4_BOX1_Zip, W4_BOX2_SSN, W4_BOX3_IsSingle, W4_BOX3_IsMarried, W4_BOX3_IsMarriedButWHAtHigherSingleRate, W4_BOX4_IsNameDifferentFromSSCard, W4_BOX5_TotalAllowances, W4_BOX6_AdditionalAmountWH, W4_BOX7_IsExempt, W4_BOX7_ExemptText, W4_EsignName, W4_EsignFormDate, W4_EsignStamptedDateTime, ApprovedDate, ApprovedRejectedByHRNextUserID, DocumentID, W4_FirstName, W4_LastName, W4_MiddleInitial, W4_Address1, W4_City, W4_CountryStateTypeID, W4_Zip, W4_SSN, W4_MaritalStatus, W4_HigherRate, W4_DependentsUnderSeventeen, W4_OtherDependents, W4_OtherIncome, W4_AdditionalDeductions, W4_ExtraWithholding, W4_Exempt, W4_OtherTaxCredits)
			select R1.ID, T1.ApprovalStatus, T1.W4_BOX1_FirstName, T1.W4_BOX1_LastName, T1.W4_BOX1_MiddleInitial, T1.W4_BOX1_Address1, T1.W4_BOX1_City, T1.W4_BOX1_CountryStateTypeID, T1.W4_BOX1_Zip, T1.W4_BOX2_SSN, T1.W4_BOX3_IsSingle, T1.W4_BOX3_IsMarried, T1.W4_BOX3_IsMarriedButWHAtHigherSingleRate, T1.W4_BOX4_IsNameDifferentFromSSCard, T1.W4_BOX5_TotalAllowances, T1.W4_BOX6_AdditionalAmountWH, T1.W4_BOX7_IsExempt, T1.W4_BOX7_ExemptText, T1.W4_EsignName, T1.W4_EsignFormDate, T1.W4_EsignStamptedDateTime, T1.ApprovedDate, R3.ID, R2.ID, T1.W4_FirstName, T1.W4_LastName, T1.W4_MiddleInitial, T1.W4_Address1, T1.W4_City, T1.W4_CountryStateTypeID, T1.W4_Zip, T1.W4_SSN, T1.W4_MaritalStatus, T1.W4_HigherRate, T1.W4_DependentsUnderSeventeen, T1.W4_OtherDependents, T1.W4_OtherIncome, T1.W4_AdditionalDeductions, T1.W4_ExtraWithholding, T1.W4_Exempt, T1.W4_OtherTaxCredits
			from '+@cDonorTablePath+'EmployeeW4 T1 
			join '+@cDonorTablePath+'Employee D1 on D1.ID = T1.EmployeeID
			left outer join '+trim(@cRecipientTablePath)+'Employee R1 on R1.EmployeeCode = D1.EmployeeCode
			left join '+@cDonorTablePath+'Document D2 on D2.ID = T1.DocumentID
			join '+trim(@cRecipientTablePath)+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			left outer join '+@cDonorTablePath+'HRnextUser D3 on D3.ID = T1.ApprovedRejectedByHRNextUserID
			left outer join '+trim(@cRecipientTablePath)+'HRnextUser R3 on R3.Username = D3.Username
			where D1.CompanyID ='+ @cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeW4 - I' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%J%'
		begin
			-- EmployeeAbsenceDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeAbsenceDocument (EmployeeAbsenceID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeAbsence D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeAbsenceDocument D2 on D2.EmployeeAbsenceID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and isnull(R2.Title,0) = isnull(D3.Title,0) and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAbsenceDocument - J' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%K%'
		begin
			-- EmployeeAchievementDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeAchievementDocument (EmployeeAchievementID, DocumentID)
			select recip_ea.ID as EmployeeAchievementID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeAchievementDocument donor_ead
			join '+@cDonorTablePath+'EmployeeAchievement donor_ea on donor_ea.ID = donor_ead.EmployeeAchievementID
			join '+@cDonorTablePath+'AchievementType donor_at on donor_at.ID = donor_ea.AchievementTypeID
			join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_ea.EmployeeID
			join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_ead.DocumentID
			join '+@cRecipientTablePath+'Document recip_d
				on recip_d.FSRowGuid = donor_d.FSRowGuid
				and isnull(recip_d.Title, 0) = isnull(donor_d.Title,0)
				and recip_d.DocumentCategory = donor_d.DocumentCategory
				and recip_d.UploadDate = donor_d.UploadDate
			join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
			join '+@cRecipientTablePath+'AchievementType recip_at
					on isnull(recip_at.Code, '''') = isnull(donor_at.Code, '''')
					and isnull(recip_at.Description, '''') = isnull(donor_at.Description, '''')
				join '+@cRecipientTablePath+'EmployeeAchievement recip_ea
					on recip_ea.AchievementTypeID = recip_at.ID
					and recip_ea.EmployeeID = recip_ee.ID
					and isnull(recip_ea.Notes, '''') = isnull(donor_ea.Notes, '''')
					and coalesce(convert(nvarchar(255), donor_ea.AwardedDate), 'NA') = coalesce(convert(nvarchar(255), recip_ea.AwardedDate), 'NA')
					and coalesce(convert(nvarchar(255), donor_ea.ExpirationDate), 'NA') = coalesce(convert(nvarchar(255), recip_ea.ExpirationDate), 'NA')
			where donor_ee.CompanyID = '+ @cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeAchievementDocument - K' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%L%'
		begin
			-- EmployeeBenefitDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeBenefitDocument (EmployeeBenefitID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeBenefit D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeBenefitDocument D2 on D2.EmployeeBenefitID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and isnull(R2.Title,0) = isnull(D3.Title,0) and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeBenefitDocument - L' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%M%'
		begin
			-- EmployeeCertificateDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeCertificateDocument (EmployeeCertificateID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeCertificate D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeCertificateDocument D2 on D2.EmployeeCertificateID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and isnull(R2.Title,0) = isnull(D3.Title,0) and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeCertificateDocument - M' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%N%'
		begin
			-- EmployeeEnrolledClassDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeEnrolledClassDocument (EmployeeEnrolledClassID, DocumentID)
			select recip_eec.ID as EmployeeEnrolledClassID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeEnrolledClassDocument donor_eecd
			join '+@cDonorTablePath+'EmployeeEnrolledClass donor_eec on donor_eec.ID = donor_eecd.EmployeeEnrolledClassID
			join '+@cDonorTablePath+'HRnextClass donor_c on donor_c.ID = donor_eec.ClassID
			join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_eec.EmployeeID
			join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_eecd.DocumentID
			join '+@cRecipientTablePath+'Document recip_d
				on recip_d.FSRowGuid= donor_d.FSRowGuid
				and isnull(recip_d.Title, 0) = isnull(donor_d.Title,0)
				and recip_d.DocumentCategory = donor_d.DocumentCategory
				and recip_d.UploadDate = donor_d.UploadDate
			join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
			join '+@cRecipientTablePath+'HRnextClass recip_c
					on isnull(recip_c.Title, '''') = isnull(donor_c.Title, '''')
					and isnull(recip_c.Description, '''') = isnull(donor_c.Description, '''')
				join '+@cRecipientTablePath+'EmployeeEnrolledClass recip_eec
					on recip_eec.ClassID = recip_c.ID
					and recip_eec.EmployeeID = recip_ee.ID
					and isnull(recip_eec.GradeOrResult, '''') = isnull(donor_eec.GradeOrResult, '''')
					and isnull(recip_eec.Notes, '''') = isnull(donor_eec.Notes, '''')
					and isnull(recip_eec.EmailAcknowledged, 0) = isnull(donor_eec.EmailAcknowledged, 0)
					and coalesce(convert(nvarchar(255), recip_eec.CompletionDate), 'NA') = coalesce(convert(nvarchar(255), donor_eec.CompletionDate), 'NA')
					and coalesce(convert(nvarchar(255), recip_eec.ExpirationDate), 'NA') = coalesce(convert(nvarchar(255), donor_eec.ExpirationDate), 'NA')
			where donor_ee.CompanyID = '+ @cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID		

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeEnrolledClassDocument - N' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%O%'
		begin
			-- EmployeeLicenseDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeLicenseDocument (EmployeeLicenseID, DocumentID)
				select recip_el.ID as EmployeeLicenseID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeLicenseDocument donor_eld
				join '+@cDonorTablePath+'EmployeeLicense donor_el on donor_el.ID = donor_eld.EmployeeLicenseID
				join '+@cDonorTablePath+'LicenseType donor_lt on donor_lt.ID = donor_el.LicenseTypeID
				join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_el.EmployeeID
				join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_eld.DocumentID
				join '+@cRecipientTablePath+'Document recip_d
					on recip_d.FSRowGuid = donor_d.FSRowGuid
					and isnull(recip_d.Title,0) = isnull(donor_d.Title,0)
					and recip_d.DocumentCategory = donor_d.DocumentCategory
					and recip_d.UploadDate = donor_d.UploadDate
				join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
				join '+@cRecipientTablePath+'LicenseType recip_lt
					on isnull(recip_lt.Code, '''') = isnull(donor_lt.Code, '''')
					and isnull(recip_lt.Description, '''') = isnull(donor_lt.Description, '''')
				join '+@cRecipientTablePath+'EmployeeLicense recip_el
					on recip_el.LicenseTypeID = recip_lt.ID
					and isnull(recip_el.LicenseNumber, '''') = isnull(donor_el.LicenseNumber, '''')
					and recip_el.EmployeeID = recip_ee.ID
					and isnull(recip_el.Notes, '''') = isnull(donor_el.Notes, '''')
					and recip_el.EmailAcknowledged = donor_el.EmailAcknowledged
					and isnull(recip_el.IssuedBy, '''') = isnull(donor_el.IssuedBy, '''')
					and coalesce(convert(nvarchar(255), donor_el.IssuedDate), 'NA') = coalesce(convert(nvarchar(255), recip_el.IssuedDate), 'NA')
					and coalesce(convert(nvarchar(255), donor_el.ExpirationDate), 'NA') = coalesce(convert(nvarchar(255), recip_el.ExpirationDate), 'NA')
				where donor_ee.CompanyID = '+@cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeLicenseDocument - O' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%P%'
		begin
			-- EmployeeOnboardDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeOnboardDocument (EmployeeOnboardID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeOnboard D1 on D1.CompanyID = T1.CompanyID and D1.EmployeeCode = T1.EmployeeCode
			left join '+@cDonorTablePath+'EmployeeOnboardDocument D2 on D2.EmployeeOnboardID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and isnull(R2.Title,0) = isnull(D3.Title,0) and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeOnboardDocument - P' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%Q%'
		begin
			-- EmployeeReviewDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeReviewDocument (EmployeeReviewID, DocumentID)
		  select recip_er.ID as EmployeeReviewID, recip_d.ID as DocumentID from '+@cDonorTablePath+'EmployeeReviewDocument donor_erd
			join '+@cDonorTablePath+'EmployeeReview donor_er on donor_er.ID = donor_erd.EmployeeReviewID
			join '+@cDonorTablePath+'ReviewType donor_rt on donor_rt.ID = donor_er.ReviewTypeID
			join '+@cDonorTablePath+'Employee donor_ee on donor_ee.ID = donor_er.EmployeeID
			join '+@cDonorTablePath+'Document donor_d on donor_d.ID = donor_erd.DocumentID
			join '+@cRecipientTablePath+'Document recip_d
				on recip_d.FSRowGuid = donor_d.FSRowGuid
				and isnull(recip_d.Title, 0) = isnull(donor_d.Title,0)
				and recip_d.DocumentCategory = donor_d.DocumentCategory
				and recip_d.UploadDate = donor_d.UploadDate
			join '+@cRecipientTablePath+'Employee recip_ee on recip_ee.EmployeeCode = donor_ee.EmployeeCode
			join '+@cRecipientTablePath+'ReviewType recip_rt
					on isnull(recip_rt.Code, '''') = isnull(donor_rt.Code, '''')
					and isnull(recip_rt.Description, '''') = isnull(donor_rt.Description, '''')
				join '+@cRecipientTablePath+'EmployeeReview recip_er
					on recip_er.ReviewTypeID = recip_rt.ID
					and recip_er.EmployeeID = recip_ee.ID
					and recip_er.EmailAcknowledged = donor_er.EmailAcknowledged
					and coalesce(convert(nvarchar(255), donor_er.ScheduledDate), 'NA') = coalesce(convert(nvarchar(255), recip_er.ScheduledDate), 'NA')
					and coalesce(convert(nvarchar(255), donor_er.CompletedDate), 'NA') = coalesce(convert(nvarchar(255), recip_er.CompletedDate), 'NA')
			where donor_ee.CompanyID = '+ @cDonorCompany_ID+' and recip_ee.CompanyID = '+@cRecipientCompany_ID	

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeReviewDocument - Q' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%R%'
		begin
			-- EmployeeSkillDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'EmployeeSkillDocument (EmployeeSkillID, DocumentID)
			select R3.ID as NewTableID, R2.ID as NewDocumentID
			from '+@cDonorTablePath+'Employee T1
			join '+@cDonorTablePath+'EmployeeSkill D1 on D1.EmployeeID = T1.ID
			left join '+@cDonorTablePath+'EmployeeSkillDocument D2 on D2.EmployeeSkillID = T1.ID
			left join '+@cDonorTablePath+'Document D3 on D3.ID = D2.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D3.FSRowGuid and isnull(R2.Title,0) = isnull(D3.Title,0) and R2.DocumentCategory = D3.DocumentCategory and R2.UploadDate = D3.UploadDate
			join '+@cRecipientTablePath+'Employee R3 on R3.EmployeeCode = T1.EmployeeCode
			where T1.CompanyID = '+ @cDonorCompany_ID+' and R3.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'EmployeeSkillDocument - R' as InsertData
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%S%'
		begin
			-- CompanyLogoDocument
			select @cmdInsert = 'insert into '+@cRecipientTablePath+'CompanyLogoDocument (CompanyID, DocumentID)
			select '+@cRecipientCompany_ID+' as CompanyID, R2.ID as DocumentID
			from '+@cDonorTablePath+'CompanyLogoDocument T1
			left join '+@cDonorTablePath+'Document D2 on D2.ID = T1.DocumentID
			join '+@cRecipientTablePath+'Document R2 on R2.FSRowGuid = D2.FSRowGuid and R2.FSRowGuid = D2.FSRowGuid and isnull(R2.Title,0) = isnull(D2.Title,0) and R2.DocumentCategory = D2.DocumentCategory and R2.UploadDate = D2.UploadDate
			where T1.CompanyID = '+ @cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				print @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'CompanyLogoDocument - S' as InsertData
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

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_Documents_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_Documents_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_Documents_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_Documents_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_Documents_V1 to public */
	grant execute on dbo.usp_EIN_Cons_Documents_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_Documents_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_Documents_V1.sql 
-----------------------------------------------------------------*/